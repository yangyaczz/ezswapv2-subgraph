import { Address, BigInt } from "@graphprotocol/graph-ts";
import { IERC721 } from "../generated/PairFactory/IERC721";  
import { IERC1155 } from "../generated/PairFactory/IERC1155";  
import { IERC20 } from "../generated/PairFactory/IERC20";  
import { LSSVMPair } from "../generated/PairFactory/LSSVMPair";


export function fetchBalanceOf(
  collectionAddress: Address,
  ownerAddress: Address
): BigInt | null{
  let contract = IERC721.bind(collectionAddress);

  let result = contract.try_balanceOf(ownerAddress);
  if (!result.reverted) {
    return result.value;
  } else {
    return null
  }
}


export function fetchNFTIds(
  pairAddress: Address
): BigInt[] | null{
  let contract = LSSVMPair.bind(pairAddress);

  let result = contract.try_getAllHeldIds();
  if (!result.reverted) {
    return result.value;
  } else {
    return null
  }
}

export function fetchNFTCount(
  pairAddress: Address
): BigInt | null{
  let contract = LSSVMPair.bind(pairAddress);

  let result = contract.try_getAllHeldIds();
  if (!result.reverted) {
    return BigInt.fromI32(result.value.length);
  } else {
    return null
  }
}

export function fetchNFT1155Count(
  pairAddress: Address
): BigInt | null{
  let contract = LSSVMPair.bind(pairAddress);

  let nftId = contract.try_nftId();
  let nftAddress = contract.try_nft();

  if(!nftId.reverted && !nftAddress.reverted) {
    let nft1155 = IERC1155.bind(nftAddress.value)

    let result = nft1155.try_balanceOf(contract._address, nftId.value)
    if (!result.reverted){
      return result.value
    } else {
      return null
    }
  } else {
    return null
  }
}


export function fetchERC20Balance(
  pairAddress: Address,
  ERC20Address: Address
): BigInt | null{
  let contract = IERC20.bind(ERC20Address);

  let result = contract.try_balanceOf(pairAddress);
  if (!result.reverted) {
    return result.value;
  } else {
    return null
  }
}


///////////////////////////////////

