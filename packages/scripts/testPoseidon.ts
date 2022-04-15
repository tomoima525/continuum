import crypto from 'crypto';
import {
  buildPoseidon,
  buildPoseidonOpt,
  createPoseidonHash,
} from '../crypto-tool';

// use your local profile
export const testPoseidon = async (): Promise<unknown> => {
  console.log('test poseidon');

  let zeroHash = '0';
  const start = Date.now();
  const poseidonWasModule = await buildPoseidon();
  const wasmInitTime = Date.now();
  console.log('Instantiate wasm poseidon time', wasmInitTime - start);
  const hash = createPoseidonHash(poseidonWasModule, [zeroHash, zeroHash]);
  const hashTime = Date.now();
  console.log('hash poseidon', hash);
  console.log('hash poseidon time', hashTime - wasmInitTime);
  const poseidonModule = await buildPoseidonOpt();
  const initTime = Date.now();
  console.log('Instantiate poseidon time', initTime - hashTime);
  const hash2 = createPoseidonHash(poseidonModule, [zeroHash, zeroHash]);
  const hashTime2 = Date.now();
  console.log('hash poseidon', hash2);
  console.log('hash poseidon time', hashTime2 - initTime);
  return {};
};

async function main() {
  await testPoseidon();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
