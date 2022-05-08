import Image from 'next/image';
import Link from 'next/link';
import { GradientBtn } from 'components/ui/GradientBtn';
import { shorten } from 'utils/commitment';
import { State } from 'contexts/ContentContext';
import { ReputationComponent } from './ReputationComponent';
import { ActionButton, Action } from './ActionButton';
import { useStopWatch } from 'hooks/useStopWatch';
import { Signer } from 'ethers';
import useGroups from 'hooks/useGroup';
import { useSession } from 'next-auth/react';
import { useSigner } from 'wagmi';
import useMint from 'hooks/useMint';

interface GithubContentProps {
  content: State;
}
export const GithubContent = (props: GithubContentProps) => {
  const session = useSession();
  const { seconds, start, reset } = useStopWatch();
  const { data: signer } = useSigner();
  const { addGroupStatus, generateIdentityCommitment, joinGroup } = useGroups();
  const { mintStatus, mint } = useMint();
  const address = session.data?.address as string;
  const githubRaw = props.content?.github;

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
    <div className="m-6 border-2 border-gray-100 bg-gray-900 rounded-md px-4 py-2 text-left text-white flex flex-col justify-between">
      <div className="flex flex-row justify-between">
        <div className="self-center flex flex-col w-full">
          <p className="text-xl mb-1">Your Github Profile</p>
          <p className="text-sm">
            Github data is stored only locally. It will be used for generating
            your proof.
          </p>
          {githubRaw && (
            <div className="my-3 gap-y-2 grid grid-cols-1 md:grid-cols-2 max-w-3xl">
              <div className="col-span-2 py-2">
                <Image
                  src={githubRaw.avatar_url || '/GitHub-Mark-64px.png'}
                  alt="github"
                  className="rounded-full bg-slate-50"
                  layout="intrinsic"
                  width={128}
                  height={128}
                  draggable="false"
                />
              </div>
              <p className="col-span-2">Name: {githubRaw.username}</p>
              <p>Account Created: {githubRaw.created_at}</p>
              <p>Followers: {githubRaw.followers}</p>
              <p>Total stars: {githubRaw.receivedStars}</p>
              <p>Public repos : {githubRaw.public_repos}</p>
            </div>
          )}
        </div>
        <Link
          passHref
          href={process.env.NEXT_PUBLIC_GITHUB_AUTH_LINK as string}
        >
          <GradientBtn onClick={() => {}}>
            <div className="flex flex-row gap-2 items-center">
              <p>Refresh</p>
              <Image
                src="/GitHub-Mark-64px.png"
                alt="github"
                className="rounded-2xl absolute z-10"
                layout="intrinsic"
                width={32}
                height={32}
                draggable="false"
              />
            </div>
          </GradientBtn>
        </Link>
      </div>
      <div className="py-3">
        {mintStatus && (
          <div className="text-xl self-center flex flex-row">
            (Typically takes 30 secs)
            <div className="self-center mx-2">
              <div className="animate-spin rounded-full px-2 self-center h-4 w-4 border-t-2 border-b-2 border-indigo-100" />
            </div>
            {mintStatus}: {seconds} sec passed
          </div>
        )}
        {addGroupStatus && (
          <div className="text-xl self-center flex flex-row">
            <div className="self-center mx-2">
              <div className="animate-spin rounded-full px-2 self-center h-4 w-4 border-t-2 border-b-2 border-indigo-100" />
            </div>
            {addGroupStatus}: {seconds} sec passed
          </div>
        )}
      </div>
      {props.content?.contents && (
        <div className="pt-4">
          <p className="text-xl mb-1">Reputation to reveal</p>
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {props.content.contents.map(content => (
              <li
                key={content.groupId}
                className="col-span-1 flex flex-col text-center bg-gray-800 rounded-lg shadow divide-y divide-gray-200"
              >
                <ReputationComponent
                  title={content.groupName}
                  revealStatus={
                    content.commitmentHash
                      ? `Yes (commitment: ${shorten(content.commitmentHash)})`
                      : 'No'
                  }
                  metadata={content.metadata}
                >
                  <ActionButton
                    disable={disable}
                    commitmentHash={content.commitmentHash}
                    mintAddress={content.mintAddress}
                    metadata={content.metadata}
                    handleAction={handleAction({
                      commitmentId: content.commitmentId,
                      groupId: content.groupId,
                      groupName: content.groupName,
                      groupNullifier: content.groupNullifier,
                    })}
                  />
                </ReputationComponent>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
