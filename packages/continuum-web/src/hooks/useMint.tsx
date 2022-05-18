import { Contract, Signer } from 'ethers';
import { useCallback, useState } from 'react';
import { abi as ContinuumABI } from 'contracts/Continuum.json';
import createIdentity from '@interep/identity';
import { genWitness, genProof, packToSolidityProof } from 'utils/zkp';
import { useContentState, useContentUpdate } from 'contexts/ContentContext';
import { selectedChain } from 'utils/selectedChain';

type ReturnParameters = {
  mint: (
    signer: Signer,
    groupId: string,
    groupNullifier: string,
    commitmentId?: string,
  ) => Promise<unknown>;
  mintStatus: string | null;
};

const fetchMetadata = async (address: string, groupId: string) => {
  const metadataBody = JSON.stringify({
    address,
    groupId,
  });
  const metadata = await (
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metadata`, {
      method: 'POST',
      body: metadataBody,
    })
  ).json();
  console.log(metadata);
  if (!metadata.url) {
    console.log('failed to create metadata', metadata);
    throw new Error('failed to upload');
  }
  return metadata;
};
export default function useMint(): ReturnParameters {
  const [mintStatus, setMintStatus] = useState<string | null>(null);
  const contentData = useContentState();
  const setContentData = useContentUpdate();
  const mint = useCallback(
    async (
      signer: Signer,
      groupId: string,
      groupNullifier: string,
      commitmentId?: string,
    ) => {
      setMintStatus('Collecting commitments... ');
      try {
        const identity = await createIdentity(
          (message: string) => signer.signMessage(message),
          groupId,
        );
        const identityCommitment = identity.genIdentityCommitment().toString();
        const signal = 'continuum';

        const zkFiles = {
          wasmFilePath: './semaphore.wasm',
          zkeyFilePath: './semaphore_final.zkey',
        };
        console.log('=== tt', { groupId, identityCommitment });
        // Step 1 fetch leaves
        const result = await (
          await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL
            }/merkleTree/proof?groupId=${encodeURIComponent(
              groupId,
            )}&identityCommitment=${identityCommitment}`,
          )
        ).json();
        console.log(result.merkleProof);
        setMintStatus('Generating proof... ');
        // Step 2 Generate MerkleTree & MerkleProof
        const witness = genWitness(
          identity.getTrapdoor(),
          identity.getNullifier(),
          result.merkleProof,
          BigInt(groupNullifier),
          signal,
        );

        console.log('====== generating proof', witness);
        // Step 3 Generate Proof

        // Step 4. generate meta data & upload to ipfs
        const pr = await Promise.all([
          genProof(witness, zkFiles.wasmFilePath, zkFiles.zkeyFilePath),
          fetchMetadata(await signer.getAddress(), groupId),
        ]);
        console.log(pr);

        const solidityProof = packToSolidityProof(pr[0].proof);
        // For now we have testnet only. 1337 is local host
        const contractAddress =
          selectedChain === '1337'
            ? '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
            : (process.env.NEXT_PUBLIC_CONTINUUM_CONTRACT as string);
        console.log(contractAddress);
        setMintStatus(`Verifying Proof and minting NFT... `);
        const contract = new Contract(contractAddress, ContinuumABI);
        const transaction = await contract
          .connect(signer)
          .mint(
            pr[0].publicSignals.merkleRoot,
            pr[0].publicSignals.nullifierHash,
            pr[0].publicSignals.externalNullifier,
            solidityProof,
            pr[1].url,
          );

        // Step 4 Update DB
        console.log(transaction.hash);
        console.log({ commitmentId });
        if (commitmentId) {
          const body = JSON.stringify({
            id: commitmentId,
            mintAddress: transaction.hash,
            metadata: pr[1].url,
          });
          const r = await (
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/commitment/update`,
              {
                method: 'POST',
                body,
              },
            )
          ).json();

          // Step5 Upate context
          const newContent = contentData.contents?.map(content => {
            if (content.groupId === groupId) {
              return {
                ...content,
                mintAddress: transaction.hash,
                metadata: pr[1].url,
              };
            }
            return content;
          });
          setContentData({ ...contentData, contents: newContent });
          return r;
        }
      } catch (error) {
        console.log(error);
      } finally {
        setMintStatus(null);
      }
    },
    [contentData, setContentData],
  );
  return {
    mintStatus,
    mint,
  };
}
