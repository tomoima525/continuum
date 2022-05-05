import { ethers } from "hardhat";

async function main() {
  const Continuum = await ethers.getContractFactory("Continuum");
  // Verifier contract on Harmony test net
  const continuum = await Continuum.deploy(
    "0x93E7BCEa341742F0582Ff7118E89Fff468CeaB03"
  );
  await continuum.deployed();

  console.log("Continuum deployed to:", continuum.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
