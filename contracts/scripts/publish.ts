import { EVM as EVM_ADDR } from '@acala-network/contracts/utils/Predeploy';
import { EVM__factory } from '@acala-network/contracts/typechain';
import { ethers } from 'hardhat';

const AP_ADDR = '0x3d3593927228553b349767ABa68d4fb1514678CB';
const LOTTERY_ADDR = '0xD26e19913ca16B5B59aF7f07472f97cC9eA3f12B';

async function main() {
  const [deployer] = await ethers.getSigners();
  const evm = EVM__factory.connect(EVM_ADDR, deployer);
  const developerStatus = evm.developerStatus(deployer.address);
  if (!developerStatus) {
    console.log('enabling developer status ...');
    await evm.developerEnable();
  }

  console.log(`publishing contract ${AP_ADDR} ...`);
  await evm.publishContract(AP_ADDR);

  console.log(`publishing contract ${LOTTERY_ADDR} ...`);
  await evm.publishContract(LOTTERY_ADDR);

  console.log('done 🎉');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});