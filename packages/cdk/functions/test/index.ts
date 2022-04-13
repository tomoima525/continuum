import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import fetch from 'node-fetch';
import { MERKLE_TREE_DEPTH } from '@/configs';
import { findNodesByGroup } from '/opt/nodejs/dynamodb-utils';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export const handler = async function (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const address = event.queryStringParameters?.address;
  const r = await findNodesByGroup('0', process.env.TableName as string);
  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({
      address,
      r,
    }),
  };
};
