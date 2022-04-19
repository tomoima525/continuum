import type { NextPage } from 'next';
import { Layout } from 'components/Layout';
import { useRouter } from 'next/router';
import { LandingPage } from 'components/landing';
import { useSession } from 'next-auth/react';

const Main: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  if (session.status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="inline-block align-bottom bg-black rounded-lg text-left overflow-hidden shadow-xl transform sm:my-2 sm:align-middle sm:p-6">
            <div className="flex justify-center self-center">
              <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-indigo-500" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (session.status === 'authenticated') {
    router.replace('/home');
    return null;
  }

  // Not signed in
  return (
    <Layout>
      <LandingPage />
    </Layout>
  );
};

export default Main;
