/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// 连接fabric网络
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');

// 获取first-network 对应地址   
const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

async function main(ID) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

         // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(ID);
        if (userExists) {
            console.log('An identity for the user ',ID,' already exists in the wallet');
            return;
        }
        
        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: ID, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: ID, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(ID, userIdentity);
        console.log('Successfully registered and enrolled admin user ',ID,',and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user ",${ID},${error}`);
        process.exit(1);
    }
}
async function sleep(delay) {
    var start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {
      continue;
    }
}
  
for( var i = 61; i <= 61 ; i += 1 ){
    // main('user3');
    const ID = 'user'+i;
    console.log('注册',ID);
    main(ID);
    sleep(1000);
}
