import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, parseEther } from "ethers";

import { AcalaPoint } from "../typechain-types";

describe("AcalaPoint", function () {
  let ap: AcalaPoint;

  let owner: Signer;
  let user0: Signer;
  let user1: Signer;

  let addrOwner: string;
  let addr0: string;
  let addr1: string;

  beforeEach(async function () {
    [owner, user0, user1] = await ethers.getSigners();
    addrOwner = await owner.getAddress();
    addr0 = await user0.getAddress();
    addr1 = await user1.getAddress();

    ap = await ethers.deployContract("AcalaPoint", [addrOwner]);
    await ap.waitForDeployment();
  });

  describe("when can mint", async function () {
    it("owner mint", async function () {
      const balBefore = await ap.balanceOf(addr0);

      const mintAmount = parseEther("528.3222");
      await (await ap.mint(addr0, mintAmount)).wait();

      const balAfter = await ap.balanceOf(addr0);
      expect(balAfter - balBefore).to.equal(mintAmount);      
    });
    
    it("owner batch mint", async function () {
      const bal0Before = await ap.balanceOf(addr0);
      const bal1Before = await ap.balanceOf(addr1);
      
      const mintAmount0 = parseEther("123");
      const mintAmount1 = parseEther("321.123");
      await ap.mintBatch(
        [addr0, addr1],
        [mintAmount0, mintAmount1]
      );
      const bal0After = await ap.balanceOf(addr0);
      const bal1After = await ap.balanceOf(addr1);

      expect(bal0After - bal0Before).to.equal(mintAmount0);
      expect(bal1After - bal1Before).to.equal(mintAmount1);
    });

    it("whitelisted minter mint", async function () {
      const balBefore = await ap.balanceOf(addr1);
      
      // Whitelist addr0 as minter
      await (await ap.whitelistMinter(addr0)).wait();
      ap = ap.connect(user0);
      
      const mintAmount = parseEther("17");
      await (await ap.mint(addr1, mintAmount)).wait();

      const balAfter = await ap.balanceOf(addr1);
      expect(balAfter - balBefore).to.equal(mintAmount);
    });

    it("whitelisted minter batch mint", async function () {
      const bal0Before = await ap.balanceOf(addr0);
      const bal1Before = await ap.balanceOf(addr1);

      // Whitelist addr0 as minter
      await (await ap.whitelistMinter(addr0)).wait();
      ap = ap.connect(user0);
      
      const mintAmount0 = parseEther("123");
      const mintAmount1 = parseEther("321.123");
      await ap.mintBatch(
        [addr0, addr1],
        [mintAmount0, mintAmount1]
      );
      const bal0After = await ap.balanceOf(addr0);
      const bal1After = await ap.balanceOf(addr1);

      expect(bal0After - bal0Before).to.equal(mintAmount0);
      expect(bal1After - bal1Before).to.equal(mintAmount1);
    });
  });

  describe("when cannot mint", async function () {
    it("others fail to mint or batch mint AP tokens", async function () {
      await expect(ap.connect(user1).mint(addr0, parseEther("100")))
        .to.be.revertedWith("<mint> no mint permission");

      await expect(ap.connect(user1).mintBatch([addr0, addr1], [parseEther("50"), parseEther("50")]))
        .to.be.revertedWith("<mintBatch> no mint permission");
    });
  });
});
