import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export class VestingItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new VestingItem(address);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getItemData(provider: ContractProvider) {
        const result = await provider.get('get_item_data', []);
        const totalVesting = result.stack.readBigNumber();
        const claimedAmount = result.stack.readBigNumber();
        const vestingAddress = result.stack.readAddress();
        const ownerAddress = result.stack.readAddress();
        const tokenAddress = result.stack.readAddress();
        const jettonWalletCode = result.stack.readCell();
        return {
            totalVesting,
            claimedAmount,
            vestingAddress,
            ownerAddress,
            tokenAddress,
            jettonWalletCode
        };
    }
}
