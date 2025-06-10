/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Mar 2025     Jonathan
 * File : NCH_MassPrint_br_STLT.js
 */

var objContext = nlapiGetContext();
var namereport = "Impressão Enorme Brazil";

function suitelet_main_br(request, response) 
{
	try 
    {
		var form = nlapiCreateForm(namereport);
		
		if (request.getMethod() == 'GET') 
        {			 
			 // Create a sublist to show the search results
			 var sublist = form.addSubList('custpage_transaction_list', 'list', 'Transactions');
	 
			 // Create an array to store the transactions from the search results
			 var transactionArray = new Array();

			// Run an existing transaction search
			var results = nlapiSearchRecord('customrecord_nch_log_mass_print', 'customsearch_nch_log_mass_print');
			
			if (results != null) 
			{
				// Add a checkbox column to the sublist to select the transactions that will be deleted.
				sublist.addField('custpage_rg_select', 'checkbox', 'Seleção');
				sublist.addField('internalid', 'text', 'Internal ID').setDisplayType('hidden');
				sublist.addField('custpage_rg_trandate', 'text', 'Data de criação').setDisplayType("disabled");
				sublist.addField('custpage_rg_employee', 'text', 'Criado pela').setDisplayType("disabled");
				sublist.addField('custpage_rg_idfile', 'text', 'Id File').setDisplayType('hidden');
				sublist.addField('custpage_rg_nombre', 'text', 'Nome do arquivo').setDisplayType("disabled");
				sublist.addField('custpage_rg_customer', 'text', 'Cliente').setDisplayType("disabled");
				sublist.addField('custpage_rg_cnpj', 'text', 'Cadastro Federal').setDisplayType("disabled");
				sublist.addField('custpage_rg_archivo', 'text', 'URL_file').setDisplayType('hidden');
				// Add a column for the Internal ID link
				sublist.addField('internalidlink', 'text', 'Download');				
	
				// Get the the search result columns
				var columns = results[0].getAllColumns();
		
				// For each search results row, create a transaction object and attach it to the transactionArray
				for (var i = 0; i < results.length; i++) 
				{
					var transaction = new Object();
					// Set the Delete column to False
					transaction['custpage_rg_select'] = 'F';
					// Set the hidden internal ID field
					transaction['internalid'] = results[i].getId();
					transaction['custpage_rg_trandate'] = results[i].getValue('created');
					transaction['custpage_rg_employee'] = results[i].getText('custrecord_nch_createfor');
					transaction['custpage_rg_idfile'] = results[i].getValue('custrecord_nch_id_file');
					transaction['custpage_rg_nombre'] = results[i].getValue('custrecord_nch_name_arquivo');
					transaction['custpage_rg_customer'] = results[i].getText('custrecord_nch_customer_invoice');
					transaction['custpage_rg_cnpj'] = results[i].getValue('custrecord_nch_num_reg_fiscal');
					transaction['custpage_rg_archivo'] = results[i].getValue('custrecord_nch_url_file');

					var linktext = '';
					var url = results[i].getValue('custrecord_nch_url_file');

					if (url != null && url != '') 
					{
						linktext = '<a target="_blank" href="' + results[i].getValue('custrecord_nch_url_file') + '">Download</a>';
					}

					transaction['internalidlink'] = linktext;

					// Attach the transaction object to the transaction array
					transactionArray[i] = transaction;
					//nlapiLogExecution('DEBUG', 'ObjTransaction', JSON.stringify(transaction));
				}
			}
			// Initiate the sublist with the transactionArray
			sublist.setLineItemValues(transactionArray);
			sublist.addMarkAllButtons();
			form.addSubmitButton('Imprimir');
			form.addResetButton('Fechar');
			response.writePage(form);

		}
		//POST - Delete the selected transactions and show a confirmation message
		else
        {
			var ArraytoPrint = new Array();
			
			// Check how many lines in the sublist
			var count = request.getLineItemCount('custpage_transaction_list');

			//CREATE PDF FILE
			var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
				xml += "<pdfset>";

			//for each line in the sublist
			for (var i = 1; i < count + 1; i++) 
			{
				//get the value of the selection checkbox
				var printTransaction = request.getLineItemValue('custpage_transaction_list', 'custpage_rg_select', i);				
				
				if (printTransaction == 'T') 
				{
					// Get the transaction internal ID & URL file
					var log_Id 		= request.getLineItemValue('custpage_transaction_list', 'internalid', i);
					var URLtoPrint  = request.getLineItemValue('custpage_transaction_list', 'custpage_rg_archivo', i);
					var idtoDelete  = request.getLineItemValue('custpage_transaction_list', 'custpage_rg_idfile', i);

					//nlapiLogExecution('DEBUG', 'log_Id ', log_Id);
					
					var pdf_fileURL = nlapiEscapeXML(URLtoPrint); 
					xml += "<pdf src='"+ pdf_fileURL +"'/>";

					nlapiSubmitField('customrecord_nch_log_mass_print', log_Id, ['custrecord_nch_select_file'], ['T']);	
					ArraytoPrint.push(idtoDelete);						
				}
			}

			xml += "</pdfset>";

			var filePDF = nlapiXMLToPDF( xml );
				response.setContentType('PDF', 'FiletoPrint.pdf', 'inline');
								response.write( filePDF.getValue() );

			nlapiLogExecution('DEBUG', 'ArraytoPrint ', ArraytoPrint.length);
			nlapiLogExecution('DEBUG', 'ArraytoPrint_JSON ', JSON.stringify(ArraytoPrint));
								
			for (var ii = 0; ii < ArraytoPrint.length; ii++) 
			{
				//nlapiLogExecution('DEBUG', 'ArraytoPrint_position ', ArraytoPrint[ii]);
				nlapiDeleteFile( ArraytoPrint[ii] );
			}
			
		}
	} catch (err) 
	{
		nlapiLogExecution('ERROR', 'Error Mass Print Brazil', err + ' - ' + err.lineNumber);
		//nlapiSendEmail(20, 'jonathan.jimenez@nch.com', 'Error en Imprimidor ', err + ' - ' + err.line);
	}

	return true;
}