'use strict';

/**
 * This is a Node.JS application for retail drug
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo, retailerCRN, customerAadhar) {
	
	try {
		const pharmanetContract = await helper.getContractInstance();
		
		// retail drug transaction
		console.log('.....Updating shipment');
		const retailDrugBuffer = await pharmanetContract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);
		
		// process response
		console.log(retailDrugBuffer.toString());
		console.log('.....Processing Transaction Response \n\n');
		let newretailDrug = JSON.parse(retailDrugBuffer.toString());
		console.log(newretailDrug);
		console.log('\n\n.....retail Drug Transaction Complete!');
		return newretailDrug;
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}

//main("Paracetamol","004","RET002","AAD001");
module.exports.execute = main;