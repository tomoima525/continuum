import Image from 'next/image';
import Link from 'next/link';
import { GradientBtn } from 'components/ui/GradientBtn';
import { Content } from 'types';
import { DynamicColorBtn } from 'components/ui/DynamicColorBtn';
import { shorten } from 'utils/commitment';

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
      <a href={`https://explorer.pops.one/tx/${props.mintAddress}`}>
        <div className="flex-shrink self-center justify-center items-center p-3 underline hover:text-gray-200">
          {shorten(props.mintAddress)}
        </div>
      </a>
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
  contents: Content[];
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
  return (
    <div className="m-6 border-2 border-gray-100 bg-gray-900 rounded-md px-4 py-2 text-left text-white flex flex-col justify-between">
      <div className="flex flex-row justify-between">
        <div className="self-center flex flex-col">
          <p className="text-xl mb-1">Your Github Profile</p>
          <p className="text-sm">
            Github data will be only stored locally. It will be used for
            generating your proof.
          </p>
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
      {props.contents && (
        <ul role="list" className="py-4">
          <li key="Header">
            <div className="flex flex-row border-b-2 border-gray-700 mb-3">
              <div className="flex-1">Data from Github</div>
              <div className="flex-1 text-left">Data Revealed</div>
            </div>
          </li>
          {props.contents.map(content => (
            <li key={content.groupId}>
              <div className="flex flex-row mb-2">
                <div className="flex-1">{content.groupName}</div>
                <div className="flex-1 text-left">
                  {content.commitmentHash
                    ? `Yes (commitment: ${shorten(content.commitmentHash)})`
                    : 'No'}
                </div>
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
