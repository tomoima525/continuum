import {
  aws_dynamodb as dynamodb,
  aws_lambda_nodejs as lambda_nodejs,
  aws_lambda as lambda,
  Duration,
} from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Construct } from 'constructs';
import { deployEnv } from './envSpecific';

export interface GroupLambdaStackProps {
  chromeLayer: lambda.LayerVersion;
  continuumTable: dynamodb.ITable;
  dbUtilLayer: lambda.LayerVersion;
  secretManagerPolicy: PolicyStatement;
}
export class GroupLambdaStack extends Construct {
  public readonly appendLeafLambda: lambda_nodejs.NodejsFunction;
  public readonly createMerkleProofLambda: lambda_nodejs.NodejsFunction;
  public readonly updateCommitmentLambda: lambda_nodejs.NodejsFunction;
  public readonly genMetadataLambda: lambda_nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: GroupLambdaStackProps) {
    super(scope, id);

    this.appendLeafLambda = new lambda_nodejs.NodejsFunction(
      this,
      'appendLeaf',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'handler',
        entry: path.join(
          `${__dirname}/../`,
          'functions',
          'appendLeaf/index.ts',
        ),
        environment: {
          TableName: props.continuumTable.tableName,
        },
        timeout: Duration.seconds(25),
        memorySize: 1408,
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
          ],
        },
        layers: [props.dbUtilLayer],
      },
    );
    props.continuumTable.grantReadWriteData(this.appendLeafLambda);

    this.updateCommitmentLambda = new lambda_nodejs.NodejsFunction(
      this,
      'updateCommitment',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'handler',
        entry: path.join(
          `${__dirname}/../`,
          'functions',
          'updateCommitment/index.ts',
        ),
        environment: {
          TableName: props.continuumTable.tableName,
        },
        timeout: Duration.seconds(25),
        memorySize: 512,
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
          ],
        },
        layers: [props.dbUtilLayer],
      },
    );
    props.continuumTable.grantReadWriteData(this.updateCommitmentLambda);

    this.createMerkleProofLambda = new lambda_nodejs.NodejsFunction(
      this,
      'createMerkleProof',
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'handler',
        entry: path.join(
          `${__dirname}/../`,
          'functions',
          'createMerkleProof/index.ts',
        ),
        environment: {
          TableName: props.continuumTable.tableName,
        },
        timeout: Duration.seconds(25),
        memorySize: 512,
        bundling: {
          externalModules: [
            'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
          ],
        },
        layers: [props.dbUtilLayer],
      },
    );
    props.continuumTable.grantReadWriteData(this.createMerkleProofLambda);

    // Work around to use nft.storage which is supported node 16+
    // https://fusebit.io/blog/run-every-nodejs-version-in-lambda
    // https://github.com/fusebit/everynode
    // https://github.com/aws/aws-lambda-base-images/issues/14
    const customNodeLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'customNode',
      'arn:aws:lambda:us-west-2:072686360478:layer:node-16_14_2:1',
    );

    this.genMetadataLambda = new lambda.Function(this, 'genMetadata', {
      runtime: new lambda.Runtime('nodejs16.x', lambda.RuntimeFamily.NODEJS),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(`${__dirname}/../`, 'functions', 'genMetadata'),
      ),
      environment: {
        TableName: props.continuumTable.tableName,
        SITE_URL:
          deployEnv() === 'dev'
            ? 'https://continuum-swart.vercel.app'
            : 'https://continuum.tomoima525.com',
        nftstorage_key_id: `continuum_nft_key_${deployEnv()}`,
      },
      timeout: Duration.minutes(1),
      memorySize: 1536,
      layers: [props.dbUtilLayer, customNodeLayer, props.chromeLayer],
    });
    props.continuumTable.grantReadWriteData(this.genMetadataLambda);
    this.genMetadataLambda.addToRolePolicy(props.secretManagerPolicy);
  }
}
