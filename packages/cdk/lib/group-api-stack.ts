import { Construct } from 'constructs';
import {
  aws_apigateway as apigateway,
  aws_lambda_nodejs as lambda,
  CfnOutput,
} from 'aws-cdk-lib';
import { deployEnv } from './envSpecific';

interface GroupApiSetupProps {
  test: lambda.NodejsFunction;
}

export class GroupApiSetup extends Construct {
  constructor(scope: Construct, id: string, props: GroupApiSetupProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'GroupApi', {
      restApiName: 'Continuum Group API',
      description: 'group api',
      deployOptions: {
        stageName: deployEnv(),
      },
      // 👇 enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });

    const { test } = props;
    const nonceResource = api.root.addResource('test');
    nonceResource.addMethod('GET', new apigateway.LambdaIntegration(test));

    new CfnOutput(this, 'GroupApiUrl', { value: api.url });
  }
}
