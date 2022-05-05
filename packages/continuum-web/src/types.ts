import { LargeNumberLike } from 'crypto';

export interface AuthData {
  id: string;
  email: string;
  name: string;
  token: string;
}

export enum ImageSize {
  Size_12px = 12,
  Size_48px = 48,
  Size_64px = 64,
}

export interface User extends Record<string, any> {
  id: string;
  username: string;
  name: string;
}

export interface GithubParameters {
  created_at: string;
  followers?: number;
  owned_private_repos: number;
  proPlan?: boolean;
  public_repos: number;
  receivedStars?: number;
  avatar_url: string;
}

export type GithubUser = User & GithubParameters;

export interface Content {
  commitmentId?: string;
  commitmentHash?: string;
  groupId: string;
  groupName: string; // e.g. "More than 10 followers"
  groupNullifier: string;
  mintAddress?: string; // e.g. "0xfkl..." if minted
  metadata?: string; // ipfs://xxxx/metadata.json
}

// zkp related from Semaphore
export type StrBigInt = string | bigint;

export type Proof = {
  pi_a: StrBigInt[];
  pi_b: StrBigInt[][];
  pi_c: StrBigInt[];
  protocol: string;
  curve: string;
};

export type SemaphoreFullProof = {
  proof: Proof;
  publicSignals: SemaphorePublicSignals;
};
export type SemaphorePublicSignals = {
  merkleRoot: StrBigInt;
  nullifierHash: StrBigInt;
  signalHash: StrBigInt;
  externalNullifier: StrBigInt;
};

export type SemaphoreSolidityProof = [
  StrBigInt,
  StrBigInt,
  StrBigInt,
  StrBigInt,
  StrBigInt,
  StrBigInt,
  StrBigInt,
  StrBigInt,
];

export type SemaphoreWitness = {
  identityNullifier: StrBigInt;
  identityTrapdoor: StrBigInt;
  treeSiblings: StrBigInt[];
  treePathIndices: number[];
  externalNullifier: StrBigInt;
  signalHash: StrBigInt;
};

export type MerkleProof = {
  root: StrBigInt;
  leaf: StrBigInt;
  siblings: StrBigInt[];
  pathIndices: number[];
};
