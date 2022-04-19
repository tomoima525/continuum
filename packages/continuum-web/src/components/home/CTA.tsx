import Image from 'next/image';
import Link from 'next/link';
import { GradientBtn } from 'components/ui/GradientBtn';

export const CTA = () => (
  <div className="m-6 border-2 border-gray-100 bg-gray-900 rounded-md px-4 py-2 text-left text-white flex flex-row justify-between">
    <div className="self-center flex flex-col">
      <p className="text-xl mb-1">
        Start claiming your work experience by authorizing on Github!
      </p>
      <p className="text-sm">
        Github data will be only stored locally. It will be used for generating
        your proof.
      </p>
    </div>
    <Link passHref href={process.env.NEXT_PUBLIC_GITHUB_AUTH_LINK as string}>
      <GradientBtn onClick={() => {}}>
        <div className="flex flex-row gap-2 items-center">
          <p>Connect Github</p>
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
);
