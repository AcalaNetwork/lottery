import { ethers } from 'hardhat';
import { MaxUint256, formatEther, parseEther } from 'ethers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

import { AcalaPoint__factory, Lottery__factory } from '../typechain-types';
import { AP_ADDR, LOTTERY_ADDR } from './consts';

const withdraw = async (wallet: HardhatEthersSigner) => {
  console.log('withdrawing ...')
  const lottery = Lottery__factory.connect(LOTTERY_ADDR, wallet);
  const tx = await lottery.withdrawACA();
  
  return await tx.wait();
}

const draw = async (wallet: HardhatEthersSigner, count: number) => {
  console.log(`drawing ${count} lottery ...`)
  const lottery = Lottery__factory.connect(LOTTERY_ADDR, wallet);
  const tx = await lottery.drawLottery(count);
  
  return await tx.wait();
}

const mintAp = async (wallet: HardhatEthersSigner, amount: number) => {
  console.log(`minting ${amount} ap ...`)
  const ap = AcalaPoint__factory.connect(AP_ADDR, wallet);
  const tx = await ap.mint(await wallet.getAddress(), parseEther(String(amount)))
  
  return await tx.wait();
}

const approve = async (wallet: HardhatEthersSigner) => {
  console.log(`approving ap spent limit ...`)
  const ap = AcalaPoint__factory.connect(AP_ADDR, wallet);
  const tx = await ap.approve(LOTTERY_ADDR, MaxUint256);

  return await tx.wait();
}

const getBal = async (wallet: HardhatEthersSigner) => {
  const bal = await wallet.provider.getBalance(wallet.address);

  return formatEther(bal);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const addr = await deployer.getAddress();
  console.log(`user addr: ${addr}`)

  const curBal = await getBal(deployer);
  await mintAp(deployer, 1000);

  await approve(deployer);

  await draw(deployer, 1);
  await draw(deployer, 3);
  await draw(deployer, 5);

  await withdraw(deployer);

  const newBal = await getBal(deployer);

  console.log(curBal, newBal);

  console.log('done 🎉');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});