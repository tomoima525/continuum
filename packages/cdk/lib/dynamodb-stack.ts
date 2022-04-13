import { aws_dynamodb as ddb } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DynamoDBSetup extends Construct {
  public readonly merkleTreeTable: ddb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.merkleTreeTable = new ddb.Table(this, 'MerkleTree', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // global secondary key for fetching nodes by groupId
    this.merkleTreeTable.addGlobalSecondaryIndex({
      indexName: 'GroupIndex',
      partitionKey: {
        name: 'groupId',
        type: ddb.AttributeType.STRING,
      },
      projectionType: ddb.ProjectionType.ALL,
    });
  }
}
