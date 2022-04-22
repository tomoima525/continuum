import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useVerify } from 'hooks/useVerify';
import { useEffect } from 'react';
import { CTA } from './CTA';
import { GithubContent } from './GithubContent';

export const Home = () => {
  const router = useRouter();
  const session = useSession();
  const address = session.data?.address as string;
  const [{ data: contents }, verifygithub] = useVerify();
  const code = router.query.code as string;

  useEffect(() => {
    console.log({ code, address });
    if (code && address) {
      // Start verification to refresh user data
      verifygithub({ code, address }).catch(e => {
        console.log(e);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, address]);

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

  return (
    <div className="max-w-7xl mx-auto py-10 md:py-3 h-full bg-proved-500">
      {contents ? <GithubContent contents={contents} /> : <CTA />}
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
