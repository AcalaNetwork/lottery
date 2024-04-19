import { ethers } from 'hardhat';
import { MaxUint256, formatEther, parseEther } from 'ethers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

import { AcalaPoint__factory, Lottery__factory } from '../typechain-types';
import { AP_ADDR, LOTTERY_ADDR } from './consts';

const withdraw = async (wallet: HardhatEthersSigner) => {
  console.log('withdrawing ...')
  const lottery = Lottery__factory.connect(LOTTERY_ADDR, wallet);
  const tx = await lottery.withdrawACA();
  
  const receipt = await tx.wait();
  console.log(`finished at block ${receipt!.blockNumber}`);
  console.log('');
}

const draw = async (wallet: HardhatEthersSigner, count: number) => {
  console.log(`drawing ${count} lottery ...`)
  const lottery = Lottery__factory.connect(LOTTERY_ADDR, wallet);
  const tx = await lottery.drawLottery(count);
  
  const receipt = await tx.wait();
  console.log(`finished at block ${receipt!.blockNumber}`);
  console.log('');
}

const mintAp = async (wallet: HardhatEthersSigner, amount: number) => {
  console.log(`minting ${amount} ap ...`)
  const ap = AcalaPoint__factory.connect(AP_ADDR, wallet);
  const tx = await ap.mint(await wallet.getAddress(), parseEther(String(amount)))
  
  const receipt = await tx.wait();
  console.log(`finished at block ${receipt!.blockNumber}`);
  console.log('');
}

const approve = async (wallet: HardhatEthersSigner) => {
  console.log(`approving ap spent limit ...`)
  const ap = AcalaPoint__factory.connect(AP_ADDR, wallet);
  const tx = await ap.approve(LOTTERY_ADDR, MaxUint256);

  const receipt = await tx.wait();
  console.log(`finished at block ${receipt!.blockNumber}`);
  console.log('');
}

const getBal = async (wallet: HardhatEthersSigner) => {
  const bal = await wallet.provider.getBalance(wallet.address);

  return formatEther(bal);
}

const startIfNeeded = async (wallet: HardhatEthersSigner) => {
  const lottery = Lottery__factory.connect(LOTTERY_ADDR, wallet);
  const isOpen = await lottery.isOpen();

  if (!isOpen) {
    console.log('starting lottery ...')
    const tx = await lottery.startLottery();
    const receipt = await tx.wait();

    console.log(`finished at block ${receipt!.blockNumber}`);
    console.log('');
  }
}

const depositToLottery = async (wallet: HardhatEthersSigner, amount: number) => {
  console.log(`depositing ${amount} ACA to lottery ...`)
  const tx = await wallet.sendTransaction({
    to: LOTTERY_ADDR,
    value: parseEther(String(amount)),
    data: '0x',
  });
  
  const receipt = await tx.wait();
  console.log(`finished at block ${receipt!.blockNumber}`);
  console.log('');
}

const randNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const addr = await deployer.getAddress();
  console.log(`user addr: ${addr}`)

  const curBal = await getBal(deployer);
  console.log(curBal)

  await depositToLottery(deployer, 500);

  await startIfNeeded(deployer);

  // await mintAp(deployer, 1000);
  // await approve(deployer);

  await draw(deployer, 1);
  await draw(deployer, randNumber(2, 3));
  await draw(deployer, randNumber(4, 6));

  await withdraw(deployer);

  const newBal = await getBal(deployer);
  console.log(newBal);

  console.log('done 🎉');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});