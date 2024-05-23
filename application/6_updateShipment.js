'use strict';

/**
 * This is a Node.JS application to update shipment
 */

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, transporterCRN) {
	
	try {
		const pharmanetContract = await helper.getContractInstance();
		
		// Create a shipment
		console.log('.....Updating shipment');
		const shipmentUpdateBuffer = await pharmanetContract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);
		
		// process response
		console.log('.....Processing Transaction Response \n\n');
		let newUpdateShipment = JSON.parse(shipmentUpdateBuffer.toString());
		console.log(newUpdateShipment);
		console.log('\n\n.....update shipment Transaction Complete!');
		return newUpdateShipment;
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}

module.exports.execute = main;