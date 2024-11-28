import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type PoolJettonConfig = {
    balance: bigint;
    operatorPublicKey: Buffer;
    jettonTokenAddress: Address;
    ownerAddress: Address;
    jettonWalletCode: Cell;
    nonceCode: Cell;
};

export function poolJettonConfigToCell(config: PoolJettonConfig): Cell {
    return beginCell()
        .storeCoins(config.balance)
        .storeBuffer(config.operatorPublicKey)
        .storeAddress(config.ownerAddress)
        .storeAddress(config.jettonTokenAddress)
        .storeRef(config.jettonWalletCode)
        .storeRef(config.nonceCode)
        .endCell();
}

export const Opcodes = {
    deposit: 0xf9471134,
    withdraw: 0xcb03bfaf,
    ownerWithdraw: 0xce9dd194,
    ownerWithdrawJetton: 0x3267b960,
    changeOwner: 0xf1eef33c,
    changeOperator: 0x9a89624c,
    changeTreasury: 0x98ebf3fd,
    checkNonce: 0xabcb7363,
    internalWithdraw: 0x3bda2d82,
    excesses: 0xd53276db,
    transferNotification: 0x7362d09c,
};

export const Events = {
    usedNonce: 0x0d58c2cb,
    deposited: 0x908952b8,
    withdrawn: 0x6c354eb2
}

export class Pool implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Pool(address);
    }

    static createFromConfig(config: PoolJettonConfig, code: Cell, workchain = 0) {
        const data = poolJettonConfigToCell(config);
        const init = { code, data };
        return new Pool(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendWithdraw(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            nonce: bigint;
            amount: bigint;
            signature: Buffer;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdraw, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.nonce, 64)
                .storeCoins(opts.amount)
                .storeBuffer(opts.signature)
                .endCell(),
        });
    }

    async sendOwnerWithdraw(
        provider: ContractProvider,
        via: Sender,
        opts: {
            amount: bigint;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.ownerWithdraw, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeCoins(opts.amount)
                .endCell(),
        });
    }

    async sendChangeOwner(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newOwnerAddress: Address;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.changeOwner, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeAddress(opts.newOwnerAddress)
                .endCell(),
        });
    }

    async sendChangeOperator(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newOperator: Buffer;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.changeOperator, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeBuffer(opts.newOperator)
                .endCell(),
        });
    }

    async getPoolJettonData(provider: ContractProvider) {
        const result = await provider.get('get_pool_jetton_data', []);
        let balance = result.stack.readBigNumber();
        let operatorPublicKey = result.stack.readBigNumber();
        let ownerAddress = result.stack.readAddress();
        let jettonTokenAddress = result.stack.readAddress();
        let jettonWalletCode = result.stack.readCell();
        let nonceCode = result.stack.readCell();
        return {
            balance,
            operatorPublicKey,
            ownerAddress,
            jettonTokenAddress,
            jettonWalletCode,
            nonceCode
        };
    }

    async getItemAddress(provider: ContractProvider, userAddress: Address) {
        const result = await provider.get('get_item_address', [{type: 'slice', cell: beginCell().storeAddress(userAddress).endCell()}]);
        return result.stack.readAddress();
    }

    async getNonceAddress(provider: ContractProvider, nonce: bigint) {
        const result = await provider.get('get_nonce_address', [{type: 'int', value: nonce}]);
        return result.stack.readAddress();
    }

    async getVerifyWithdrawResult(
        provider: ContractProvider, 
        nonce: bigint, 
        amount: bigint, 
        receiveAddress: Address,
        signature: Buffer
    ) {
        const result = await provider.get('get_verify_withdraw_result', [
            {type: 'int', value: nonce},
            {type: 'int', value: amount},
            {type: 'slice', cell: beginCell().storeAddress(receiveAddress).endCell()},
            {type: 'slice', cell: beginCell().storeBuffer(signature).endCell()},
        ]);
        return result.stack.readNumber();
    }
}
