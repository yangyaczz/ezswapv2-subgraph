import {
  SwapNFTInPair as SwapNFTInPairEvent,
  SwapNFTOutPair as SwapNFTOutPairEvent,

  TokenDeposit as TokenDepositEvent,
  TokenWithdrawal as TokenWithdrawalEvent,

  NFTWithdrawal as NFTWithdrawalEvent,

  OwnershipTransferred as OwnershipTransferredEvent,
  SpotPriceUpdate as SpotPriceUpdateEvent,
  FeeUpdate as FeeUpdateEvent,
  DeltaUpdate as DeltaUpdateEvent,
  AssetRecipientChange as AssetRecipientChangeEvent,
} from "../generated/templates/LSSVMPair/LSSVMPair";

import {
  Pair
} from "../generated/schema";

import { Address, BigInt } from "@graphprotocol/graph-ts";

import { fetchNFTIds, fetchNFTCount, fetchERC20Balance, fetchNFT1155Count } from "./utilsIERC721";
import { LSSVMPair } from "../generated/PairFactory/LSSVMPair";



///////////////////////////////////////////////////////////////////////  swap nft in √ (is trade pool?) // eth out √

export function handleSwapNFTInPair(event: SwapNFTInPairEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair) {

    let tradeCount: BigInt
    if (pair.is1155) {
      pair.lastNftCount1155 = pair.nftCount1155
      pair.nftCount1155 = fetchNFT1155Count(event.address)
      tradeCount = pair.nftCount1155!.minus(pair.lastNftCount1155!)
    } else {
      pair.lastNftCount = pair.nftCount
      pair.nftCount = fetchNFTCount(event.address)
      pair.nftIds = fetchNFTIds(event.address)
      tradeCount = pair.nftCount!.minus(pair.lastNftCount!)
    }

    // caculate volumn
    let contract = LSSVMPair.bind(event.address)
    let tradeVolumn: BigInt = BigInt.fromI32(0)
    let result = contract.try_getBuyNFTQuote(tradeCount)
    if (!result.reverted) {
      tradeVolumn = result.value.value3
    }
    pair.ethVolume = pair.ethVolume!.plus(tradeVolumn)
    
    pair.swapCount = pair.swapCount!.plus(BigInt.fromI32(1))
    pair.updateTimestamp = event.block.timestamp;
    pair.save()
  }
  /////////////
}


///////////////////////////////////////////////////////////////////////////////  for pair: nft out √ //  eth in √ (is trade pool?)

export function handleSwapNFTOutPair(event: SwapNFTOutPairEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair) {

    let tradeCount: BigInt
    if (pair.is1155) {
      pair.lastNftCount1155 = pair.nftCount1155
      pair.nftCount1155 = fetchNFT1155Count(event.address)
      tradeCount = pair.lastNftCount1155!.minus(pair.nftCount1155!)
    } else {
      pair.lastNftCount = pair.nftCount
      pair.nftCount = fetchNFTCount(event.address)
      pair.nftIds = fetchNFTIds(event.address)
      tradeCount = pair.lastNftCount!.minus(pair.nftCount!)
    }

    // caculate volumn
    let contract = LSSVMPair.bind(event.address)
    let tradeVolumn: BigInt = BigInt.fromI32(0)
    let result = contract.try_getSellNFTQuote(tradeCount)
    if (!result.reverted) {
      tradeVolumn = result.value.value3
    }
    pair.ethVolume = pair.ethVolume!.plus(tradeVolumn)

    pair.swapCount = pair.swapCount!.plus(BigInt.fromI32(1))
    pair.updateTimestamp = event.block.timestamp;
    pair.save()
  }
  /////////////
}

///////////////////////////////////////////////////////////////////////////////////////////////  nft withdraw  √
export function handleNFTWithdrawal(event: NFTWithdrawalEvent): void {

  /////////////
  let pair = Pair.load(event.address.toHexString());
  if (pair) {
    if (pair.is1155) {
      pair.nftCount1155 = fetchNFT1155Count(event.address)
      pair.lastNftCount1155 = fetchNFT1155Count(event.address)
    } else {
      pair.nftIds = fetchNFTIds(event.address)
      pair.nftCount = fetchNFTCount(event.address)
      pair.lastNftCount = fetchNFTCount(event.address)
    }

    pair.updateTimestamp = event.block.timestamp;
    pair.save()
  }
  /////////////

}


//////////////////////////////////////////////////////////////  eth  desposit and withdraw  √  unuse

export function handleTokenDeposit(event: TokenDepositEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }

  if (pair.tx == event.transaction.hash.toHexString()) {
    return;
  }

  if (pair.token != null) {
    pair.tokenBalance = fetchERC20Balance(event.address, Address.fromString(pair.token!))
  }

  // unuse

  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleTokenWithdrawal(event: TokenWithdrawalEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }

  if (pair.token != null) {
    pair.tokenBalance = fetchERC20Balance(event.address, Address.fromString(pair.token!))
  }

  // unuse

  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}


///////////////////////////////////////////////
///////////////  owner change   ///////////////
///////////////////////////////////////////////

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.owner = event.params.newOwner.toHexString();
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleSpotPriceUpdate(event: SpotPriceUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.lastSpotPrice = pair.spotPrice;
  pair.spotPrice = event.params.newSpotPrice;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleFeeUpdate(event: FeeUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.fee = event.params.newFee;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleDeltaUpdate(event: DeltaUpdateEvent): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.delta = event.params.newDelta;
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}

export function handleAssetRecipientChange(
  event: AssetRecipientChangeEvent
): void {
  let pair = Pair.load(event.address.toHexString());
  if (!pair) {
    return
  }
  pair.assetRecipient = event.params.a.toHexString();
  pair.updateTimestamp = event.block.timestamp;
  pair.save();
}
