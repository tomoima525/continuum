// Taken from https://github.com/appliedzkp/semaphore/blob/main/scripts/compile-circuits.ts
import fs from "fs";
import { zKey } from "snarkjs";
import logger from "js-logger";

async function main() {
  const buildPath = "./circuit";
  const solidityVersion = "0.8.4";

  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath, { recursive: true });
  }

  // some how this is not working. Should run manually
  // await exec(`circom ./circuit/semaphore.circom --r1cs --wasm -o ${buildPath}`);

  await zKey.newZKey(
    `${buildPath}/semaphore.r1cs`,
    `${buildPath}/powersOfTau28_hez_final_16.ptau`,
    `${buildPath}/semaphore_0000.zkey`,
    logger
  );

  await zKey.beacon(
    `${buildPath}/semaphore_0000.zkey`,
    `${buildPath}/semaphore_final.zkey`,
    "Final Beacon",
    "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
    10,
    logger
  );

  let verifierCode = await zKey.exportSolidityVerifier(
    `${buildPath}/semaphore_final.zkey`,
    {
      groth16: fs.readFileSync(
        "./node_modules/snarkjs/templates/verifier_groth16.sol.ejs",
        "utf8"
      ),
    },
    logger
  );
  verifierCode = verifierCode.replace(
    /pragma solidity \^\d+\.\d+\.\d+/,
    `pragma solidity ^${solidityVersion}`
  );

  fs.writeFileSync("./contracts/Verifier.sol", verifierCode, "utf-8");

  const verificationKey = await zKey.exportVerificationKey(
    `${buildPath}/semaphore_final.zkey`,
    logger
  );
  fs.writeFileSync(
    `${buildPath}/verification_key.json`,
    JSON.stringify(verificationKey),
    "utf-8"
  );

  fs.renameSync(
    `${buildPath}/semaphore_js/semaphore.wasm`,
    `${buildPath}/semaphore.wasm`
  );
  // rimraf.sync(`${buildPath}/semaphore_js`);
  // rimraf.sync(`${buildPath}/powersOfTau28_hez_final_16.ptau`);
  // rimraf.sync(`${buildPath}/semaphore_0000.zkey`);
  // rimraf.sync(`${buildPath}/semaphore.r1cs`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
