// EJEMPLO JGO 2025 JUnio

/* Sample Suitelet to Mass Delete Transactions */
function suitelet(request, response) {

    //Create the form that will be used by the POST and GET requests
    var form = nlapiCreateForm('Delete Transactions');

    //GET - Show a list of transactions from the search results so the user can select the ones to be deleted
    if (request.getMethod() == 'GET') {
        // Run an existing transaction search
        var results = nlapiSearchRecord('transaction', 'customsearch_mass_deletion_results');

        // Create a sublist to show the search results
        var sublist = form.addSubList('custpage_transaction_list', 'list', 'Transactions');

        // Create an array to store the transactions from the search results
        var transactionArray = new Array();

        if (results != null) {
            // Add a checkbox column to the sublist to select the transactions that will be deleted.
            sublist.addField('delete', 'checkbox', 'Delete');

            // Add hidden columns for the Internal ID and for the Record type.
            // These fields are necessary for the nlapiDeleteRecord function.
            sublist.addField('internalid', 'text', 'Internal ID').setDisplayType('hidden');
            sublist.addField('recordtype', 'text', 'Record Type').setDisplayType('hidden');

            // Add a column for the Internal ID link
            sublist.addField('internalidlink', 'text', 'Internal ID');

            // Get the the search result columns
            var columns = results[0].getAllColumns();

            // Add the search columns to the sublist
            for (var i = 0; i < columns.length; i++) {
                sublist.addField(columns[i].getName(), 'text', columns[i].getName());
            }

            // For each search results row, create a transaction object and attach it to the transactionArray
            for (var i = 0; i < results.length; i++) {
                var transaction = new Object();
                // Set the Delete column to False
                transaction['delete'] = 'F';
                // Set the hidden internal ID field
                transaction['internalid'] = results[i].getId();
                // Set the hidden record type field
                transaction['recordtype'] = results[i].getRecordType();
                // Create a link so users can navigate from the list of transactions to a specific transaction
                var url = nlapiResolveURL('RECORD', results[i].getRecordType(), results[i].getId(), null);
                internalIdLink = " " + results[i].getId() + " ";
                // Set the link
                transaction['internalidlink'] = internalIdLink;
                // Copy the row values to the transaction object
                for (var j = 0; j < columns.length; j++) {
                    transaction[columns[j].getName()] = results[i].getValue(columns[j].getName());
                }
                // Attach the transaction object to the transaction array
                transactionArray[i] = transaction;
            }
        }
        // Initiate the sublist with the transactionArray
        sublist.setLineItemValues(transactionArray);
        sublist.addMarkAllButtons();
        form.addSubmitButton('Submit');
        response.writePage(form);
    }
    //POST - Delete the selected transactions and show a confirmation message
    else {
        // Check how many lines in the sublist
        var count = request.getLineItemCount('custpage_transaction_list');
        // This variable will keep track of how many records are deleted.
        var num = 0;
        //for each line in the sublist
        for (var i = 1; i < count + 1; i++) {
            //get the value of the Delete checkbox
            var deleteTransaction = request.getLineItemValue('custpage_transaction_list', 'delete', i);
            // If it's checked, delete the transaction
            if (deleteTransaction == 'T') {
                // Get the transaction internal ID
                var internalId = request.getLineItemValue('custpage_transaction_list', 'internalid', i);
                // Get the transaction type
                var recordType = request.getLineItemValue('custpage_transaction_list', 'recordtype', i);
                try {
                    // Delete the transaction
                    nlapiDeleteRecord(recordType, internalId);
                    num++;
                }
                // Errors will be logged in the Execution Log
                catch (ex) {
                    nlapiLogExecution('ERROR', 'Error', 'Transaction ID ' + internalId + ': ' + ex);
                }
            }
        }
        // Show how many records were deleted.
        form.addField("custpage_transaction_total", "text").setDisplayType('inline').setDefaultValue(num + " transactions deleted");
        response.writePage(form);
    }
}