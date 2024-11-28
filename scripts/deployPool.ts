import { toNano, Address } from '@ton/core';
import { Pool } from '../wrappers/Pool';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider } from '@ton/blueprint';
import { mnemonicToWalletKey, sign } from '@ton/crypto';
import dotenv from "dotenv";
dotenv.config(); 

export async function run(provider: NetworkProvider) {
    let operatorMnemonicArray = process.env.OPERATOR_MNEMONIC ?? '';
    const operatorKeyPair = await mnemonicToWalletKey(operatorMnemonicArray.split(' '));
    let operatorPublicKey = operatorKeyPair.publicKey;
    let jettonTokenAddress = Address.parse(process.env.TOKEN ?? '');
    let owner      = Address.parse(process.env.OWNER ?? '');
    let nonceCode = await compile('UsedNonce')
    // let jettonWalletCode = await compile('JettonWallet');
    let jetton = provider.open(
        JettonMinter.createFromAddress(jettonTokenAddress)
    );
    let jettonData = await jetton.getJettonData();
    let jettonWalletCode = jettonData.walletCode;
    const pool = provider.open(
        Pool.createFromConfig(
            {
                balance: BigInt(0),
                operatorPublicKey,
                jettonTokenAddress,
                ownerAddress: owner,
                jettonWalletCode,
                nonceCode
            },
            await compile('Pool')
        )
    );

    await pool.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(pool.address);

    // console.log('pool data', await pool.getPoolData());
}
