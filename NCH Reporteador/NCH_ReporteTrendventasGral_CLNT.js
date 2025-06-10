/**
 * Module Description
 * 
 * Version    Date            Author           	Remarks
 * 1.00       03 Aug 2020     jguzman
 * 1.10       26 Jul 2022     Jaciel			Se agrega otra opción de reporte
 * 1.10       27 Oct 2022     Jonathan			Se agregan opciones al codigo original
 */

function clientInitPage()
{
	nlapiSetFieldDisplay('custpage_periodo', false);
	
	//var periodo = nlapiGetField('custpage_periodo').setDisplayType("normal");
} 

function clientSaveRecord()
{
	var subsidiaria = nlapiGetFieldValue('custpage_subsidiary');
	var supervisor 	= nlapiGetFieldValue('custpage_supervisor');
	var reporte 	= nlapiGetFieldValue('custpage_nch_reporte');

	if (reporte == 2) 
	{
		var periodo = nlapiGetFieldValue('custpage_periodo');

		if (periodo == 0) 
		{
			alert('Seleccionar un período.');

			return false;
		}
	}
  
  	if (reporte == 3) 
      {
          var id_location = nlapiGetFieldValue('custpage_location');

          if (id_location == 0) 
          {
              alert('Seleccionar una Ubicacion de Inventario Disponible.');

              return false;
          }
      }

	if ((subsidiaria == 13 && reporte == 1) || (subsidiaria == 14 && reporte == 1) || (subsidiaria == 17 && reporte == 1)) 
	{
		if (supervisor == 0) 
		{
			alert('Para los reportes de México es obligatorio seleccionar un supervisor.');

			return false;
		}
		else
		{
			// Mesaje al usuario
			alert('Se generara un archivo excel con la informacion proporcionada.\n\n'
				+ 'Este proceso puede durar varios minutos.\n\nPor favor actualizar el log para su descarga.');
		}
	}
	else
	{		
		// Mesaje al usuario
		alert('Se generara un archivo excel con la informacion proporcionada.\n\n'
			+ 'Este proceso puede durar varios minutos.\n\nPor favor actualizar el log para su descarga.');
	}
	
    return true;
}

function clientFieldChange(type, name, linenum)
{
	if (name == 'custpage_subsidiary') 
	{
		BorraLista();

		var subsidiaria = nlapiGetFieldValue('custpage_subsidiary');

		var filtersSup = new Array();
		 	//filtersSup[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
			filtersSup[0] = new nlobjSearchFilter('subsidiary', null, 'anyof', subsidiaria);
			filtersSup[1] = new nlobjSearchFilter('custentity16', null, 'anyof', ['1', '2', '5']);
		// Columnas
		var columnsSup = new Array();
		 	columnsSup[0] = new nlobjSearchColumn('internalid');
		 	columnsSup[1] = new nlobjSearchColumn('companyname');
		 	columnsSup[2] = new nlobjSearchColumn('entityid');
		//Búsqueda
		var searchSup = nlapiSearchRecord('partner', null, filtersSup, columnsSup);   

		//var field = nlapiGetFieldValues('custpage_subsidiary'); 
		//var options = field.getSelectOptions('J', 'startswith');
		//alert(field);

		if(searchSup != null) 
		{
		 	for (var i = 0; i < searchSup.length; i++) 
		 	{
		 		var supervisorId = searchSup[i].getValue('internalid');
		 		var supervisorName = searchSup[i].getValue('companyname');		 
		 		var supervisorEntity = searchSup[i].getValue('entityid');		 
				nlapiInsertSelectOption('custpage_supervisor', supervisorId, supervisorEntity + ' - ' + supervisorName);
		 	}

			nlapiInsertSelectOption('custpage_supervisor', '', '');
		}
	}

	if (name == 'custpage_nch_reporte') 
	{
		var reporte = nlapiGetFieldValue('custpage_nch_reporte');

		if (reporte == 2) 
		{
			//nlapiGetField('custpage_periodo').setDisplayType("disabled");
			nlapiSetFieldDisplay('custpage_supervisor', false);
			nlapiSetFieldDisplay('custpage_periodo', true);
			nlapiSetFieldMandatory('custpage_periodo', true);
            nlapiSetFieldDisplay('custpage_location', false);
		}
      	if (reporte == 3) 
		{
			nlapiSetFieldDisplay('custpage_supervisor', false);
			nlapiSetFieldDisplay('custpage_periodo', false);
			nlapiSetFieldMandatory('custpage_periodo', false);
            nlapiSetFieldDisplay('custpage_location', true);
          nlapiSetFieldMandatory('custpage_location', true);
		}
		else
		{
			nlapiSetFieldDisplay('custpage_supervisor', true);
			nlapiSetFieldDisplay('custpage_periodo', false);
			nlapiSetFieldMandatory('custpage_periodo', false);
            nlapiSetFieldDisplay('custpage_location', false);
		}
	}
	
	return true;
}

function BorraLista()
{
	//Por el momento se buscan todos y se eliminan de la lista	
	// Filtros
	var filtersSup = new Array();
	 	//filtersSup[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		filtersSup[0] = new nlobjSearchFilter('custentity16', null, 'anyof', ['1', '2', '5']);
	// Columnas
	var columnsSup = new Array();
	 	columnsSup[0] = new nlobjSearchColumn('internalid');
	 	//columnsSup[1] = new nlobjSearchColumn('companyname');
	//Búsqueda
	var searchSup = nlapiSearchRecord('partner', null, filtersSup, columnsSup);   

	if(searchSup != null) 
	{
	 	for (var i = 0; i < searchSup.length; i++) 
	 	{
	 		var supervisorId = searchSup[i].getValue('internalid');
	 		nlapiRemoveSelectOption('custpage_supervisor', supervisorId);
	 	}

		nlapiRemoveSelectOption('custpage_supervisor', '');
	}			

	return true;
}
