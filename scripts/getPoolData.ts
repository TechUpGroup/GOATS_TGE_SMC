import { Address, toNano } from '@ton/core';
import { Pool } from '../wrappers/Pool';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(process.env.POOL_JETTON ?? '');

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const pool = provider.open(Pool.createFromAddress(address));

    const counterBefore = await pool.getPoolJettonData();
    console.log(counterBefore)
}
