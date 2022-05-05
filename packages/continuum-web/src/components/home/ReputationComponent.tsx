import Image from 'next/image';

interface Props {
  title: string;
  revealStatus: string;
  imageUrl?: string;
  children: React.ReactNode;
}
export const ReputationComponent = (props: Props) => {
  return (
    <div>
      <div className="flex-1 flex flex-col p-4 justify-center">
        <div className="w-auto">
          <Image
            className="rounded-xl"
            src={props?.imageUrl || '/not-minted.jpg'}
            width={180}
            height={180}
            alt="img"
          />
        </div>
        <h3 className="mt-6 text-lg font-medium">{props.title}</h3>
        <div className="text-gray-300 text-m">{props.revealStatus}</div>
        <div className="p-2 self-center">{props.children}</div>
      </div>
    </div>
  );
};
