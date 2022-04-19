import { GithubUser } from 'types';
type Content = {
  key: string;
  title: string;
  message: string;
  showMintBtn: boolean;
};

export const mapGithubContents = (user: GithubUser) => {
  const contents: Content[] = [];
  contents.push({
    key: 'Header',
    title: `Data from Github`,
    message: 'Proof',
    showMintBtn: false,
  });
  const date = new Date(user.created_at);
  const now = new Date();
  const diff = now.getFullYear() - date.getFullYear();
  // TODO: more variations
  if (diff > 3) {
    contents.push({
      key: 'years',
      title: `Years on Github: ${diff}`,
      message: 'More Than 2 years',
      showMintBtn: true,
    });
  }

  contents.push({
    key: 'followers',
    title: `Followers: ${user.followers}`,
    message: 'More Than 10 followers',
    showMintBtn: true,
  });
  return contents;
};
