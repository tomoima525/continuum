import Image from 'next/image';
import Link from 'next/link';
import { GradientBtn } from 'components/ui/GradientBtn';
import { DynamicColorBtn } from 'components/ui/DynamicColorBtn';
import { shorten } from 'utils/commitment';
import { State } from 'contexts/ContentContext';
import { ReputationComponent } from './ReputationComponent';

export enum Action {
  MINT,
  REVEAL,
}
interface ActionButtonProps {
  handleAction: (action: Action) => Promise<unknown>;
  commitmentHash: string | undefined;
  mintAddress: string | undefined;
  disable?: boolean;
}

const ActionButton = (props: ActionButtonProps) => {
  if (props.mintAddress) {
    return (
      <div className=" items-center">
        Minted
        <a href={`https://explorer.pops.one/tx/${props.mintAddress}`}>
          <div className="flex-shrink self-center justify-center items-center p-2 underline hover:text-gray-500">
            Tx: {shorten(props.mintAddress)}
          </div>
        </a>
      </div>
    );
  }
  const { handleAction } = props;

  if (props.commitmentHash) {
    return (
      <DynamicColorBtn
        disabled={props.disable}
        onClick={async () => await handleAction(Action.MINT)}
      >
        Mint NFT
      </DynamicColorBtn>
    );
  }

  return (
    <DynamicColorBtn
      disabled={props.disable}
      onClick={async () => await handleAction(Action.REVEAL)}
    >
      Reveal Data
    </DynamicColorBtn>
  );
};

interface GithubContentProps {
  content: State;
  disable?: boolean;
  handleAction: ({
    commitmentId,
    groupId,
    groupName,
    groupNullifier,
  }: {
    commitmentId?: string;
    groupId: string;
    groupName: string;
    groupNullifier: string;
  }) => (action: Action) => Promise<unknown>;
}
export const GithubContent = (props: GithubContentProps) => {
  const { handleAction } = props;
  const githubRaw = props.content?.github;
  return (
    <div className="m-6 border-2 border-gray-100 bg-gray-900 rounded-md px-4 py-2 text-left text-white flex flex-col justify-between">
      <div className="flex flex-row justify-between">
        <div className="self-center flex flex-col w-full">
          <p className="text-xl mb-1">Your Github Profile</p>
          <p className="text-sm">
            Github data will be only stored locally. It will be used for
            generating your proof.
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
                >
                  <ActionButton
                    disable={props.disable}
                    commitmentHash={content.commitmentHash}
                    mintAddress={content.mintAddress}
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
