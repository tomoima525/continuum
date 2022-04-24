import { Construct } from 'constructs';
import {
  aws_apigateway as apigateway,
  aws_lambda_nodejs as lambda,
  CfnOutput,
} from 'aws-cdk-lib';
import { deployEnv } from './envSpecific';

interface GroupApiSetupProps {
  appendLeaf: lambda.NodejsFunction;
  createMerkleProof: lambda.NodejsFunction;
  githubAuth: lambda.NodejsFunction;
  updateCommitment: lambda.NodejsFunction;
}

export class GroupApiSetup extends Construct {
  constructor(scope: Construct, id: string, props: GroupApiSetupProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'ContinuumApi', {
      restApiName: 'Continuum API',
      description: 'continuum api',
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

    const { appendLeaf, createMerkleProof, githubAuth, updateCommitment } =
      props;
    const merkleTreeResource = api.root.addResource('merkleTree');
    const appendResource = merkleTreeResource.addResource('append');
    appendResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(appendLeaf),
    );

    const createMerkleProofResource = merkleTreeResource.addResource('proof');
    createMerkleProofResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(createMerkleProof),
    );

    const githubAuthResource = api.root.addResource('githubAuth');
    githubAuthResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(githubAuth),
    );

    const commitmentResource = api.root.addResource('commitment');
    const commitmentUpdateResource = commitmentResource.addResource('update');
    commitmentUpdateResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(updateCommitment),
    );
    new CfnOutput(this, 'ContinuumApiUrl', { value: api.url });
  }
}
