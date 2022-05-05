import { IPFSImage } from 'components/ui/IPFSImage';

interface Props {
  title: string;
  revealStatus: string;
  metadata?: string;
  children: React.ReactNode;
}
export const ReputationComponent = (props: Props) => {
  return (
    <div>
      <div className="flex-1 flex flex-col p-4 justify-center">
        <div className="w-auto">
          <IPFSImage metadataUrl={props.metadata} size={180} />
        </div>
        <h3 className="mt-6 text-lg font-medium">{props.title}</h3>
        <div className="text-gray-300 text-m">
          Revealed?: {props.revealStatus}
        </div>
        <div className="p-2 self-center">{props.children}</div>
      </div>
    </div>
  );
};
