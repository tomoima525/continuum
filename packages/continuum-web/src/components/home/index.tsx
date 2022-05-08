import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useVerify } from 'hooks/useVerify';
import { useEffect } from 'react';
import { CTA } from './CTA';
import { GithubContent } from './GithubContent';
import { useContentState } from 'contexts/ContentContext';

export const Home = () => {
  const router = useRouter();
  const session = useSession();
  const contentData = useContentState();
  const address = session.data?.address as string;
  const [{ loading: verifyLoading }, verifygithub] = useVerify();
  const code = router.query.code as string;

  useEffect(() => {
    if (code && address) {
      // Start verification to refresh user data
      verifygithub({ code, address })
        .then(() => {
          router.replace('/home');
        })
        .catch(e => {
          console.log(e);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, address]);

  return (
    <div className="max-w-7xl mx-auto py-10 md:py-3 h-full bg-proved-500">
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 text-white">
          <div className="text-lg ">
            Reveal and prove your github reputation with zero-knowledge proof
          </div>
        </div>
        {contentData.contents ? (
          <GithubContent content={contentData} />
        ) : (
          <CTA loading={verifyLoading} />
        )}
      </main>
    </div>
  );
};
