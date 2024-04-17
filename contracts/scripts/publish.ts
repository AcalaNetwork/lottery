import { EVM as EVM_ADDR } from '@acala-network/contracts/utils/Predeploy';
import { EVM__factory } from '@acala-network/contracts/typechain';
import { ethers } from 'hardhat';
import { AP_ADDR, LOTTERY_ADDR } from './consts';

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