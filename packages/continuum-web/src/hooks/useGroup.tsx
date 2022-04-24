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
    address: string,
  ) => Promise<undefined | null>;
  addGroupStatus: string | null;
};

export default function useGroups(): ReturnParameters {
  const [addGroupStatus, setAddGroupStatus] = useState<string | null>(null);
  const contentData = useContentState();
  const setContentData = useContentUpdate();

  const generateIdentityCommitment = useCallback(
    async (signer: Signer, groupId: string): Promise<string | null> => {
      try {
        setAddGroupStatus('Generating Identity');

        const identity = await createIdentity(
          message => signer.signMessage(message),
          groupId,
        );
        const identityCommitment = identity.genIdentityCommitment();

        return identityCommitment.toString();
      } catch (error) {
        console.error(error);

        return null;
      } finally {
        setAddGroupStatus(null);
      }
    },
    [],
  );

  const joinGroup = useCallback(
    async (
      identityCommitment: string,
      groupId: string,
      groupName: string,
      address: string,
    ) => {
      try {
        setAddGroupStatus('Revealing status...');
        const body = JSON.stringify({
          identityCommitment,
          groupId,
          groupName,
          address,
        });
        console.log(body);
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
      } catch (error) {
        console.error(error);

        return null;
      } finally {
        setAddGroupStatus(null);
      }
    },
    [contentData, setContentData],
  );

  return {
    addGroupStatus,
    generateIdentityCommitment,
    joinGroup,
  };
}
