import { Address, toNano, beginCell } from '@ton/core';
import { Pool } from '../wrappers/Pool';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { mnemonicToWalletKey, sign } from '@ton/crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(process.env.POOL_JETTON ?? '');

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const pool = provider.open(Pool.createFromAddress(address));
    let owner      = Address.parse(process.env.OWNER ?? '');
    let operatorMnemonicArray = process.env.OPERATOR_MNEMONIC ?? '';
    const operatorKeyPair = await mnemonicToWalletKey(operatorMnemonicArray.split(' '));
    let operatorPublicKey = operatorKeyPair.publicKey;


    // const counterBefore = await pool.getCounter();

    await pool.sendChangeOperator(provider.sender(), {
        newOperator: operatorPublicKey,
        value: toNano('0.02'),
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
    console.log('successfully!')
}
