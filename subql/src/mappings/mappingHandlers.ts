import assert from "assert";

import { LotteryDrawLog } from "../types/abi-interfaces/Lottery";
import { LotteryDraw } from "../types";

export async function handleDraw(log: LotteryDrawLog): Promise<void> {
  assert(log.args, "Require args on the logs");

  const tx = LotteryDraw.create({
    id: log.transaction.hash,
    txHash: log.transaction.hash,
    blocknumber: log.blockNumber,
    address: log.transaction.from,
    ticketCount: log.args.ticketCount.toNumber(),
    totalRewardAca: log.args.totalRewardAca.toBigInt(),
    rewardsComposition: log.args.rewardsComposition.map(x => x.toBigInt()),
  });

  await tx.save();
}
