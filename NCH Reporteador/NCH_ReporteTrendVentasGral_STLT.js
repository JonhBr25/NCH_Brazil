/**
 * Module Description
 * 
 * Version    Date            	Author           Remarks
 * 1.00       03 Aug 2020     	NCH Mexico
 * 1.10       26 Jul 2022     	Jaciel			Se agrega otra opción de reporte y control de período
 * 1.10       27 Oct 2022    Jonathan		Se agrega otra opción de reporte y filtro de ubicacion para toda la region
 * File : NCH_ReporteTrendVentasGral_STLT.js
 */

var objContext = nlapiGetContext();
var namereport = "NCH Generador Reportes de Ventas";
var LMRY_script = "NCH Report Generator STLT";

function suitelet_main_mx(request, response){
	try
	{		
		search_folder();
		var tex = '';   		

		if ( request.getMethod() == 'GET' ) 
		{
			var form = nlapiCreateForm(namereport);

			/* ****** Grupo de Campos Criterios de Busqueda ****** */
			// Grupo de parámetros
			var group = form.addFieldGroup('custpage_filran1', 'Tipos de Reporte');
			
			//Combo LISTA DE REPORTES
			var fieldreports = form.addField('custpage_nch_reporte', 'select', 'Reporte', null, 'custpage_filran1');
			// Tipo de reportes
			var filters = new Array();
				filters[0] = new nlobjSearchFilter('custrecord_nch_tv_reporte_generador', null, 'is', 'T');
			var columns = new Array();
				columns[0] = new nlobjSearchColumn('internalid');
				columns[1] = new nlobjSearchColumn('name');
			var searchctalt = nlapiSearchRecord('customrecord_nch_reportes_trend_ventas', 'customsearch_nch_reporte_trendventasgral', filters, columns);
		
			if(searchctalt != null)
			{
	        	fieldreports.addSelectOption('','');
				for (var i =0;i < searchctalt.length; i++) 
				{
					var reportID = '';
					var reportNM = '';
					
					reportID = searchctalt[i].getValue('internalid');
					reportNM = searchctalt[i].getValue('name');
					fieldreports.addSelectOption(reportID, reportNM);					
				}			
			}
			// Mensaje de ayuda campo Reporte
			fieldreports.setHelpText('Seleccionar reporte a generar');
			fieldreports.setMandatory(true);
			fieldreports.setLayoutType('normal','startcol');
			group.setShowBorder(true);
			
			// Grupo de parámetros
			var group = form.addFieldGroup('custpage_filran2', 'Criterios de Búsqueda');
			// Combo SUBSIDIARIA
			var fieldsubs = form.addField('custpage_subsidiary', 'select', 'Subsidiaria', null, 'custpage_filran2');					
			// Filtros
			var filters = new Array();
				filters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');				
			// Columnas
			var columns = new Array();
				columns[0] = new nlobjSearchColumn('internalid');
				columns[1] = new nlobjSearchColumn('name');
			//Búsqueda
			var searchctalt = nlapiSearchRecord('subsidiary', null, filters, columns);   

			if(searchctalt != null)
			{
		       	fieldsubs.addSelectOption('','');
				for (var i =0;i < searchctalt.length; i++)
				{
					var reportID = searchctalt[i].getValue('internalid');
					var reportNM = searchctalt[i].getValue('name');
					fieldsubs.addSelectOption(reportID, reportNM);			
				}			
			}
			
			// Mensaje de ayuda campo Subsidiaria
			fieldsubs.setHelpText('Seleccione Subsidiaria.');
			fieldsubs.setMandatory(true);
			// Combo SUBSIDIARIA

			// Combo SUPERVISOR Rep
			var fieldSup = form.addField('custpage_supervisor', 'select', 'Supervisor', null, 'custpage_filran2');
			
			// Mensaje de ayuda campo Subsidiaria
			fieldsubs.setHelpText('Seleccionar Supervisor (en el caso de México es obligatorio).');
			// Combo SUPERVISOR Rep

			// Combo PERIODO CONTABLE (trae todos los periodos)
			var fieldPeriod = form.addField('custpage_periodo', 'select', 'Periodo Contable', 'accountingperiod', 'custpage_filran2');
			
			// Mensaje de ayuda campo Periodo Contable
			fieldPeriod.setHelpText('Seleccione el Periodo Contable');
			
			// Combo Ubicacion (trae todas las ubicaciones disponibles)
			var field_location = form.addField('custpage_location', 'select', 'Ubicacion', 'location', 'custpage_filran2');
			
			// Mensaje de ayuda campo Periodo Contable
			field_location.setHelpText('Seleccione la Ubicacion deseada :');

			// Mensaje para el cliente
			var myInlineHtml = form.addField('custpage_btn', 'inlinehtml').setLayoutType('outsidebelow','startcol');
			var strhtml = "<html>";						   
			strhtml += "<table border='0' class='table_fields' cellspacing='0' cellpadding='0'>" +
					"<tr>" +
					"</tr>" +
					"<tr>" +
					"<td class='text'>" +
					"<div style=\"color: gray; font-size: 8pt; margin-top: 10px; padding: 5px; border-top: 1pt solid silver\">" +
					"Important: By using the NetSuite Reports, you assume all responsibility for determining whether the data you " +
					"generate and download is accurate or sufficient for your purposes. You also assume all responsibility for " +
					"the security of any data that you download from NetSuite and subsequently store outside of the NetSuite system.</div>" +
					"</td>" +
					"</tr>" +
					"</table>" +
					"</html>";
			myInlineHtml.setDefaultValue(strhtml);		
			
			form.addTab('custpage_maintab', 'Tab');
			
			//sublista Log de generacion				
			var listalog = form.addSubList('custpage_sublista', 'staticlist', 'Log de generación', 'custpage_maintab');
				listalog.addField('custpage_rg_trandate','text','Fecha de creación').setDisplayType("disabled");
				listalog.addField('custpage_rg_subsidiary', 'text', 'Subsidiaria').setDisplayType("disabled");
				listalog.addField('custpage_rg_employee', 'text', 'Creado por').setDisplayType("disabled");
				listalog.addField('custpage_rg_nombre', 'text', 'Nombre archivo').setDisplayType("disabled");
				listalog.addField('custpage_rg_archivo', 'text', 'Descargar').setDisplayType("normal");
				listalog.addRefreshButton();
					
			// the records to be displayed are from a saved search
			var logReporte = nlapiLoadSearch('customrecord_nch_log_rep_trendventagral', 'customsearch_nch_log_rep_trendventasgral');
			var resultSet = logReporte.runSearch();
	
			// only display rows from the search result that matches the value in the drop down
			var results = resultSet.getResults(0, 1000);
	
			for ( var i = 0; results != null && i < results.length; i++) 
			{
			  var row = i + 1;
			  searchresult = results[i];
		
			  var linktext = '';
			  var url = searchresult.getValue('custrecord_nch_reporte_tvgral_urlarchivo');
			  var urlRes = url.replace("system.sandbox.netsuite", "system.netsuite");
				  
			  if (urlRes != null && urlRes != '') 
			  {
				  linktext = (url == 'Failed') ? url : '<a target="_blank" href="' + urlRes + '">Descarga</a>';
			  }	
	
			  listalog.setLineItemValue('custpage_rg_trandate',	  row, searchresult.getValue('created'));
			  listalog.setLineItemValue('custpage_rg_subsidiary', row, searchresult.getText('custrecord_nch_reporte_tvgral_subsidiari'));
			  listalog.setLineItemValue('custpage_rg_employee',   row, searchresult.getValue('custrecord_nch_reporte_tvgral_creadopor'));
			  listalog.setLineItemValue('custpage_rg_nombre', 	  row, searchresult.getValue('custrecord_nch_reporte_tvgral_nombre'));
			  listalog.setLineItemValue('custpage_rg_archivo', 	  row, linktext);
			}

			// Botones del formulario
			form.addSubmitButton('Generar');
			form.addResetButton('Cancelar');
			form.setScript("customscript_nch_reptrendventasgral_clnt");
		
			// Crea el formulario
			response.writePage(form);
		}
		else
		{
			var params = new Array();

			// Ejecuta el Schedule conforme el reporte que se seleccione}
			var idSub 	  = request.getParameter('custpage_subsidiary');
			var idSup 	  = request.getParameter('custpage_supervisor');
			var idrpts 	  = request.getParameter('custpage_nch_reporte');
			var idPeriodo = request.getParameter('custpage_periodo');
			var report = nlapiLookupField('customrecord_nch_reportes_trend_ventas', idrpts, 
				['custrecord_nch_tv_id_schedule', 'custrecord_nch_tv_id_deploy', 'name']);
			var tituloInforme =  report.name;
			var id_location =  request.getParameter('custpage_location');

			var record = nlapiCreateRecord('customrecord_nch_log_rep_trendventagral');
			record.setFieldValue('custrecord_nch_reporte_tvgral_nombre', 'Pendiente');
			record.setFieldValue('custrecord_nch_reporte_tvgral_subsidiari', request.getParameter('custpage_subsidiary'));
			record.setFieldValue('custrecord_nch_reporte_tvgral_urlarchivo', '');
			record.setFieldValue('custrecord_nch_reporte_tvgral_creadopor', nlapiGetContext().getName()); //nlapiGetUser());
			var rec_id = nlapiSubmitRecord(record, true);			

			nlapiLogExecution('DEBUG', 'this0', idrpts + '|' + idSub + '|' + rec_id);

			switch(idrpts)
			{
				case "1":
					//Se pasan los parámetros
					params['custscript_nch_idreporte_tvgral'] 	= rec_id;
					params['custscript_nch_subsidiaria_tvgral'] = idSub;
					params['custscript_nch_supervisor_tvgral'] 	= idSup;

					//EJECUCION DE SCRIPT
					var status = nlapiScheduleScript('customscript_nch_reptrendventasgral_schd', 'customdeploy_nch_reptrendventasgral_schd', params);

					break;

				case "2":
					//Se pasan los parámetros
					params['custscript_nch_idlog_nueartcli']   	   = rec_id;
					params['custscript_nch_subsidiaria_nueartcli'] = idSub;
					params['custscript_nch_periodo_nueartcli'] 	   = idPeriodo;

					//EJECUCION DE SCRIPT
					var status = nlapiScheduleScript('customscript_nch_cli_comp_art_nuev_schd', 'customdeploy_nch_cli_comp_art_nuev_schd', params);
	
					break;
					
				case "3":
					//Se pasan los parámetros
					params['custscript_pe_idreport_mx']   	   		= rec_id;
					params['custscript_pe_subsidiary_mx'] 			= idSub;
					params['custscript_pe_location_mx'] 				= id_location;

					//EJECUCION DE SCRIPT
					var status = nlapiScheduleScript('customscript_nch_precioespecial_mx', 'customdeploy_nch_precioespecial_mx', params);
	
					break;
			}

			if (status == 'INQUEUE' || status == 'INPROGRESS') 
			{
				// Actualiza el log para informar que se inicio el proceso
				nlapiSubmitField('customrecord_nch_log_rep_trendventagral', rec_id, ['custrecord_nch_reporte_tvgral_nombre'], 
					[(status == 'INPROGRESS') ? 'Cancelado - Hay otro proceso corriendo' : status]);
			}
			
			// Redireccion el script, vuelve a llamar al SuiteLet actual
			nlapiSetRedirectURL('SUITELET', nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId());
		}
	} 
	catch(err) 
	{
		//sendemail(err + tex, LMRY_script);
		nlapiLogExecution('DEBUG', 'Error en suitelet_main_mx', err);
		//nlapiSendEmail(20, 'jaciel.guzman@nch.com', 'Error en suitelet_main_mx', err);
	}
	
	return true;
}

