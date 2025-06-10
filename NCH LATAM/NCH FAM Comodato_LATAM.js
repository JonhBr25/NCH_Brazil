/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Dec 2013     EDGARD_CARPIO
 *
 */

//var idFAtype = '170';
var idFAtype = '406';

function pageinit(type, form)
{
	nlapiSetFieldValue('custrecord_assettype', idFAtype);
	nlapiSetFieldValue('custrecord_assetresidualvalue',0);
	nlapiDisableField('custrecord_assettype', true);
	nlapiDisableField('custrecord_assetaccmethod', true);
	nlapiDisableField('custrecord_assetlifetime', true);
	nlapiDisableField('custrecord_assetinclreports', true);

	return true;
}

function clientFieldChanged(type, name, linenum)
{ 
	if (name == 'custrecord_assetserialno' || name == 'custrecord_tipo_comodato_nch')
	{
		var numSerie = nlapiGetFieldValue('custrecord_assetserialno');
		var tipoFANCH = nlapiGetFieldText('custrecord_tipo_activo_nch');
		var descFANCH = nlapiGetFieldValue('custrecord_assetdescr');
		var desctextFANCH = '';

		if (descFANCH != '')
		{
			desctextFANCH = descFANCH;
		}

		var nombreFA = desctextFANCH + ' No.Serie ' + numSerie;
		nlapiSetFieldValue('altname', nombreFA);
		
		return true;
	}
}
