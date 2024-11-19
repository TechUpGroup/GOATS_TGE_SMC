import { Address, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider, UIProvider} from '@ton/blueprint';
// import { promptAddress, promptBool, promptUrl } from '../wrappers/ui-utils';
import dotenv from "dotenv";
dotenv.config(); 

export async function run(provider: NetworkProvider) {
    const ui       = provider.ui();
    const sender   = provider.sender();

    let owner      = Address.parse('0QBlrUbInv_chfGy-yWqPiQTLToC6aoh_53VyTAZcu3n8CPc');
    const vesting = Address.parse(process.env.VESTING ?? '');

    let jettonMinterAddress = Address.parse(process.env.TOKEN ?? '');
    if (!(await provider.isContractDeployed(jettonMinterAddress))) {
        ui.write(`Error: Contract at address ${jettonMinterAddress} is not deployed!`);
        return;
    }
    const jettonMiner = provider.open(JettonMinter.createFromAddress(jettonMinterAddress));
    ui.write('start miner');
    await jettonMiner.sendMint(provider.sender(), vesting, toNano('1000000000'), toNano('0.01'), toNano('0.03') );

}