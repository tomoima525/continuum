import createIdentity from '@interep/identity';
import { useContentState, useContentUpdate } from 'contexts/ContentContext';
import { Signer } from 'ethers';
import { useCallback, useState } from 'react';

type ReturnParameters = {
  // hasJoinedAGroup: (groupId: string) => Promise<boolean | null>;
  generateIdentityCommitment: (
    signer: Signer,
    groupId: string,
  ) => Promise<string | null>;

  joinGroup: (
    identityCommitment: string,
    groupId: string,
    groupName: string,
  ) => Promise<true | null>;
  loading: boolean;
};

export default function useGroups(): ReturnParameters {
  const [loading, setLoading] = useState<boolean>(false);
  const contentData = useContentState();
  const setContentData = useContentUpdate();

  const generateIdentityCommitment = useCallback(
    async (signer: Signer, groupId: string): Promise<string | null> => {
      try {
        setLoading(true);

        const identity = await createIdentity(
          message => signer.signMessage(message),
          groupId,
        );
        const identityCommitment = identity.genIdentityCommitment();

        setLoading(false);
        return identityCommitment.toString();
      } catch (error) {
        console.error(error);

        setLoading(false);
        return null;
      }
    },
    [],
  );

  const joinGroup = useCallback(
    async (identityCommitment: string, groupId: string, groupName: string) => {
      try {
        setLoading(true);
        const body = JSON.stringify({
          identityCommitment,
          groupId,
          groupName,
        });
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merkleTree/append`, {
          method: 'POST',
          body,
        });

        // update commitments
        const newContent = contentData.contents?.map(content => {
          if (content.groupId === groupId) {
            return {
              ...content,
              commitmentHash: identityCommitment,
            };
          }
          return content;
        });

        setContentData({ contents: newContent });
        setLoading(false);
      } catch (error) {
        console.error(error);

        setLoading(false);
        return null;
      }
    },
    [contentData, setContentData],
  );

  return {
    loading,
    generateIdentityCommitment,
    joinGroup,
  };
}
