import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useVerify } from 'hooks/useVerify';
import { useCallback, useEffect, useState } from 'react';
import { CTA } from './CTA';
import { Action, GithubContent } from './GithubContent';
import useGroups from 'hooks/useGroup';
import useMint from 'hooks/useMint';
import { Signer } from 'ethers';
import { useContentState } from 'contexts/ContentContext';
import { useSigner } from 'wagmi';
import { useStopWatch } from 'hooks/useStopWatch';

export const Home = () => {
  const router = useRouter();
  const session = useSession();
  const contentData = useContentState();
  const address = session.data?.address as string;
  const [{ loading: verifyLoading }, verifygithub] = useVerify(address);
  const [{ data: signer }] = useSigner();
  const { addGroupStatus, generateIdentityCommitment, joinGroup } = useGroups();
  const { mintStatus, mint } = useMint();
  const { seconds, start, reset } = useStopWatch();
  const code = router.query.code as string;

  useEffect(() => {
    if (code && address) {
      // Start verification to refresh user data
      verifygithub({ code, address })
        .then(() => {
          router.replace('/home');
        })
        .catch(e => {
          console.log(e);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, address]);

  const reveal = async (signer: Signer, groupId: string, groupName: string) => {
    start();
    const identityCommitment = await generateIdentityCommitment(
      signer,
      groupId,
    );
    if (identityCommitment) {
      // insert to a specific group off-chain
      console.log('=== address', address);
      await joinGroup(identityCommitment, groupId, groupName, address);
    }
    reset();
  };
  const proofAndMint = async (
    signer: Signer,
    groupId: string,
    groupNullifier: string,
    commitmentId?: string,
  ) => {
    start();
    console.log('===mint', groupNullifier);
    await mint(signer, groupId, groupNullifier, commitmentId);
    reset();
  };

  const handleAction =
    ({
      commitmentId,
      groupId,
      groupName,
      groupNullifier,
    }: {
      commitmentId?: string;
      groupId: string;
      groupName: string;
      groupNullifier: string;
    }) =>
    async (action: Action) => {
      if (!signer) {
        console.log('==== not ready', signer);
        return;
      }
      switch (action) {
        case Action.MINT:
          await proofAndMint(signer, groupId, groupNullifier, commitmentId);
          break;
        case Action.REVEAL:
          await reveal(signer, groupId, groupName);
          break;
      }
    };
  const disable =
    (addGroupStatus?.length || 0) > 0 || (mintStatus?.length || 0) > 0;
  return (
    <div className="max-w-7xl mx-auto py-10 md:py-3 h-full bg-proved-500">
      {contentData.contents ? (
        <GithubContent
          content={contentData}
          handleAction={handleAction}
          disable={disable}
        />
      ) : (
        <CTA loading={verifyLoading} />
      )}
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl pt-6 font-bold leading-tight text-white">
            Proof progress
          </h2>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Replace with your content */}
          <div className="px-4 py-8 sm:px-0">
            {mintStatus && (
              <div className="text-xl self-center flex flex-row text-white">
                <div className="self-center mx-2">
                  <div className="animate-spin rounded-full px-2 self-center h-4 w-4 border-t-2 border-b-2 border-indigo-100" />
                </div>
                {mintStatus}: {seconds} sec passed
              </div>
            )}
            {addGroupStatus && (
              <div className="text-xl self-center text-white flex flex-row">
                <div className="self-center mx-2">
                  <div className="animate-spin rounded-full px-2 self-center h-4 w-4 border-t-2 border-b-2 border-indigo-100" />
                </div>
                {addGroupStatus}: {seconds} sec passed
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
