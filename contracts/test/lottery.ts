import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, formatUnits, parseEther, parseUnits } from "ethers";
import { ACA } from "@acala-network/contracts/utils/MandalaTokens";
import { Token, Token__factory } from "@acala-network/contracts/typechain";

import { AmbassadorPoint, Lottery } from "../typechain-types";

const ACA_DECIMALS = 12;
const PAYOUT_MIN = parseUnits("10", ACA_DECIMALS);
const PAYOUT_MAX = parseUnits("500", ACA_DECIMALS);

const almostEq = (a: bigint, b: bigint, maxDiff: bigint = parseUnits('3', ACA_DECIMALS)) => {
  return a - b <= maxDiff && b - a <= maxDiff;
}

describe("Lottery", function () {
  let aca: Token;
  let ap: AmbassadorPoint;
  let lottery: Lottery;

  let owner: Signer;
  let user0: Signer;
  let user1: Signer;
  let user2: Signer;

  let addrOwner: string;
  let addr0: string;
  let addr1: string;
  let addrLottery: string;

  let entryFee: bigint;

  beforeEach(async function () {
    [owner, user0, user1, user2] = await ethers.getSigners();
    addrOwner = await owner.getAddress();
    addr0 = await user0.getAddress();
    addr1 = await user1.getAddress();

    aca = Token__factory.connect(ACA, owner);

    ap = await ethers.deployContract("AmbassadorPoint", [addrOwner]);

    lottery = await ethers.deployContract("Lottery", [
      await ap.getAddress(),
      ACA,
      await owner.getAddress()
    ]);
    addrLottery = await lottery.getAddress();
    entryFee = await lottery.entryFee();

    // top up the lottery, can also do this with `depositACA` function
    await (await (owner.sendTransaction({
      to: addrLottery,
      value: parseEther("100000"),
    }))).wait();

    // mint some AP for users
    const mintAmount = parseEther("100000");
    await (await ap.mintBatch([addr0, addr1], [mintAmount, mintAmount])).wait();
  });

  const startLottery = async () => {
    await (await lottery.connect(owner).startLottery()).wait();
  }

  const testDraw = async (ticketCount: bigint, user: Signer) => {
    lottery = lottery.connect(user);
    ap = ap.connect(user);

    const acaBalBefore = await aca.balanceOf(user);
    const apBalBefore = await ap.balanceOf(user);

    const approveAmount = entryFee * ticketCount;
    await (await ap.approve(addrLottery, approveAmount)).wait();
    await (await lottery.drawLottery(ticketCount)).wait();

    const acaBalAfter = await aca.balanceOf(user);
    const apBalAfter = await ap.balanceOf(user);
    expect(apBalBefore - apBalAfter).to.eq(entryFee * ticketCount);

    const payout = acaBalAfter - acaBalBefore;
    console.log(`${ticketCount} tickets => ${formatUnits(payout, ACA_DECIMALS)}`);
    expect(payout).to.be.gte(PAYOUT_MIN * ticketCount);
    expect(payout).to.be.lte(PAYOUT_MAX * ticketCount);

    return payout;
  }

  describe("when can participate", function () {
    beforeEach(async function () {
      await startLottery()
    });

    it("draw single lottery", async function () {
      await testDraw(1n, user0);
    });

    it("draw multiple lottery", async function () {
      await testDraw(2n, user0);
      await testDraw(5n, user1);
      await testDraw(10n, user0);
      await testDraw(50n, user1);
    });
  });

  describe("payout expectation", function () {
    it("draw single lottery", async function () {
      const iterations = 10;
      let totalPayout = 0n;
      let totalTickets = 0;
      for (let i = 0; i < iterations; i++) {
        await startLottery()

        for (let j = 0; j < 10; j++) {
          const ticketCount = Math.floor(Math.random() * 35) + 1;
          totalPayout += await testDraw(BigInt(ticketCount), user0);
          totalTickets += ticketCount;
        }

        console.log(`iteraiont ${i}: ${totalTickets} tickets => ${formatUnits(totalPayout, ACA_DECIMALS)} | avg payout: ${formatUnits(totalPayout / BigInt(totalTickets), ACA_DECIMALS)}`);
      }

      // expected average payout should be ~22
      expect(totalPayout / BigInt(totalTickets)).to.be.gte(parseUnits("18", ACA_DECIMALS));
      expect(totalPayout / BigInt(totalTickets)).to.be.lte(parseUnits("25", ACA_DECIMALS));
    });
  });

  describe("when cannot participate", function () {
    it("lottery is not open yet", async function () {
      const isOpen = await lottery.isOpen();
      expect(isOpen).to.be.false;     // by defualt should be closed

      await expect(lottery.connect(user0).drawLottery(1)).to.be.revertedWith("<drawlottery> lottery is closed");
    });

    it("when user has no AP", async function () {
      await startLottery();
      await expect(lottery.connect(user2).drawLottery(3)).to.be.revertedWith("<drawlottery> insufficient AP balance");
    });

    it("when tickets are not enough or sold out", async function () {
      await startLottery();
      const ticketsRemaining = await lottery.maxTicketsCount();
      console.log({ ticketsRemaining })

      const user = user0;

      await testDraw(ticketsRemaining - 1n, user);
      
      // only 1 ticket left
      await expect(lottery.connect(user).drawLottery(10)).to.be.revertedWith("<drawlottery> not enough tickets left");
      
      // consume the last ticket
      await (await ap.connect(user).approve(addrLottery, 2n * entryFee)).wait();
      await (await lottery.drawLottery(1)).wait();

      // now the lottery is sold out
      await expect(lottery.drawLottery(1)).to.be.revertedWith("<drawlottery> lottery is closed");
    });
  });

  describe("Withdraw", function () {
    it("fails for others", async function () {
      await expect(lottery.connect(user1).withdrawACA()).to.be.reverted;    // TODO: rpc returns empty error msg
    });

    it("works for owner", async function () {
      const ownerBalBefore = await aca.balanceOf(addrOwner);
      const lotteryBalBefore = await aca.balanceOf(addrLottery);

      await (await lottery.withdrawACA()).wait();

      const ownerBalAfter = await aca.balanceOf(addrOwner);
      const lotteryBalAfter = await aca.balanceOf(addrLottery);

      expect(lotteryBalAfter).to.be.eq(0);
      expect(almostEq(ownerBalAfter - ownerBalBefore, lotteryBalBefore)).to.be.true;
    });
  });
});
