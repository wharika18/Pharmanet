'use strict';

/**
 * This is a Node.JS application to create PO
 */

const helper = require('./contractHelper');

async function main(buyerCompanyCRN,sellerCompanyCRN,drugName, quantity) {
	
	try {
		const pharmanetContract = await helper.getContractInstance();
		
		// Create a new drug account
		console.log('.....Registering a new drug');
		const poBuffer = await pharmanetContract.submitTransaction('createPO', buyerCompanyCRN,sellerCompanyCRN,drugName, quantity);
		
		// process response
		console.log('.....Processing Transaction Response \n\n');
		let newPO = JSON.parse(poBuffer.toString());
		console.log(newPO);
		console.log('\n\n.....create PO Transaction Complete!');
		return newPO;
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}

module.exports.execute = main;