/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');
const namerouter="router1"

const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('rup2');
        const contract2 = network.getContract('mycc6')
        

        
        // var content = 'Content'
        // var router = 'router'
        // for(var i=0;i<10;i++){
        //     const result = await contract.submitTransaction('createLine', content+String(i), router+String(i));
        //     console.log(`Transaction has been submitted ${result.toString()}`);
        // }
        console.log('新增一个content')
        console.time('testTime');//testTime为计时器的名称
        const result11 = await contract.submitTransaction('createLine', 'Derek', 'router1   ');
        console.timeEnd('testTime');
        console.log(`Transaction has been submitted ${result11.toString()}`);

        console.log('查询content')
        console.time('testTime');//testTime为计时器的名称
        const result = await contract.evaluateTransaction('queryLine','Content2');
        console.timeEnd('testTime');
        var relist = eval('('+result.toString()+')')
        console.log(relist.Routerlist[3])
        // console.log(result.toString())
        // 选取哪一个路由
        // 转账
        console.log('转账')
        console.time('testTime');//testTime为计时器的名称
        const result0 = await contract2.submitTransaction('invoke',namerouter,relist.Routerlist[3],'10');
        console.timeEnd('testTime');
        console.log('Transaction has been submitted');
        
        // 查询
        console.log('查询账户1')
        console.time('testTime');//testTime为计时器的名称
        const result1 = await contract2.evaluateTransaction('query',namerouter);
        console.timeEnd('testTime');
        console.log(`Transaction has been evaluated, result is: ${result1.toString()}`);

        // // 查询
        console.log('查询账户2')
        console.time('testTime');//testTime为计时器的名称
        const result2 = await contract2.evaluateTransaction('query',relist.Routerlist[3]);
        console.timeEnd('testTime');
        console.log(`Transaction has been evaluated, result is: ${result2.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
