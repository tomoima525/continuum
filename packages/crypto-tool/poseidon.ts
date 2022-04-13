import { buf2Bigint } from './buf2Bigint';

/**
 * Creates a Poseidon big number hash.
 * @param values The list of values to hash.
 * @returns The big number hash.
 */
export const createPoseidonHash = (
  poseidonModule: any,
  values: string[] | number[] | bigint[],
) => {
  const bigintvalues = (values as any[]).map(v => BigInt(v));
  return buf2Bigint(poseidonModule(bigintvalues)).toString();
};
