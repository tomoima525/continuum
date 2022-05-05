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
};

export interface User extends Record<string, any> {
  id: string;
  username: string;
  name: string;
}

export interface GithubParameters {
  created_at: string;
  followers: number;
  owned_private_repos: number;
  proPlan: boolean;
  public_repos: number;
  receivedStars?: number;
}

export type GithubUser = User & GithubParameters;

export interface Commitment {
  id: string;
  userId: string;
  groupId: string;
  hash: string;
  metadata?: string;
  mintAddress?: string;
  createdAt: string;
}
export interface CommitmentUpdate {
  id: string;
  userId?: string;
  groupId?: string;
  hash?: string;
  metadata?: string;
  mintAddress?: string;
  createdAt?: string;
}

export interface Content {
  commitmentId?: string;
  commitmentHash?: string;
  groupId: string;
  groupName: string; // e.g. "More than 10 followers"
  groupNullifier: string;
  mintAddress?: string; // e.g. "0xfkl..." if minted
}

export interface Group {
  id: string;
  nullifier: string; // BigInt. Used for external nullifier
  name: string; // "More than 10 followers"
  criteria: number; // e.g. 20
  attr_key: string; // "created_at"
}
