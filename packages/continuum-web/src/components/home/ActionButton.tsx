import { DynamicColorBtn } from 'components/ui/DynamicColorBtn';
import { shorten } from 'utils/commitment';
import networks from 'utils/networks.json';

export enum Action {
  MINT,
  REVEAL,
}
interface ActionButtonProps {
  handleAction: (action: Action) => Promise<unknown>;
  commitmentHash: string | undefined;
  metadata?: string;
  mintAddress: string | undefined;
  disable?: boolean;
}
const ipfsToNftLink = (ipfs: string) => {
  return ipfs.replace('ipfs://', 'https://nftstorage.link/ipfs/');
};
const env = process.env.NEXT_PUBLIC_ENV as string;
const network =
  env === 'dev'
    ? networks[1666700000].blockExplorerUrls
    : networks[1666600000].blockExplorerUrls;

export const ActionButton = (props: ActionButtonProps) => {
  if (props.mintAddress) {
    const link = props?.metadata && ipfsToNftLink(props.metadata);
    return (
      <div className=" items-center">
        Minted
        <a href={`${network}tx/${props.mintAddress}`}>
          <div className="flex-shrink self-center justify-center items-center py-2 underline hover:text-gray-500">
            Tx: {shorten(props.mintAddress)}
          </div>
        </a>
        {props.metadata && (
          <a href={link}>
            <div className="flex-shrink self-center justify-center items-center underline hover:text-gray-500">
              ipfs: {shorten(props.metadata)}
            </div>
          </a>
        )}
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
