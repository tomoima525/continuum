import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { Continuum } from "typechain";
type SolidityProof = [
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish,
  BigNumberish
];

describe("Continuum", function () {
  let continuumContract: Continuum;
  this.beforeAll(async () => {
    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy();

    await verifier.deployed();

    console.log("Verifier deployed to:", verifier.address);
    const Continuum = await ethers.getContractFactory("Continuum");
    continuumContract = await Continuum.deploy(verifier.address);
    await continuumContract.deployed();
  });

  it("Should expect to have name and symbol", async () => {
    expect(await continuumContract.name()).to.equal("Continuum");
    expect(await continuumContract.symbol()).to.equal("CNT");
  });

  it("Should verify and mint NFT", async () => {
    // Generated using scripts/generateSolidityInput
    const root = BigNumber.from(
      "0x2363beff769130fb20e6ebc044963247402b15e539a985cdd1128ff5566b9f2e"
    );
    const nullifier = BigNumber.from(
      "0x239bb965e269f6d79442fbaff13689546108b8e1fde2f632ed9e4b23388bd7bb"
    );
    const externalNullfier = BigNumber.from(
      "0x6af4841553646671a088d658246d9877"
    );

    const proof = [
      "0x169b7b73b8b7076c64beb6e739f7706bfd19e7e502a60b46e3a1c63df30f1f06",
      "0x25807db4f07abbde09b35a37f812269ebca6301e501be2c311079504f7f5adca",
      "0x1e5404b1216b30fbf9d8f4a9b754cb27e83c1ce6aa2fa3a0f5c4275b6476ead5",
      "0x2b6cec738ecfb297f10ca56c9981b084f58c1531a15dc5c0d107b5e36226592a",
      "0x28c7b9f644cca2b9d56f5ac1b471eccf44d7490f26e33cda9eb912e63be39c3d",
      "0x276fecf8ea6f9a4631b914ee918ee58881ff14ab8141163fbf638dc24135c38f",
      "0x1e9580d92c11c60013b3e67e4e747ed7886ebd716c87a8509bdc5e31a0ce6715",
      "0x16bbf3f07b63c92725fb26fc4dd68242be31a366a112424a8b4dc24ef66e32ab",
    ].map((v) => BigNumber.from(v));
    const tokenURI =
      "ipfs://bafyreigkgmntmr44mlpvfxcajxdfhlmb6awajfc4ecatu6gllcs6qhzgcy/metadata.json";
    const mintTx = await continuumContract.mint(
      root,
      nullifier,
      externalNullfier,
      proof as SolidityProof,
      tokenURI
    );
    // wait until the transaction is mined
    await mintTx.wait();
    const [signer] = await ethers.getSigners();
    expect(await continuumContract.tokenURI(0)).to.equal(tokenURI);
    expect(await continuumContract.ownerOf(0)).to.equal(signer.address);
  });
});
