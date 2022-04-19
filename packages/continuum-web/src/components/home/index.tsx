import { GradientBtn } from 'components/ui/GradientBtn';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useVerify } from 'hooks/useVerify';
import { useEffect } from 'react';

export const Home = () => {
  const router = useRouter();
  const session = useSession();
  const [{ data: githubdata }, verifygithub] = useVerify();
  const code = router.query.code as string;

  useEffect(() => {
    console.log({ code });
    if (code) {
      // Start verification to refresh user data
      verifygithub({ code }).catch(e => {
        console.log(e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // TODO: fetch user's commitment
  // useEffect(() => {
  //   if (user.data?.address) {
  //     fetchData(user.data.address);
  //   }
  // }, [user.data?.address]);

  // const fetchData = async (id: string) => {
  //   try {
  //     const r = (await API.graphql({
  //       query: proofList,
  //       variables: {
  //         id,
  //       },
  //     })) as { data: ProofListQuery };
  //     if (r.data.proofList) {
  //       setProofs(r.data.proofList as Proof[]);
  //     }
  //   } catch (e) {
  //     console.log('==== fetchdata', e);
  //   }
  // };

  console.log({ session, githubdata });
  return (
    <div className="max-w-7xl mx-auto py-10 md:py-3 h-full bg-proved-500">
      <div className="m-6 border-2 border-gray-100 bg-gray-900 rounded-md px-4 py-2 text-left text-white flex flex-row justify-between">
        <div className="self-center flex flex-col">
          <p className="text-xl mb-1">
            Start claiming your work experience by authorizing on Github!
          </p>
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
              <p>Authenticate Github</p>
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
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl pt-6 font-bold leading-tight text-white">
            List of your proofs
          </h2>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Replace with your content */}
          <div className="px-4 py-8 sm:px-0">
            <div className="text-xl self-center text-white">No proofs yet!</div>
          </div>
        </div>
      </main>
    </div>
  );
};
