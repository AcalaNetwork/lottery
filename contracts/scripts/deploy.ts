import { ethers, run, network } from "hardhat";
import { ACA as mandalaAca } from "@acala-network/contracts/utils/MandalaTokens";
import { ACA as acalaAca } from "@acala-network/contracts/utils/AcalaTokens";

async function main() {
  const [owner] = await ethers.getSigners();
  const ownerAddr = await owner.getAddress();
  console.log(`owner address: ${ownerAddr}`)

  const ap = await ethers.deployContract("AcalaPoint", [ownerAddr]);
  await ap.waitForDeployment();
  const apAddr = await ap.getAddress();
  console.log(`Acala Point address: ${apAddr}`);
  
  if (process.env.VERIFY) {
    await run('verify:verify', {
      address: apAddr,
      constructorArguments: [ownerAddr],
    });
  }
  
  const acaAddr = network.name === "mandala" ? mandalaAca : acalaAca;
  const lotteryArgs = [
    apAddr,
    acaAddr,
    ownerAddr
  ];
  const lottery = await ethers.deployContract("Lottery", lotteryArgs);
  await lottery.waitForDeployment();
  const lotteryAddr = await lottery.getAddress();
  console.log(`Lottery address: ${lotteryAddr}`);

  if (process.env.VERIFY) {
    await run('verify:verify', {
      address: lotteryAddr,
      constructorArguments: lotteryArgs,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
