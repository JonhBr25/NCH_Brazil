/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 nov 2014     LatamReady Consultor
 * File : NCH ParteIngreso_URET.js
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function PI_Uret_BeforeLoad(type, form, request){
	var currentContext = nlapiGetContext();
	if ((currentContext.getExecutionContext() == 'userinterface') && (type == 'view')) 
	{
		form.addButton('custpage_oss_print_pi','Imprimir Parte de Ingreso', "prn_Parte_Ingreso_PDF()");
		form.setScript('customscript_nch_parte_ingreso_clnt');
	}
	return true; 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function PI_Uret_BeforeSubmit(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function PI_Uret_AfterSubmit(type){
  
}
