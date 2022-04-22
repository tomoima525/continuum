import { Commitment, Content, GithubUser, Group } from '@/types';

const calAccountCreation = (
  created_at: string,
  groups: Group[],
): Content | null => {
  const date = new Date(created_at);
  const now = new Date();
  const diff = now.getFullYear() - date.getFullYear();

  const matchCriteria = groups
    .filter(g => g.attr_key === 'created_at' && diff > g.criteria)
    .sort((a, b) => b.criteria - a.criteria);
  if (!matchCriteria.length) return null;

  return {
    groupId: matchCriteria[0].id,
    groupName: matchCriteria[0].name,
    groupNullifier: matchCriteria[0].nullifier,
  };
};

const calFollowers = (followers: number, groups: Group[]): Content | null => {
  const matchCriteria = groups
    .filter(g => g.attr_key === 'followers' && followers > g.criteria)
    .sort((a, b) => b.criteria - a.criteria);

  if (!matchCriteria.length) return null;
  return {
    groupId: matchCriteria[0].id,
    groupName: matchCriteria[0].name,
    groupNullifier: matchCriteria[0].nullifier,
  };
};

export const mergeContents = (
  github: GithubUser,
  commitments: Commitment[],
  groups: Group[],
): Content[] => {
  const contents: Content[] = [];

  // Followers
  const followContent = calFollowers(github.followers, groups);
  console.log('=====', followContent);
  if (followContent) {
    contents.push(followContent);
  }

  // Account Creation
  const accountContent = calAccountCreation(github.created_at, groups);
  console.log('=====', accountContent);
  if (accountContent) {
    contents.push(accountContent);
  }

  // merge commitments if exists
  const finalResult = contents.map(content => {
    const c = commitments.find(
      commitment => content.groupId === commitment.groupId,
    );
    return {
      ...content,
      commitmentHash: c?.hash,
      mintAddress: c?.mintAddress,
    };
  });

  return finalResult;
};