import {
  aws_dynamodb as dynamodb,
  aws_lambda_nodejs as lambda_nodejs,
  aws_lambda as lambda,
  Duration,
} from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

export interface GroupLambdaStackProps {
  dbUtilLayer: lambda.LayerVersion;
  merkleTreeTable: dynamodb.ITable;
}
export class GroupLambdaStack extends Construct {
  public readonly appendLeafLambda: lambda_nodejs.NodejsFunction;

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
          TableName: props.merkleTreeTable.tableName,
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
    props.merkleTreeTable.grantReadWriteData(this.appendLeafLambda);
  }
}
