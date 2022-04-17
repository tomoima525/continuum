export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AWSDate: string;
  AWSDateTime: string;
  AWSEmail: string;
  AWSIPAddress: string;
  AWSJSON: string;
  AWSPhone: string;
  AWSTime: string;
  AWSTimestamp: number;
  AWSURL: string;
};
export type MerkleTreeNode = {
  createdAt?: Maybe<Scalars['AWSDateTime']>;
  id: Scalars['ID'];
  hash: Scalars['String'];
  groupId: Scalars['ID'];
  groupName: Scalars['String'];
  index: Scalars['Int'];
  level: Scalars['Int'];
  siblinghash?: Maybe<Scalars['String']>;
  parent?: Maybe<MerkleTreeNode>;
  model: Scalars['String'];
};
