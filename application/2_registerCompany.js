'use strict';

/**
 * This is a Node.JS application to register a company
 */

const helper = require('./contractHelper');

async function main(companyCRN, companyName, location, organisationRole) {
	
	try {
		const pharmanetContract = await helper.getContractInstance();
		//console.log(pharmanetContract);
		
		// Create a new company account
		console.log('.....Registering a new company');
		const companyBuffer = await pharmanetContract.submitTransaction('registerCompany', companyCRN, companyName, location, organisationRole);
		
		// process response
		console.log('.....Processing registering company Transaction Response \n\n');
		let newCompany = JSON.parse(companyBuffer.toString());
		console.log(newCompany);
		console.log('\n\n.....Registration of the company Transaction Complete!');
		return newCompany;
		
	} catch (error) {
		
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
		
	} finally {
		
		// Disconnect from the fabric gateway
		helper.disconnect();
		
	}
}
// main("MAN001","Sun Pharma","Chennai","manufacturer");

module.exports.execute = main;