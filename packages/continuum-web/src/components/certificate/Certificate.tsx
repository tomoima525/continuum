import Image from 'next/image';
import Content from './Content';

type Props = {
  walletname?: string;
  criteria?: string;
};

export default function Certificate({ walletname, criteria }: Props) {
  return (
    <div className="flex w-[467px] h-[400px] justify-between flex-col bg-gradient-to-tr from-pink-400 via-lime-400 to-teal-300 overflow-hidden rounded-2xl drop-shadow-xl ">
      <div className="text-3xl font-semibold self-center p-4">
        PROOF OF GITHUB REPUTATION
      </div>
      <div className="self-center flex-wrap">
        <Image
          src={'/GitHub-Mark-Light-120px.png'}
          alt="github"
          className="rounded-full"
          width={120}
          height={120}
        />
      </div>
      <div className="px-6 self-center">
        <Content walletname={walletname} criteria={criteria} />
      </div>
      <div className="p-4 self-end flex flex-row">
        <p className=" text-sm">Proved using Zero-knowledge proof</p>
        <Image alt="logo" width={196} height={24} src="/continuum-logo.svg" />
      </div>
    </div>
  );
}
