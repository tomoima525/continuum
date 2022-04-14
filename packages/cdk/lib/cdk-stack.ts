import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBSetup } from './dynamodb-stack';
import { GroupApiSetup } from './group-api-stack';
import { GroupLambdaStack } from './group-lambda-stack';
import { LambdaLayerSetup } from './layer-stack';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB
    const dynamoDBStack = new DynamoDBSetup(this, 'DynamoDB');

    // Layer
    const layer = new LambdaLayerSetup(this, 'LambdaLayer');
    // Lambda
    const groupLambda = new GroupLambdaStack(this, 'GroupLambda', {
      dbUtilLayer: layer.dbUtilLayer,
      merkleTreeTable: dynamoDBStack.merkleTreeTable,
    });

    // API Gateway
    new GroupApiSetup(this, 'Group API', {
      appendLeaf: groupLambda.appendLeafLambda,
    });
  }
}
