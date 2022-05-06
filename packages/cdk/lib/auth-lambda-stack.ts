import {
  aws_dynamodb as dynamodb,
  aws_lambda_nodejs as lambda_nodejs,
  aws_lambda as lambda,
  Duration,
} from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { deployEnv } from './envSpecific';

export interface AuthLambdaStackProps {
  dbUtilLayer: lambda.LayerVersion;
  continuumTable: dynamodb.ITable;
  secretManagerPolicy: PolicyStatement;
}
export class AuthLambdaStack extends Construct {
  public readonly authGithubLambda: lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: AuthLambdaStackProps) {
    super(scope, id);

    this.authGithubLambda = new lambda_nodejs.NodejsFunction(
      this,
      'authGithub',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'handler',
        entry: path.join(
          `${__dirname}/../`,
          'functions',
          'authGithub/index.ts',
        ),
        environment: {
          TableName: props.continuumTable.tableName,
          GITHUB_CLIENT_ID:
            deployEnv() === 'dev'
              ? 'b3618911274da67ecaf8'
              : 'f77d2946ff61985f83d0',
          REDIRECT_URL:
            deployEnv() === 'dev'
              ? 'https://continuum-swart.vercel.app'
              : 'https://continuum.tomoima525.com',
        },
        timeout: Duration.seconds(25),
        memorySize: 256,
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
          ],
        },
        layers: [props.dbUtilLayer],
      },
    );
    props.continuumTable.grantReadWriteData(this.authGithubLambda);

    this.authGithubLambda.addToRolePolicy(props.secretManagerPolicy);
  }
}
