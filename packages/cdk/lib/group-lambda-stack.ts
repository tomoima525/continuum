import {
  Aws,
  aws_lambda_nodejs as lambda_nodejs,
  aws_lambda as lambda,
  Duration,
} from 'aws-cdk-lib';
import * as path from 'path';
import { deployEnv } from './envSpecific';
import { Construct } from 'constructs';

export class GroupLambdaStack extends Construct {
  public readonly testLambda: lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.testLambda = new lambda_nodejs.NodejsFunction(this, 'test', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: path.join(`${__dirname}/../`, 'functions', 'test/index.ts'),
      environment: {
        REDIRECT_URL: deployEnv() === 'dev' ? 'xxx' : 'yyy',
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
    });
  }
}
