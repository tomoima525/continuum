import { aws_lambda as lambda } from 'aws-cdk-lib';

import { Construct } from 'constructs';

export class LambdaLayerSetup extends Construct {
  public readonly cryptoLayer: lambda.LayerVersion;
  public readonly dbUtilLayer: lambda.LayerVersion;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.cryptoLayer = new lambda.LayerVersion(this, 'cryptoLayer', {
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_12_X,
        lambda.Runtime.NODEJS_14_X,
      ],
      code: lambda.Code.fromAsset('functions/layers/cdk-crypto'),
      description: 'crypto components',
    });

    this.dbUtilLayer = new lambda.LayerVersion(this, 'DBUtilLayer', {
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_12_X,
        lambda.Runtime.NODEJS_14_X,
      ],
      code: lambda.Code.fromAsset('functions/layers/dynamodb'),
      description: 'dynamodb utility components',
    });
  }
}
