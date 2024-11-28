import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type NonceConfig = {
    isUsed: number;
    nonce: bigint;
    poolAddress: Address
};

export function nonceConfigToCell(config: NonceConfig): Cell {
    return beginCell().storeUint(config.isUsed, 2).storeUint(config.nonce, 64).storeAddress(config.poolAddress).endCell();
}

export const Opcodes = {
    deposit: 0xf9471134,
    withdraw: 0xcb03bfaf,
    owner_withdraw: 0xce9dd194,
    change_owner: 0xf1eef33c,
    change_operator: 0x9a89624c,
    check_nonce: 0xabcb7363,
    internal_withdraw: 0x3bda2d82,
    excesses: 0xd53276db,
};

export class Nonce implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Nonce(address);
    }

    static createFromConfig(config: NonceConfig, code: Cell, workchain = 0) {
        const data = nonceConfigToCell(config);
        const init = { code, data };
        return new Nonce(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getNonceData(provider: ContractProvider) {
        const result = await provider.get('get_nonce_data', []);
        const isUsed = result.stack.readNumber();
        const nonce = result.stack.readBigNumber();
        const poolAddress = result.stack.readAddress();
        return {
            isUsed,
            nonce,
            poolAddress
        };
    }
}
