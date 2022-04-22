import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import fetch from 'node-fetch';
import mapGithubProfile from './mapGithubProfile';
import { GithubUser, User } from '@/types';
import {
  commitmentsQuery,
  commitmentsQueryByAddress,
  groupsQuery,
} from '/opt/nodejs/dynamodb-utils';
import { mergeContents } from './mergeContents';

const s3 = new AWS.S3();

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

interface OAuth {
  token_type: string;
  access_token: string;
  error?: string;
  error_description?: string;
}

const secretManager = new AWS.SecretsManager();

export const getSecret = async (SecretId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    secretManager.getSecretValue(
      {
        SecretId,
      },
      (err, data) => {
        if (err) {
          console.log(`secret failed ${err}`);
          reject(err);
          return;
        }
        // Decrypts secret using the associated KMS key.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
          const json = JSON.parse(data.SecretString as string);
          resolve(json.PK);
          return;
        }
        reject('No secret');
      },
    );
  });
};

export const handler = async function (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestBody = JSON.parse(event.body || '');
  const code = requestBody?.code;
  const address = requestBody?.address;
  const isLocal = requestBody?.isLocal;
  const client_id = process.env.GITHUB_CLIENT_ID as string;
  const client_secret = await getSecret('continuum_github_key');
  const redirect_uri = isLocal
    ? `http://localhost:3000/home`
    : (process.env.REDIRECT_URL as string) + '/home';
  const tableName = process.env.TableName as string;
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

    const oauthData = (await oauthResult.json()) as OAuth;
    if (oauthData.error) {
      throw Error(oauthData.error_description);
    }

    const githubheaders = {
      authorization: `${oauthData.token_type} ${oauthData.access_token}`,
    };

    const userResult = (await (
      await fetch('https://api.github.com/user', {
        headers: githubheaders,
      })
    ).json()) as User;

    const mappedResult = await mapGithubProfile(
      { ...userResult },
      githubheaders,
    );
    // Check if commitments exist from userId
    const commitments = await commitmentsQueryByAddress(address, tableName);

    // Groups
    const groups = await groupsQuery(tableName);
    console.log('=====', mappedResult.github, commitments, groups);
    // merge it
    const contents = mergeContents(mappedResult.github, commitments, groups);

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify({
        contents,
      }),
    };
  } catch (e) {
    console.log('===== verification error', e);
    return {
      headers,
      statusCode: 404,
      body: `Unknown error: ${e}`,
    };
  }
};
