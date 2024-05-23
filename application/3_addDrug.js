'use strict';

/**
 * This is a Node.JS application to add a drug
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo, manufacturingDate,expiryDate,companyCRN) {
	
	try {
		const pharmanetContract = await helper.getContractInstance();
		
		// Create a new drug account
		console.log('.....Registering a new drug');
		const drugBuffer = await pharmanetContract.submitTransaction('addDrug', drugName, serialNo, manufacturingDate,expiryDate,companyCRN);
		
		// process response
		console.log('.....Processing adding drug Transaction Response \n\n');
		let newDrug = JSON.parse(drugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....Adding of the drug Transaction Complete!');
		return newDrug;
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}

module.exports.execute = main;