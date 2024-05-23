'use strict';

/**
 * This is a Node.JS application to fetch current state of the drug from network
 * Defaults:
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo) {
	
	try {
		const pharmanetContract = await helper.getContractInstance();
		
		// Get the drug account
		console.log('.....Get Drug Account');
		const DrugCurrentStateBuffer = await pharmanetContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);
		
		// process response
		console.log('.....Processing Get DrugCurrentState Transaction Response\n\n');
		let existingDrug = JSON.parse(DrugCurrentStateBuffer.toString());
		console.log(existingDrug);
		console.log('\n\n.....Get DrugCurrentState Transaction Complete!');
		return existingDrug;
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}

main().then(() => {
	
	console.log('.....API Execution Complete!');
	
}).catch((e) => {
	
	console.log('.....Transaction Exception: ');
	console.log(e);
	console.log(e.stack);
	process.exit(-1);
	
});

module.exports.execute = main;