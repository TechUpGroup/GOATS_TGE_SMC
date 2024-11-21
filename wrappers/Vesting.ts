import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type VestingConfig = {
    currentPeriod: number;
    latestTime: bigint;
    balance: bigint;
    operatorAddress: Address;
    ownerAddress: Address;
    vestingItemCode: Cell;
    tokenInfo: Cell;
};

export function vestingConfigToCell(config: VestingConfig): Cell {
    return beginCell()
        .storeUint(config.currentPeriod, 8)
        .storeUint(config.latestTime, 32)
        .storeCoins(config.balance)
        .storeAddress(config.operatorAddress)
        .storeAddress(config.ownerAddress)
        .storeRef(config.vestingItemCode)
        .storeRef(config.tokenInfo)
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
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.claim, 32)
                .storeUint(opts.queryID ?? 0, 64)
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
                .endCell(),
        });
    }

    async getVestingData(provider: ContractProvider) {
        const result = await provider.get('get_vesting_data', []);
        const currentPeriod = result.stack.readNumber();
        const latestTime = result.stack.readBigNumber();
        const balance = result.stack.readBigNumber();
        const operatorAddress = result.stack.readAddress();
        const ownerAddress = result.stack.readAddress();
        const vestingItemCode = result.stack.readCell();
        const tokenInfo = result.stack.readCell();
        return {
            currentPeriod,
            latestTime,
            balance,
            operatorAddress,
            ownerAddress,
            vestingItemCode,
            tokenInfo
        };
    }

    async getTokenData(provider: ContractProvider) {
        const result = await provider.get('get_token_data', []);
        const tokenAddress = result.stack.readAddress();
        const jettonWalletCode = result.stack.readCell();
        return {
            tokenAddress,
            jettonWalletCode
        };
    }

    async getItemAddress(provider: ContractProvider, userAddress: Address) {
        const result = await provider.get('get_item_address', [
            {type: 'slice', cell: beginCell().storeAddress(userAddress).endCell()}
        ]);
        return result.stack.readAddress();
    }
}
