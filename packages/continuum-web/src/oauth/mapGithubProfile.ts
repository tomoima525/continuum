import { GithubParameters, User } from 'types';

export default async function mapGithubProfile({
  id,
  name,
  login,
  plan,
  repos_url,
  followers,
  created_at,
  owned_private_repos,
  public_repos,
}: User): Promise<{ id: string; github: User & GithubParameters }> {
  const reposResponse = await fetch(repos_url);
  const reposData = await reposResponse.json();
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
    },
  };
}
