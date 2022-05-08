import networks from './networks.json';
const env = process.env.NEXT_PUBLIC_ENV as string;
// https://docs.harmony.one/home/developers/network-and-faucets
// falls back to dev
export const selectedChain =
  env === 'prod' ? networks[1666600000].chainId : networks[1666700000].chainId;
