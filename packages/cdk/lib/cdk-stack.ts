import { Aws, Stack, StackProps } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { AuthLambdaStack } from './auth-lambda-stack';
import { DynamoDBSetup } from './dynamodb-stack';
import { GroupApiSetup } from './api-stack';
import { GroupLambdaStack } from './group-lambda-stack';
import { LambdaLayerSetup } from './layer-stack';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB
    const dynamoDBStack = new DynamoDBSetup(this, 'DynamoDB');

    // secret manager policy
    const secretManagerPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: [
        `arn:aws:secretsmanager:${Aws.REGION}:${Aws.ACCOUNT_ID}:secret:*`,
      ],
    });

    // Layer
    const layer = new LambdaLayerSetup(this, 'LambdaLayer');

    // Lambda
    const groupLambda = new GroupLambdaStack(this, 'GroupLambda', {
      chromeLayer: layer.chromeLayer,
      continuumTable: dynamoDBStack.continuumTable,
      dbUtilLayer: layer.dbUtilLayer,
      secretManagerPolicy,
    });

    const authGithub = new AuthLambdaStack(this, 'AuthLambda', {
      dbUtilLayer: layer.dbUtilLayer,
      continuumTable: dynamoDBStack.continuumTable,
      secretManagerPolicy,
    });

    // API Gateway
    new GroupApiSetup(this, 'Continuum API', {
      appendLeaf: groupLambda.appendLeafLambda,
      createMerkleProof: groupLambda.createMerkleProofLambda,
      githubAuth: authGithub.authGithubLambda,
      updateCommitment: groupLambda.updateCommitmentLambda,
    });
  }
}
