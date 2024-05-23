'use strict';

/**
 * This is a Node.JS application to create shipment
 */

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, listOfAssets, transporterCRN) {
	
	try {
		const pharmanetContract = await helper.getContractInstance();
		
		// Create a shipment
		console.log('.....Creating shipment');
		const shipmentBuffer = await pharmanetContract.submitTransaction('createShipment', buyerCRN, drugName, listOfAssets, transporterCRN);
		
		// process response
		console.log('.....Processing Transaction Response \n\n');
		let newShipment = JSON.parse(shipmentBuffer.toString());
		console.log(newShipment);
		console.log('\n\n.....create shipment Transaction Complete!');
		return newShipment;
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}
// main("DIST001","Paracetamol","3","TRA001");

module.exports.execute = main;