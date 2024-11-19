import { Address, toNano } from '@ton/core';
import { JettonMinter } from '../wrappers/JettonMinter';
import { compile, NetworkProvider, UIProvider} from '@ton/blueprint';
// import { promptAddress, promptBool, promptUrl } from '../wrappers/ui-utils';

export async function run(provider: NetworkProvider) {
    const ui       = provider.ui();
    const sender   = provider.sender();

    let owner      = Address.parse('0QBlrUbInv_chfGy-yWqPiQTLToC6aoh_53VyTAZcu3n8CPc');
    let stakeAddress = Address.parse('0QBm-Im0bxiD0UIKW6_OMa5NPptLnjrKPbVoA_K8OWFdJQy9');

    let jettonAddress = Address.parse('kQDkc3thxHBihDn_2v01BS3-ioSifCmTmAV93lU-yFRlCNtH');
    const collection = provider.open(JettonMinter.createFromAddress(jettonAddress));
    await collection.sendChangeAdmin(provider.sender(), stakeAddress);
}