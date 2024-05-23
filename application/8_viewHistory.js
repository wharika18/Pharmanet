'use strict';

/**
 * This is a Node.JS application to fetch history of the drug from network
 * Defaults:
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo) {
	
	try {
		const pharmanetContract = await helper.getContractInstance();
		
		// Get the drug account
		console.log('.....Get history of  Drug Account');
		const drugHistoryBuffer = await pharmanetContract.submitTransaction('viewHistory', drugName, serialNo);
		
		// process response
		console.log('.....Processing Get Drug History Transaction Response\n\n');
		let drugHistory = JSON.parse(drugHistoryBuffer.toString());
		console.log(drugHistory);
		console.log('\n\n.....Get Drug HistoryTransaction Complete!');
		return drugHistory;
		
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