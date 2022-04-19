import type { NextApiRequest, NextApiResponse } from 'next';
import mapGithubProfile from 'oauth/mapGithubProfile';

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const requestBody = JSON.parse(req.body || '');
  const code = requestBody.code;
  const client_id = process.env.NEXT_AUTH_GITHUB_CLIENT_ID as string;
  const client_secret = process.env.NEXT_AUTH_GITHUB_CLIENT_SECRET as string;
  const redirect_uri = `${process.env.NEXTAUTH_URL}/home`;
  console.log({ code, client_id, client_secret, redirect_uri });
  try {
    const oauthResult = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        body: new URLSearchParams({
          client_id,
          client_secret,
          code,
          redirect_uri,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      },
    );

    const oauthData = await oauthResult.json();
    if (oauthData.error) {
      throw Error(oauthData.error_description);
    }

    const headers = {
      authorization: `${oauthData.token_type} ${oauthData.access_token}`,
    };
    const userResult = await (
      await fetch('https://api.github.com/user', {
        headers,
      })
    ).json();
    const mappedResult = await mapGithubProfile({ ...userResult }, headers);
    res.status(200).json(mappedResult as any);
  } catch (e) {
    console.log('===== verification error', e);
    res.status(400);
  }
}
