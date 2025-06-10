/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Feb 2022     Jaciel
 * 1.00       02 Abr 2025     Jonathan
 * File : NCH_RptGeneratorBrasil_CLT.js
 */
var objContext = nlapiGetContext();

function onloadForm(type)
{
	if( nlapiGetFieldValue('custpage_nch_reporte') == '') 
	{
		ocultaCampos();
	}	
}

function clientSaveRecord()
{
	// Valida el periodo contable que sea mayor al año 2023
	var featureId   = nlapiGetFieldValue('custpage_nch_reporte');
	var strAnio = '2023';

	//Reportes contables de Brasil
	if  ( featureId == 5 || featureId == 4 || featureId == 2 || featureId == 7 ) 
	{
		var columnFrom = nlapiLookupField('accountingperiod', nlapiGetFieldValue('custpage_nch_period_conta'), ['periodname']);
		var periodname = columnFrom.periodname;
		if (periodname.substring(4) < strAnio)
		{
			alert('Os relatórios só podem ser obtidos a partir de ' + strAnio +'.');
			return false;
		}
	}

	if  ( featureId == 6 ) 
	{
		var columnFrom = nlapiLookupField('accountingperiod', nlapiGetFieldValue('custpage_nch_period_conta_ini'), ['periodname']);
		var periodname = columnFrom.periodname;
		if (periodname.substring(4) < strAnio)
		{
			alert('Os relatórios só podem ser obtidos a partir de ' + strAnio +'.');
			return false;
		}
	}
	
	// Mesaje al usuario
	alert('Será gerado um arquivo de texto com as informações fornecidas.\nEsse processo pode levar vários minutos.\nAtualize o log para download.');
    return true;
}

function clientFieldChanged(type, name, linenum) 
{
	if( name == 'custpage_nch_reporte' ) 
	{
		var val_report = nlapiGetFieldValue('custpage_nch_reporte');

		if( val_report == 5 || val_report == 4 || val_report == 2 || val_report == 7 )
		{
			nlapiSetFieldDisplay('custpage_nch_period_conta', true );
			nlapiSetFieldMandatory('custpage_nch_period_conta', false);
		}
		if( val_report == 6 )
		{
			nlapiSetFieldDisplay('custpage_nch_period_conta', false );
			nlapiSetFieldMandatory('custpage_nch_period_conta', false);
			nlapiSetFieldDisplay('custpage_nch_period_conta_ini', true );
			nlapiSetFieldDisplay('custpage_nch_period_conta_fin', true );
		}				
		
		return true;
	}	
	return true;
}

function ocultaCampos() 
{
	nlapiSetFieldDisplay('custpage_nch_period_conta', false );
	nlapiSetFieldDisplay('custpage_nch_period_conta_ini', false );
	nlapiSetFieldDisplay('custpage_nch_period_conta_fin', false );

	var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_nch_id_filter');		

	var transacdata = nlapiSearchRecord('customrecord_nch_filter_report_generator', null, null, columns);

	if ( transacdata !=null && transacdata != '') 
	{
		for(var i = 0; i < transacdata.length; i++) 
		{
			var idField 	= transacdata[i].getValue('custrecord_nch_id_filter');
			if (idField!=null && idField!='') 
			{
				// Oculta el campo
				//nlapiSetFieldDisplay(idField, false );
			}
		}
	}

}