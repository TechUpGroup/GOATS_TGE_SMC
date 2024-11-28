import { Address, toNano, beginCell } from '@ton/core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { compile, NetworkProvider, UIProvider} from '@ton/blueprint';
// import { promptAddress, promptBool, promptUrl } from '../wrappers/ui-utils';
import dotenv from "dotenv";
dotenv.config(); 

export async function run(provider: NetworkProvider) {
    const ui       = provider.ui();
    const sender   = provider.sender();

    let owner      = Address.parse(process.env.OWNER ?? '');

    let fromAddress = Address.parse(process.env.WALLET ?? '');
    let vestingAddress = Address.parse(process.env.VESTING ?? '');
    let poolAddress = Address.parse(process.env.POOL_JETTON ?? '');
    const wallet = provider.open(JettonWallet.createFromAddress(fromAddress));
    let payload = beginCell().storeUint(0, 1).endCell();
    await wallet.sendTransfer(
        provider.sender(), 
        toNano("0.07"),
        toNano("1000000000"),
        poolAddress,
        owner,
        null,
        toNano("0.02"),
        payload
    );
}