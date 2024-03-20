import { ethers, run, network } from "hardhat";
import { ACA as mandalaAca } from "@acala-network/contracts/utils/MandalaTokens";
import { ACA as acalaAca } from "@acala-network/contracts/utils/AcalaTokens";

async function main() {
  const [owner] = await ethers.getSigners();
  console.log(`owner address: ${await owner.getAddress()}`)

  const ap = await ethers.deployContract("AmbassadorPoint", [await owner.getAddress()]);
  await ap.waitForDeployment();
  console.log(`Ambassador Point address: ${await ap.getAddress()}`);
  
  if (process.env.VERIFY) {
    await run('verify:verify', {
      address: await ap.getAddress(),
      constructorArguments: [await owner.getAddress()],
    });
  }
  
  const acaAddr = network.name === "mandala" ? mandalaAca : acalaAca;
  const lotteryArgs = [
    await ap.getAddress(),
    acaAddr,
    await owner.getAddress()
  ];
  const lottery = await ethers.deployContract("Lottery", lotteryArgs);
  await lottery.waitForDeployment();
  console.log(`Lottery address: ${await lottery.getAddress()}`);

  if (process.env.VERIFY) {
    await run('verify:verify', {
      address: await lottery.getAddress(),
      constructorArguments: lotteryArgs,
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
