/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 nov 2014     LatamReady Consultor
 * File : NCH ParteIngreso_CLNT.js
 */

function prn_Parte_Ingreso_PDF()
{
	var createPOURL = nlapiResolveURL('SUITELET', 'customscript_nch_parte_ingreso_stlt', 'customdeploy_nch_parte_ingreso_stlt_i', false); 
	//pass the internal id of the current record
	createPOURL += '&id=' + nlapiGetRecordId(); 
	 
	//show the PDF file 
	newWindow = window.open(createPOURL);
}
