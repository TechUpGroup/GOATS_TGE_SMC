import { Address, toNano, beginCell } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { NetworkProvider, sleep, compile } from '@ton/blueprint';
import { mnemonicToWalletKey, sign } from '@ton/crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(process.env.VESTING ?? '');
    let owner      = Address.parse(process.env.OWNER ?? '');

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const pool = provider.open(Vesting.createFromAddress(address));
    let amount = toNano('0.01');

    await pool.sendOwnerWithdraw(provider.sender(), {
        amount,
        toAddress: owner,
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
}
