/**
 * @author WCARPIO /ONE SYSTEM
 * Nov '13 File : LTR_NS_EBS2_Tier.js 
 * SUITELET de Interfaz Netsuite - Oracle
 */
var objContext = nlapiGetContext();
function interfaz_NetSuite_Oracle(request, response)
{
	if ( request.getMethod() == 'GET' )
	{
		var form = nlapiCreateForm('Interfaz Segmentación Netsuite - Oracle');

		// Criterios de Busqueda
		var group = form.addFieldGroup("custpage_filran", "Criterios de Busqueda");
		var v_subsidiary = form.addField('custpage_subsidiary','select', 'Subsidiaria','subsidiary', 'custpage_filran').setHelpText('Subsidiaria');
		var v_livro	 	 = form.addField('custpage_br_livrocontabil','select','Livro Contábil', null, 'custpage_filran').setHelpText('Livro Contábil');
		var v_period	 = form.addField('custpage_period','select','Periodo Contable','accountingperiod', 'custpage_filran').setHelpText('Periodo Contable');

		// Filtros
		//1 - Primary Accounting Book	3 - Corp
		//1 - Primary Accounting Book	2 - Corp (Nueva Instancia)
		var filters = new Array();
			filters[0] = new nlobjSearchFilter('internalid', null, 'anyof', [1, 2]);				
		// Columnas
		var columns = new Array();
			columns[0] = new nlobjSearchColumn('internalid');
			columns[1] = new nlobjSearchColumn('name');
		//Búsqueda
		var searchctalt = nlapiSearchRecord('accountingbook', null, filters, columns);   

		if(searchctalt != null)
		{
	       	v_livro.addSelectOption('','');
			for (var i =0;i < searchctalt.length; i++)
			{1
				var livroID = searchctalt[i].getValue('internalid');
				var livroNM = searchctalt[i].getValue('name');
				v_livro.addSelectOption(livroID, livroNM);			
			}			
		}
		v_livro.setDefaultValue("1");

		group.setShowBorder(true);

		form.addSubmitButton('Procesar');
		form.addResetButton('Cancelar');
		form.setScript("customscript_nch_interfaseoracle_clnt");

		response.writePage(form);
	}
	else
	{
		var subsidiary = request.getParameter('custpage_subsidiary');
		var accperiodAux  = request.getParameter('custpage_period');
		var livroContabil  = request.getParameter('custpage_br_livrocontabil');

		//var periodo = request.getParameter('custpage_periododesde');
		var params = new Array();		
		params['custscript_subs'] = subsidiary;		
		params['custscript_param_periodo'] = accperiodAux;
		params['custscript_livro_contabil'] = livroContabil;
		nlapiLogExecution('DEBUG', 'Parametro', 'Periodo1: ' + accperiodAux);
		nlapiLogExecution('DEBUG', 'Parametro', 'Subsidi2: ' + subsidiary);
		nlapiLogExecution('DEBUG', 'Parametro', 'Arreglo3: ' + params);
		
		var status = nlapiScheduleScript('customscript_ltr_ns_ebs2_tier_ss', 'customdeploy_ltr_ns_ebs2_tier_ss', params);

		nlapiLogExecution('DEBUG', 'Schedule Script', 'status: '+status);
	
		nlapiSetRedirectURL('SUITELET','customscript_ltr_ns_ebs2_tier','customdeploy_ltr_ns_ebs2_tier',false,null);
	}
}