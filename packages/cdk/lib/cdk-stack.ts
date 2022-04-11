import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GroupApiSetup } from './group-api-stack';
import { GroupLambdaStack } from './group-lambda-stack';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Lambda
    const groupLambda = new GroupLambdaStack(this, id);

    // API Gateway
    new GroupApiSetup(this, 'Group API', {
      test: groupLambda.testLambda,
    });
  }
}
