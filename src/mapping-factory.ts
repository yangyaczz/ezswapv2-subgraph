import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  NewPair as NewPairEvent,
  NFTDeposit as NFTDepositEvent,
  ProtocolFeeMultiplierUpdate as ProtocolFeeMultiplierUpdateEvent,
  OperatorProtocolFeeStatusUpdate as OperatorProtocolFeeStatusUpdateEvent
} from "../generated/PairFactory/LSSVMPairFactory";

import { Pair, ProtocolFeeMultiplier, OperatorProtocolFeeMultiplier } from "../generated/schema";
import { LSSVMPair } from "../generated/templates";
import { fetchNFTIds, fetchNFTCount, fetchERC20Balance, fetchNFT1155Count } from "./utilsIERC721";

import { LSSVMPair as IPair } from "../generated/PairFactory/LSSVMPair";


// need to set up bondingCurveType address
export function handleNewPair(event: NewPairEvent): void {

  LSSVMPair.create(event.params.poolAddress)
  let pair = new Pair(event.params.poolAddress.toHexString())

  if (pair) {
    let contract = IPair.bind(event.params.poolAddress);

    // tx
    pair.tx = event.transaction.hash.toHexString();

    // collection
    let collection = contract.try_nft();
    if (!collection.reverted) {
      pair.collection = collection.value.toHexString();
    } else {
      pair.collection = null
    }

    // owner
    let owner = contract.try_owner();
    if (!owner.reverted) {
      pair.owner = owner.value.toHexString();
    } else {
      pair.owner = null
    }

    // token  tokenBalance
    let token = contract.try_token();
    if (!token.reverted) {
      pair.token = token.value.toHexString();
      pair.tokenBalance = fetchERC20Balance(event.params.poolAddress, token.value)
    } else {
      pair.token = null
    }


    // type
    let type = contract.try_poolType();
    if (!type.reverted) {
      pair.type = BigInt.fromI32(type.value);
    } else {
      pair.type = null
    }

    // assetRecipient
    let assetRecipient = contract.try_assetRecipient();
    if (!assetRecipient.reverted) {
      pair.assetRecipient = assetRecipient.value.toHexString();
    } else {
      pair.assetRecipient = null
    }

    // bondingCurve
    let bondingCurve = contract.try_bondingCurve();
    if (!bondingCurve.reverted) {
      pair.bondingCurve = bondingCurve.value.toHexString();
    } else {
      pair.bondingCurve = null
    }

    // delta
    let delta = contract.try_delta();
    if (!delta.reverted) {
      pair.delta = delta.value;
    } else {
      pair.delta = null
    }

    // fee
    let fee = contract.try_fee();
    if (!fee.reverted) {
      pair.fee = fee.value;
    } else {
      pair.fee = null
    }

    // spotPrice
    let spotPrice = contract.try_spotPrice();
    if (!spotPrice.reverted) {
      pair.spotPrice = spotPrice.value;
      pair.lastSpotPrice = spotPrice.value;
    } else {
      pair.spotPrice = null
    }



    let nftId1155 = contract.try_nftId()
    if (!nftId1155.reverted) {
      pair.is1155 = true
      // nftId1155
      pair.nftId1155 = nftId1155.value
      // nftCount1155
      pair.nftCount1155 = fetchNFT1155Count(event.params.poolAddress)
      pair.lastNftCount1155 = fetchNFT1155Count(event.params.poolAddress)
    } else {
      pair.is1155 = false
      // nftIds
      pair.nftIds = fetchNFTIds(event.params.poolAddress)
      // nftCount
      pair.nftCount = fetchNFTCount(event.params.poolAddress)
      pair.lastNftCount = fetchNFTCount(event.params.poolAddress)
    }

    // ethBalance  unuse
    pair.ethBalance = null

    // ethVolume
    pair.ethVolume = BigInt.fromI32(0); //

    // swapCount
    pair.swapCount = BigInt.fromI32(0) //

    // createTimestamp updateTimestamp
    pair.createTimestamp = event.block.timestamp;  // 
    pair.updateTimestamp = event.block.timestamp;  // 

    pair.save()
  }
}

export function handlerNFTDeposit(event: NFTDepositEvent): void {

  let pair = Pair.load(event.params.poolAddress.toHexString())

  if (pair) {
    if (pair.is1155) {
      pair.nftCount1155 = fetchNFT1155Count(event.params.poolAddress)
      pair.lastNftCount1155 = fetchNFT1155Count(event.params.poolAddress)
    } else {
      pair.nftIds = fetchNFTIds(event.params.poolAddress)
      pair.nftCount = fetchNFTCount(event.params.poolAddress)
      pair.lastNftCount = fetchNFTCount(event.params.poolAddress)
    }
    pair.updateTimestamp = event.block.timestamp;
    pair.save()
  }
}

export function handleProtocolFeeMultiplierUpdate(event: ProtocolFeeMultiplierUpdateEvent): void {
  let feeEntity = ProtocolFeeMultiplier.load("fee")
  if (!feeEntity) {
    feeEntity = new ProtocolFeeMultiplier("fee")
  }

  feeEntity.pfm = event.params.newMultiplier
  feeEntity.save()
}


export function handleOperatorProtocolFeeStatusUpdate(event: OperatorProtocolFeeStatusUpdateEvent): void {
  let oPFeefeeEntity = OperatorProtocolFeeMultiplier.load(event.params.nft.toHexString())
  if (!oPFeefeeEntity) {
    oPFeefeeEntity = new OperatorProtocolFeeMultiplier(event.params.nft.toHexString())
  }

  oPFeefeeEntity.collection = event.params.nft.toHexString()
  oPFeefeeEntity.totalFee = event.params.totalOperatorProtocolFeeMultipliers

  oPFeefeeEntity.save()
}
