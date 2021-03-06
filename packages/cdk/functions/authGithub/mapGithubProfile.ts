import { GithubParameters, User } from 'types';
import fetch from 'node-fetch';

export default async function mapGithubProfile(
  {
    id,
    name,
    login,
    plan,
    repos_url,
    followers,
    created_at,
    owned_private_repos,
    public_repos,
    avatar_url,
  }: User,
  headers: { authorization: string },
): Promise<{ id: string; github: User & GithubParameters }> {
  const reposResponse = await fetch(repos_url, { headers });
  const reposData = (await reposResponse.json()) as any;
  const receivedStars = reposData.reduce(
    (acc: number, repo: any) => acc + repo.stargazers_count,
    0,
  );

  return {
    id,
    github: {
      id,
      name,
      username: login,
      proPlan: plan.name === 'pro',
      followers,
      receivedStars,
      created_at,
      owned_private_repos,
      public_repos,
      avatar_url,
    },
  };
}
