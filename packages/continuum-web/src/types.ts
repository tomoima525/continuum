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
}

export type GithubUser = User & GithubParameters;
