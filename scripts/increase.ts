import { toNano, Address } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton/blueprint';
import { mnemonicToWalletKey, sign } from '@ton/crypto';
import dotenv from "dotenv";
dotenv.config(); 

export async function run(provider: NetworkProvider) {
    const address = Address.parse(process.env.VESTING ?? '');
    const vesting = provider.open(
        Vesting.createFromAddress(address)
    );

    await vesting.sendIncrease(provider.sender(), {
        value: toNano('0.05')
    });

    // console.log('pool data', await pool.getPoolData());
}
