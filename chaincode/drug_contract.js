' use strict';


// Gets fabric contract api libraries and references within the code.
const { Contract } = require('fabric-contract-api');

class pharmanet extends Contract {
    constructor() {
        super('pharmanet');
    }

    async instantiate(ctx) {
        /*
        Instantiate function is created to test whether chaincode successfully deployed or not.
        */
        console.log('chaincode successfully deployed');
    }

    async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
        /*
        This transaction/function will be used to register new entities on the ledger
        Arguments:
        companyCRN: CRN is a unique identification number allotted to all the registered companies
        companyName: Name of the company
        location: Location of the company
        organizationRole: This field will take either of the following roles: Manufacturer Distributor Retailer Transporter

        Returns: Company object
        */
        const companyKey = ctx.stub.createCompositeKey('pharmanet.company', [companyCRN]);
        let scoreObject = {
            manufacturer: 1,
            distributor: 2,
            retailer: 3,
            consumer: 4,
            transporter: 0
        }
        let hierarchyKey = scoreObject[organisationRole];
        const newCompanyObject = {
            docType: 'Company',
            companyID: companyCRN + " " + companyName,
            name: companyName,
            location: location,
            organisationRole: organisationRole,
            hierarchyKey: hierarchyKey
        }
        const companyBuffer = Buffer.from(JSON.stringify(newCompanyObject));
        await ctx.stub.putState(companyKey, companyBuffer);
        return newCompanyObject;

    }

    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
        /*
        This transaction is used by any organisation registered as a ‘manufacturer’ to register a new drug on the ledger.
        Arguments:
        drugName: Name of the product
        serialNo: Unique number used for tracking
        mfgDate: Date of manufacturing of the drug
        expDate: Expiration date of the drug
        companyCRN: CRN is a unique identification number allotted to all the registered companies

        returns: A drug object after adding into ledger.
        */
        const companyKey = ctx.stub.createCompositeKey('pharmanet.company', [companyCRN]);
        const companyBuffer = await ctx.stub.getState(companyKey);
        if (companyBuffer) {
            let compdict = JSON.parse(companyBuffer.toString());
            //This transaction should be invoked only by a manufacturer registered on the ledger.
            if (compdict.organisationRole == "manufacturer") {
                const drugKey = ctx.stub.createCompositeKey('pharmanet.drug', [drugName]);
                const newDrugObject = {
                    docType: 'Drug',
                    productID: drugName + " " + serialNo,
                    name: drugName,
                    manufacturer: compdict.name,
                    manufacturingDate: mfgDate,
                    expiryDate: expDate,
                    owner: compdict.name,
                    shipment: []
                }
                const drugBuffer = Buffer.from(JSON.stringify(newDrugObject));
                await ctx.stub.putState(drugKey, drugBuffer);
                return newDrugObject;
            }
            else {
                return "Only Manufacturer can add the drugs";
            }
        }


    }

    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
        /*
        This function is used to create a Purchase Order (PO) to buy drugs, by companies belonging to ‘Distributor’ or ‘Retailer’ organisation.
        Arguments:
        buyerCRN: One who buys medicine, it can be retailer or distributor
        sellerCRN: One who sells medicine, it can be manufacturer or retailer.
        drugName: Name of the product
        Quantity: Number of strips purchased.

        returns PO object
        */
        const buyerKey = ctx.stub.createCompositeKey('pharmanet.company', [buyerCRN]);
        const buyerBuffer = await ctx.stub.getState(buyerKey);

        const sellerKey = ctx.stub.createCompositeKey('pharmanet.company', [sellerCRN]);
        const sellerBuffer = await ctx.stub.getState(sellerKey);

        let scoreObject = {
            manufacturer: 1,
            distributor: 2,
            retailer: 3,
            consumer: 4
        }

        if (buyerBuffer && sellerBuffer) {
            let buyerdict = JSON.parse(buyerBuffer.toString());
            let sellerdict = JSON.parse(sellerBuffer.toString());
            let buyerName = buyerdict.companyName;
            let sellerName = sellerdict.companyName;
            let buyerRole = buyerdict.organisationRole;
            let sellerRole = sellerdict.organisationRole;
            let buyerScore = scoreObject[buyerdict.organisationRole];
            let sellerScore = scoreObject[sellerdict.organisationRole];
            // A logic to transferring drug takes place in a hierarchical manner and no organisation in the middle is skipped.
            if (buyerScore === (sellerScore + 1)) {
                const POKey = ctx.stub.createCompositeKey('pharmanet.po', [buyerCRN, drugName]);
                const newPOObject = {
                    docType: 'PO',
                    poID: buyerCRN + drugName,
                    drugName: drugName,
                    quantity: quantity,
                    buyer: buyerName + " " + buyerCRN,
                    seller: sellerName + " " + sellerCRN
                }
                const POBuffer = Buffer.from(JSON.stringify(newPOObject));
                await ctx.stub.putState(POKey, POBuffer);
                return newPOObject;
            }
            else {
                return buyerName + "(" + buyerRole + ")" + " is not eligible to buy from " + sellerName + "(" + sellerRole + ")";
            }

        }
    }

    async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
        /*
        Once buyer invokes the createPO transaction, the seller invokes this transaction to transport the consignment
        via a transporter corresponding to each PO.
        Arguments:
        buyerCRN: One who buys medicine, it can be retailer or distributor
        drugName: Name of the product
        listOfAssets: A list which contains a series of serial number
        transporterCRN: One who transports medicine.
        */
        const POKey = ctx.stub.createCompositeKey('pharmanet.po', [buyerCRN, drugName]);
        const POBuffer = await ctx.stub.getState(POKey);
        const buyerKey = ctx.stub.createCompositeKey('pharmanet.company', [buyerCRN]);
        const buyerBuffer = await ctx.stub.getState(buyerKey);
        const transporterKey = ctx.stub.createCompositeKey('pharmanet.company', [transporterCRN]);
        const transporterBuffer = await ctx.stub.getState(transporterKey);
        let podict = JSON.parse(POBuffer.toString());
        let buyerdict = JSON.parse(buyerBuffer.toString());
        let transporterdict = JSON.parse(transporterBuffer.toString());
        let poid = podict.poID;
        let quantity = podict.quantity;
        //let length = listOfAssets.length;
        if (poid && listOfAssets === quantity) {
            const shipmentKey = ctx.stub.createCompositeKey('pharmanet.shipment', [buyerCRN, drugName]);
            const newshipmentObject = {
                docType: 'shipment',
                creator: buyerdict.name,
                assets: drugName + ": " + listOfAssets,
                transporter: transporterdict.name + " " + transporterCRN,
                status: 'in-transit'
            }
            const shipmentBuffer = Buffer.from(JSON.stringify(newshipmentObject));
            await ctx.stub.putState(shipmentKey, shipmentBuffer);
            return newshipmentObject;
        }
        else {
            return "PO ID is not registered on the network or quantity is not matching";
        }
    }

    async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
        /*
        This transaction is used to update the status of the shipment to ‘Delivered’ when the consignment gets delivered to the destination.
        Arguments:
        buyerCRN: One who buys medicine, it can be retailer or distributor
        drugName: Name of the product
        transporterCRN: One who transports medicine.

        */
        const shipmentKey = ctx.stub.createCompositeKey('pharmanet.shipment', [buyerCRN, drugName]);
        const shipmentBuffer = await ctx.stub.getState(shipmentKey);
        let shipmentdict = JSON.parse(shipmentBuffer.toString());
        const transporterKey = ctx.stub.createCompositeKey('pharmanet.company', [transporterCRN]);
        const transporterBuffer = await ctx.stub.getState(transporterKey);
        let transporterdict = JSON.parse(transporterBuffer.toString());
        let transporter = transporterdict.name + " " + transporterCRN;
        const drugKey = ctx.stub.createCompositeKey('pharmanet.drug', [drugName]);
        const drugBuffer = await ctx.stub.getState(drugKey);
        let drugdict = JSON.parse(drugBuffer.toString());
        let shipment_transporter = shipmentdict.transporter;
        if (transporter === shipment_transporter) {
            shipmentdict.status = 'delivered';
            drugdict.owner = shipmentdict.creator;
            drugdict.shipment.push(shipmentKey);
            const shipmentBuffer = Buffer.from(JSON.stringify(shipmentdict));
            await ctx.stub.putState(shipmentKey, shipmentBuffer);
            const drugBuffer = Buffer.from(JSON.stringify(drugdict));
            await ctx.stub.putState(drugKey, drugBuffer);
            return shipmentdict;
        }
        else {
            return "transporter CRN doesn't have any shipment entries";
        }
    }


    async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
        /*
        This transaction is called by the retailer while selling the drug to a consumer.

        */

        const retailerKey = ctx.stub.createCompositeKey('pharmanet.company', [retailerCRN]);
        const retailerBuffer = await ctx.stub.getState(retailerKey);
        let retailerdict = JSON.parse(retailerBuffer.toString());

        const drugKey = ctx.stub.createCompositeKey('pharmanet.drug', [drugName]);
        const drugBuffer = await ctx.stub.getState(drugKey);
        let drugdict = JSON.parse(drugBuffer.toString());

        let organizationRole = retailerdict.organisationRole;

        if (organizationRole == "retailer") {
            let serial_no = drugdict.productID;

            if (serial_no.includes(serialNo)) {
                drugdict.owner = customerAadhar;
                const drugBuffer = Buffer.from(JSON.stringify(drugdict));
                await ctx.stub.putState(drugKey, drugBuffer);
                return drugdict;
            }
            else {
                return "Only retailer can retail the drugs";
            }


        }
    }

    async viewHistory(ctx, drugName, serialNo) {
        /*
        This transaction will be used to view the lifecycle of the product by fetching transactions from the blockchain.
        */
        const drugKey = ctx.stub.createCompositeKey('pharmanet.po', [drugName]);
        let iterator = await ctx.stub.getHistoryForKey(drugKey);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value) {
                console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
                const obj = JSON.parse(res.value.value.toString('utf8'));
                result.push(obj);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return result;

    }

    async viewDrugCurrentState(ctx, drugName, serialNo) {
        /*
        This transaction is used to view the current state of the Asset.
        */
        const drugKey = ctx.stub.createCompositeKey('pharmanet.drug', [drugName]);
        const drugBuffer = await ctx.stub.getState(drugKey);
        if (drugBuffer) {
            let drugdict = JSON.parse(drugBuffer.toString());
            return drugdict;
        }
        else {
            return "State is not available for the provided drugname";
        }




    }
}
// module.exports is mandatory since we are exporting into index.js
module.exports = pharmanet;