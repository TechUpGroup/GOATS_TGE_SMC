import { Address, toNano, beginCell } from '@ton/core';
import { Vesting } from '../wrappers/Vesting';
import { JettonMinter } from '../wrappers/JettonMinter';
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
    let amount = toNano('600');
    let jettonAddress = Address.parse(process.env.TOKEN ?? '');
    let jetton = provider.open(
        JettonMinter.createFromAddress(jettonAddress)
    );
    let jettonData = await jetton.getJettonData();
    let jettonWalletCode = jettonData.walletCode;

    await pool.sendOwnerWithdrawJetton(provider.sender(), {
        amount,
        toAddress: owner,
        jettonAddress,
        jettonWalletCode,
        value: toNano('0.05'),
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
