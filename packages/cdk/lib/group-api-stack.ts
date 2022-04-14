import { Construct } from 'constructs';
import {
  aws_apigateway as apigateway,
  aws_lambda_nodejs as lambda,
  CfnOutput,
} from 'aws-cdk-lib';
import { deployEnv } from './envSpecific';

interface GroupApiSetupProps {
  appendLeaf: lambda.NodejsFunction;
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

    const { appendLeaf } = props;
    const merkleTreeResource = api.root.addResource('merkleTree');
    const appendResource = merkleTreeResource.addResource('append');
    appendResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(appendLeaf),
    );

    new CfnOutput(this, 'GroupApiUrl', { value: api.url });
  }
}
