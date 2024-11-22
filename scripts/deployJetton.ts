import { Address, toNano } from '@ton/core';
import { JettonMinter, JettonMinterContent, jettonContentToCell, jettonMinterConfigToCell } from '../wrappers/JettonMinter';
import { compile, NetworkProvider, UIProvider} from '@ton/blueprint';
import { buildOnchainMetadata } from './jetton-helpers';

export async function run(provider: NetworkProvider) {
    const jettonParams = {
        name: "ANH Token",
        description: "Official token of ANH",
        symbol: "ANH",
        image: "https://token.hamsterkombatgame.io/token/icon.png",
    };

    // Create content Cell
    let content = buildOnchainMetadata(jettonParams);
    let admin      = Address.parse(process.env.OWNER ?? '');

    const wallet_code = await compile('JettonWallet');

    const minter  = JettonMinter.createFromConfig({admin,
                                                  content,
                                                  wallet_code,
                                                  }, 
                                                  await compile('JettonMinter'));

    // await provider.deploy(minter, toNano('0.05'));
    const myMinter = provider.open(minter);
    await myMinter.sendDeploy(provider.sender(), toNano('0.05'));
    await provider.waitForDeploy(myMinter.address)

    // run methods on `sampleJetton`
}