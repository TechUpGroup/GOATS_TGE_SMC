import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type VestingConfig = {
    currentPeriod: number;
    operatorAddress: Address;
    ownerAddress: Address;
    vestingItemCode: Cell;
};

export function vestingConfigToCell(config: VestingConfig): Cell {
    return beginCell()
        .storeUint(config.currentPeriod, 8)
        .storeAddress(config.operatorAddress)
        .storeAddress(config.ownerAddress)
        .storeRef(config.vestingItemCode)
        .endCell();
}

export const Opcodes = {
    createVesting: 0x30f7ebe1,
    claim: 0x013a3ca6,
    increase: 0x7e8764ef,
};

export class Vesting implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Vesting(address);
    }

    static createFromConfig(config: VestingConfig, code: Cell, workchain = 0) {
        const data = vestingConfigToCell(config);
        const init = { code, data };
        return new Vesting(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendIncrease(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.increase, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    async sendClaim(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            ownerItem: Address;
            tokenAddress: Address;
            jettonWalletCode: Cell;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.claim, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.ownerItem)
                .storeAddress(opts.tokenAddress)
                .storeRef(opts.jettonWalletCode)
                .endCell(),
        });
    }

    async sendCreateVesting(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            totalVesting: bigint;
            ownerItem: Address;
            tokenAddress: Address;
            jettonWalletCode: Cell;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.createVesting, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeCoins(opts.totalVesting)
                .storeAddress(opts.ownerItem)
                .storeAddress(opts.tokenAddress)
                .storeRef(opts.jettonWalletCode)
                .endCell(),
        });
    }

    async getVestingData(provider: ContractProvider) {
        const result = await provider.get('get_vesting_data', []);
        const currentPeriod = result.stack.readNumber();
        const operatorAddress = result.stack.readAddress();
        const ownerAddress = result.stack.readAddress();
        const vestingItemCode = result.stack.readCell();
        return {
            currentPeriod,
            operatorAddress,
            ownerAddress,
            vestingItemCode
        };
    }

    async getItemAddress(provider: ContractProvider, userAddress: Address, tokenAddress: Address, jettonWalletCode: Cell) {
        const result = await provider.get('get_item_address', [
            {type: 'slice', cell: beginCell().storeAddress(userAddress).endCell()},
            {type: 'slice', cell: beginCell().storeAddress(tokenAddress).endCell()},
            {type: 'cell', cell: jettonWalletCode}
        ]);
        return result.stack.readAddress();
    }
}
