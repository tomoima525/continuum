import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { commitmentUpdate } from '/opt/nodejs/dynamodb-utils';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export const handler = async function (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const requestBody = JSON.parse(event.body || '');
  const mintAddress = requestBody.mintAddress;
  const metadata = requestBody.metadata;
  const id = requestBody.id;
  const TableName = process.env.TableName as string;

  const commitment = {
    id,
    mintAddress,
    metadata,
  };

  console.log('=====', commitment);
  try {
    const r = await commitmentUpdate({
      TableName,
      commitment,
    });
    return {
      headers,
      statusCode: 200,
      body: JSON.stringify(r),
    };
  } catch (error) {
    console.log('=====', error);
    return {
      headers,
      statusCode: 400,
      body: JSON.stringify(error),
    };
  }
};
