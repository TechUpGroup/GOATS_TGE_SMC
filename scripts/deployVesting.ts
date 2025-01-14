import { toNano, Address, beginCell } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton/blueprint';
import { mnemonicToWalletKey, sign } from '@ton/crypto';
import dotenv from "dotenv";
dotenv.config(); 

export async function run(provider: NetworkProvider) {
    let rewardTokenAddress = Address.parse(process.env.TOKEN ?? '');
    let owner      = Address.parse(process.env.OWNER ?? '');
    let itemCode = await compile('VestingItem')
    // let jettonWalletCode = await compile('JettonWallet');
    let jetton = provider.open(
        JettonMinter.createFromAddress(rewardTokenAddress)
    );
    let jettonData = await jetton.getJettonData();
    let jettonWalletCode = jettonData.walletCode;
    let tokenInfo = beginCell().storeAddress(rewardTokenAddress).storeRef(jettonWalletCode).endCell();
    // console.log(jettonData)
    const vesting = provider.open(
        Vesting.createFromConfig(
            {
                currentPeriod: 0,
                latestTime: 0n,
                balance: 0n,
                operatorAddress: owner,
                ownerAddress: owner,
                vestingItemCode: itemCode,
                tokenInfo
            },
            await compile('Vesting')
        )
    );

    await vesting.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(vesting.address);

    // console.log('pool data', await pool.getPoolData());
}
