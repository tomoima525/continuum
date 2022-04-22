import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useVerify } from 'hooks/useVerify';
import { useCallback, useEffect } from 'react';
import { CTA } from './CTA';
import { Action, GithubContent } from './GithubContent';
import useGroups from 'hooks/useGroup';
import { Signer } from 'ethers';
import { useContentState } from 'contexts/ContentContext';
import { useSigner } from 'wagmi';

export const Home = () => {
  const router = useRouter();
  const session = useSession();
  const contentData = useContentState();
  const address = session.data?.address as string;
  const [, verifygithub] = useVerify();
  const [{ data: signer }] = useSigner();
  const {
    loading: groupLoading,
    generateIdentityCommitment,
    joinGroup,
  } = useGroups();
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

  const reveal = async (signer: Signer, groupId: string, groupName: string) => {
    const identityCommitment = await generateIdentityCommitment(
      signer,
      groupId,
    );

    if (identityCommitment) {
      // insert to a specific group off-chain
      await joinGroup(identityCommitment, groupId, groupName);
    }
  };
  const mint = async () => {};

  const handleAction =
    (groupId: string, groupName: string) => async (action: Action) => {
      if (!signer) {
        console.log('==== not ready', signer);
        return;
      }
      switch (action) {
        case Action.MINT:
          await mint();
          break;
        case Action.REVEAL:
          await reveal(signer, groupId, groupName);
          break;
      }
    };

  return (
    <div className="max-w-7xl mx-auto py-10 md:py-3 h-full bg-proved-500">
      {contentData.contents ? (
        <GithubContent
          contents={contentData.contents}
          handleAction={handleAction}
        />
      ) : (
        <CTA />
      )}
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
