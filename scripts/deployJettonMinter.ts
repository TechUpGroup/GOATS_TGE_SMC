import { Address, toNano } from '@ton/core';
import { JettonMinter, JettonMinterContent, jettonContentToCell, jettonMinterConfigToCell } from '../wrappers/JettonMinter';
import { compile, NetworkProvider, UIProvider} from '@ton/blueprint';
// import { promptAddress, promptBool, promptUrl } from '../wrappers/ui-utils';
import dotenv from "dotenv";
dotenv.config(); 

export async function run(provider: NetworkProvider) {
    const ui       = provider.ui();
    const sender   = provider.sender();

    let admin      = Address.parse(process.env.OWNER ?? '');
    let contentUrl = "https://goats-bot.s3.us-east-1.amazonaws.com/avatar/goats.json"

    const content = jettonContentToCell({type:1,uri:contentUrl});

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
}