/* ------------------------------------------------------------------------------------------------------ 
 * Nota: Valida si existe el folder donde se guardaran los archivos 
 * --------------------------------------------------------------------------------------------------- */
function search_folder() 
{
	try 
	{
		// Ruta de la carpeta contenedora
		var folderId = objContext.getSetting('SCRIPT', 'custscript_file_cabinet_venticuatromeses');	

		if (folderId == '' || folderId == null) 
		{
			// Valida si existe "NCH Reporteadores" en File Cabinet 
			var subOf = '';
			var resultSet = nlapiSearchRecord('folder', null
					, new nlobjSearchFilter('name', null, 'is', 'NCH Reporteadores')
					, new nlobjSearchColumn('internalid') );
					
			nlapiLogExecution('DEBUG', 'this1', resultSet + '|' + folderId);
	
			if ( resultSet=='' || resultSet==null) 
			{
				var folder = nlapiCreateRecord('folder');
				folder.setFieldValue('name', 'NCH Reporteadores');
				
				subOf = nlapiSubmitRecord(folder,true);
			} 
			else 
			{
				subOf = resultSet[0].getValue('internalid');
			}

			// Valida si existe "NCH Reportes Trend de Ventas Articulos (Direcciones) Gral" en File Cabinet
			var folderId = '';
			var resultSet = nlapiSearchRecord('folder', null
					, new nlobjSearchFilter('name', null, 'is', 'NCH Reportes Trend de Ventas Articulos (Direcciones) Gral')
					, new nlobjSearchColumn('internalid'));
			
			if ( resultSet=='' || resultSet==null) 
			{
				// Crea la carpeta
				var folder = nlapiCreateRecord('folder');
					folder.setFieldValue('name', 'NCH Reportes Trend de Ventas Articulos (Direcciones) Gral');
					folder.setFieldValue('parent', subOf);
				folderId = nlapiSubmitRecord(folder,true);
			} 
			else 
			{
				folderId = resultSet[0].getValue('internalid');
			}
			
			// Load the NetSuite Company Preferences page
			var company = nlapiLoadConfiguration('companypreferences'); 
				// set field values
				company.setFieldValue('custscript_file_cabinet_venticuatromeses', folderId);
			
			// save changes to the Company Preferences page
			nlapiSubmitConfiguration( company );
		}
	} 
	catch(err)
	{
		// Mail de configuracion del folder
		//sendemail(err + tex, LMRY_script);
		nlapiLogExecution('DEBUG', 'search_folder', err);
		//nlapiSendEmail(20, 'jaciel.guzman@nch.com', 'Error en search_folder', err);		
	}
	
	return true;
}
