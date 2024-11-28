import { Address, toNano, beginCell } from '@ton/core';
import { Pool } from '../wrappers/Pool';
import { NetworkProvider, sleep, compile } from '@ton/blueprint';
import { mnemonicToWalletKey, sign } from '@ton/crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(process.env.POOL_JETTON ?? '');

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const pool = provider.open(Pool.createFromAddress(address));
    let nonce = BigInt(Math.floor(Math.random() * 10000000000));
    let amount = toNano('50000');
    let owner      = Address.parse(process.env.OWNER ?? '');
    let operatorMnemonicArray = process.env.OPERATOR_MNEMONIC ?? '';
    const operatorKeyPair = await mnemonicToWalletKey(operatorMnemonicArray.split(' '));
    let operatorPublicKey = operatorKeyPair.publicKey;
    let toSign = beginCell()
                    .storeUint(nonce, 64)
                    .storeCoins(amount)
                    .storeAddress(owner);
    let signature = sign(toSign.endCell().hash(), operatorKeyPair.secretKey);

    await pool.sendWithdraw(provider.sender(), {
        nonce,
        amount,
        signature,
        value: toNano('0.07'),
    });

    // ui.write('Waiting for counter to increase...');

    // let counterAfter = await pool.getCounter();
    // let attempt = 1;
    // while (counterAfter === counterBefore) {
    //     ui.setActionPrompt(`Attempt ${attempt}`);
    //     await sleep(2000);
    //     counterAfter = await pool.getCounter();
    //     attempt++;
    // }

    // ui.clearActionPrompt();
    // ui.write('Counter increased successfully!');
}
