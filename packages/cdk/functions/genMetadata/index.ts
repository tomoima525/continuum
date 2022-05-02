import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NFTStorage, File } from 'nft.storage';
import screenshot from './screenshot';
import { groupQuery } from '/opt/nodejs/dynamodb-utils';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

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

/**
 * Reads an image file from `imagePath` and stores an NFT with the given name and description.
 * @param {Buffer} imageBuffer image buffer
 * @param {string} name a name for the NFT
 * @param {string} description a text description for the NFT
 */
async function storeNFT(
  imageBuffer: Buffer,
  name: string,
  description: string,
) {
  const image = new File([imageBuffer], name);
  // create a new NFTStorage client using our API key
  const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

  // call client.store, passing in the image & metadata
  return nftstorage.store({
    image,
    name,
    description,
  });
}

export const handler = async function (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestBody = JSON.parse(event.body || '');
  const address = requestBody?.address as string;
  const groupId = requestBody?.groupId as string;
  const TableName = process.env.TableName as string;
  console.log('===== ', { address, groupId });

  try {
    const group = await groupQuery(groupId, TableName);

    const paramsObj = { walletname: address, criteria: group.name };
    const searchParams = new URLSearchParams(paramsObj);
    const url = `${
      process.env.SITE_URL
    }/certificate?${searchParams.toString()}`;
    console.log('=====', url);
    const file = (await screenshot(url)) as Buffer;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(''),
    };
  } catch (e) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify(e),
    };
  }
};

module.exports = { handler };
