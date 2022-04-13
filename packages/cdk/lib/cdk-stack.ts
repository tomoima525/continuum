import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBSetup } from './dynamodb-stack';
import { GroupApiSetup } from './group-api-stack';
import { GroupLambdaStack } from './group-lambda-stack';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB
    const dynamoDBStack = new DynamoDBSetup(this, 'DynamoDB');

    // Lambda
    const groupLambda = new GroupLambdaStack(this, id);

    // API Gateway
    new GroupApiSetup(this, 'Group API', {
      test: groupLambda.testLambda,
    });
  }
}
