import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCsrfToken } from 'next-auth/react';
import { SiweMessage } from 'siwe';

const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_KEY as string,
  },
  region: process.env.NEXT_AUTH_AWS_REGION,
};

const docClient = DynamoDBDocument.from(new DynamoDBClient(config));

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const providers = [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || '{}'),
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL as string);
          if (siwe.domain !== nextAuthUrl.host) {
            return null;
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null;
          }

          await siwe.validate(credentials?.signature || '');
          // TODO: authorize openIdConnect here for IAM API access
          return {
            id: siwe.address,
          };
        } catch (e) {
          return null;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === 'GET' && req.query.nextauth.includes('signin');

  // Hides Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop();
  }

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    theme: {
      colorScheme: 'light',
    },
    callbacks: {
      async session({ session, token }) {
        console.log('==== called', session, token);
        const user = {
          name: token.sub,
          image: 'https://www.fillmurray.com/128/128',
        };
        const newSession = {
          ...session,
          address: token.sub,
          user,
        };
        return newSession;
      },
      async jwt({ token, user, account, profile }) {
        if (account) {
          let userExists = false;
          try {
            const getParams = {
              TableName: process.env.NEXT_AUTH_AWS_TABLE,
              Key: {
                id: `User#${account.providerAccountId}`,
              },
            };
            const u = await docClient.get(getParams);
            if (u.Item) {
              userExists = true;
            }
          } catch (e) {
            console.log('Get: Something is wrong', e);
          }

          if (userExists) return token;

          // store user data(address)
          try {
            const params = {
              TableName: process.env.NEXT_AUTH_AWS_TABLE,
              Item: {
                id: `User#${account.providerAccountId}`,
                address: account.providerAccountId,
                createdAt: new Date().toISOString(),
              },
            };
            await docClient.put(params);
          } catch (e) {
            console.log('Put: Something is wrong', e);
          }
        }
        return token;
      },
    },
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
  });
}
