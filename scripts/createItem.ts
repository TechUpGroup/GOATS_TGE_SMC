import { toNano, Address } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton/blueprint';
import { mnemonicToWalletKey, sign } from '@ton/crypto';
import dotenv from "dotenv";
dotenv.config(); 

export async function run(provider: NetworkProvider) {
    const address = Address.parse(process.env.VESTING ?? '');
    let rewardTokenAddress = Address.parse(process.env.TOKEN ?? '');
    // let owner      = Address.parse(process.env.OWNER ?? '');
    let owner      = Address.parse("0QD8O4NPwsvlLzmghGar_WFonuLOcX_OCY4U9Jm1hZuR2dU1");
    // let itemCode = await compile('VestingItem')
    // let jettonWalletCode = await compile('JettonWallet');
    let jetton = provider.open(
        JettonMinter.createFromAddress(rewardTokenAddress)
    );
    let jettonData = await jetton.getJettonData();
    let jettonWalletCode = jettonData.walletCode;
    // console.log(jettonData)
    const vesting = provider.open(
        Vesting.createFromAddress(address)
    );

    await vesting.sendCreateVesting(provider.sender(), {
        value: toNano('0.08'),
        totalVesting: toNano("2000000"),
        ownerItem: owner,
        tokenAddress: rewardTokenAddress,
        jettonWalletCode
    });

    // console.log('pool data', await pool.getPoolData());
}
