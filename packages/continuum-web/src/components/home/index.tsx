import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useVerify } from 'hooks/useVerify';
import { useEffect } from 'react';
import { CTA } from './CTA';
import { GithubContent } from './GithubContent';
import { GithubUser } from 'types';

const data: GithubUser = {
  created_at: '2013-12-28T17:01:03Z',
  followers: 184,
  id: '6277118',
  name: 'Tomoaki Imai',
  owned_private_repos: 7,
  proPlan: false,
  public_repos: 123,
  receivedStars: 154,
  username: 'tomoima525',
};

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
      {data ? <GithubContent user={data} /> : <CTA />}
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
