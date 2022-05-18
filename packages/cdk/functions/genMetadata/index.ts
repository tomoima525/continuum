import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NFTStorage, File } from 'nft.storage';
import screenshot from './screenshot';
import { groupQuery } from '/opt/nodejs/dynamodb-utils';
import { URLSearchParams } from 'url';

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
 * @param {string} fileName a filename for the NFT
 * @param {string} description a text description for the NFT
 * @param {string} token nft.storage token
 */
async function storeNFT({
  description,
  fileName,
  imageBuffer,
  name,
  properties,
  token,
}: {
  imageBuffer: Buffer;
  name: string;
  fileName: string;
  description: string;
  token: string;
  properties: { [key: string]: string };
}) {
  const image = new File([imageBuffer], fileName, { type: 'image/png' });
  // create a new NFTStorage client using our API key
  const nftstorage = new NFTStorage({ token });

  // call client.store, passing in the image & metadata
  return nftstorage.store({
    image,
    name,
    description,
    properties,
  });
}

export const handler = async function (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  console.log('==== env', process.env.AWS_EXECUTION_ENV);
  const requestBody = JSON.parse(event.body || '');
  const address = requestBody?.address as string;
  const groupId = requestBody?.groupId as string;
  const TableName = process.env.TableName as string;
  const secret_id = process.env.nftstorage_key_id as string;
  const nft_secret = await getSecret(secret_id);

  console.log('===== ', { address, groupId, nft_secret });

  try {
    const group = await groupQuery(groupId, TableName);

    const paramsObj = { walletname: address, criteria: group.name };
    const searchParams = new URLSearchParams(paramsObj);
    const url = `${
      process.env.SITE_URL
    }/certificate?${searchParams.toString()}`;
    console.log('=====', url);
    const file = (await screenshot(url)) as Buffer;

    const result = await storeNFT({
      description: `NFT that proves the github reputation of ${group.name}`,
      fileName: `${address}_${groupId}`,
      imageBuffer: file,
      name: 'Continuum NFT',
      token: nft_secret,
      properties: {
        reputation: group.name,
        owner: address,
      },
    });

    console.log(result.data, result.ipnft, result.url);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
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
