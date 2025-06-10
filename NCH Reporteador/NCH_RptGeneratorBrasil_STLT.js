/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Feb 2022     Jaciel
 * 1.00       02 Abr 2025     Jonathan
 * 1.00		  16 Abr 2025	  Jonathan (FCI - JOAO)
 * File : NCH_RptGeneratorBrasil_STLT.js
 */

var objContext = nlapiGetContext();
// Titulo del Suitelet
var namereport = "Gerador de Relatórios Brasil";

function suitelet_main_br(request, response) {
	try {
		if (request.getMethod() == 'GET') 
		{
			var form = nlapiCreateForm(namereport);

			/* ****** Grupo de Campos Criterios de Busqueda ****** */
			var group = form.addFieldGroup('custpage_filran1', 'Lista de relatórios Brasil');

			//Crea lista de reportes para seleccion
			var fieldreports = form.addField('custpage_nch_reporte', 'select', 'Relatório', null, 'custpage_filran1');

			// CARGA LISTADO DE REPORTES CONTENIDOS EN NCH REPORT FEATURES
			var filters = new Array();
			filters[0] = new nlobjSearchFilter('custrecord_nch_rep_gen', null, 'is', 'T');
			//filters[1] = new nlobjSearchFilter('id', null, 'noneof', [32]);
			var columns = new Array();
			columns[0] = new nlobjSearchColumn('internalid');
			columns[1] = new nlobjSearchColumn('name');
			columns[2] = new nlobjSearchColumn('custrecord_nch_country');
			var searchctalt = nlapiSearchRecord('customrecord_nch_rep_features', 'customsearch_nch_features', filters, columns);

			if (searchctalt != null) 
			{
				fieldreports.addSelectOption('', '');

				for (var i = 0; i < searchctalt.length; i++) {
					var reportID = '';
					var reportNM = '';

					// Reports for Brasil
					if (searchctalt[i].getText('custrecord_nch_country') == 'Brasil') 
					{
						reportID = searchctalt[i].getValue('internalid');
						reportNM = searchctalt[i].getValue('name');
						fieldreports.addSelectOption(reportID, reportNM);
					}

				}
			}
			fieldreports.setHelpText('Selecione o relatório para gerar');
			fieldreports.setMandatory(true);
			fieldreports.setLayoutType('normal', 'startcol');
			group.setShowBorder(true);

			/* ****** Grupo de Campos Criterios de Busqueda ****** */
			var group = form.addFieldGroup('custpage_filran2', 'Critérios de pesquisa');

			// Combo PERIODO CONTABLE (trae todos los periodos)
			var fieldPeriod = form.addField('custpage_nch_period_conta', 'select', 'Período contábil', 'accountingperiod', 'custpage_filran2');
			//fieldPeriod.addSelectOption('','');
			// Mensaje de ayuda campo Periodo Contable
			fieldPeriod.setHelpText('Selecione um período contábil	');
			fieldPeriod.setMandatory(true);
			group.setShowBorder(true);

			// COMBO PERIODO CONTABLE INICIO Y FIN PARA REPORTE SPED
			var fieldPeriod_ini = form.addField('custpage_nch_period_conta_ini', 'select', 'Início do período contábil', 'accountingperiod', 'custpage_filran2');
				fieldPeriod_ini.setHelpText('Selecione o início do período contábil ');
				fieldPeriod_ini.setMandatory(true);	

			var fieldPeriod_fin = form.addField('custpage_nch_period_conta_fin', 'select', 'Fim do período contábil', 'accountingperiod', 'custpage_filran2');
				fieldPeriod_fin.setHelpText('Selecione o final do período contábil ');
				fieldPeriod_fin.setMandatory(true);	
				group.setShowBorder(true);


			// Mensaje para el cliente
			var myInlineHtml = form.addField('custpage_btn', 'inlinehtml').setLayoutType('outsidebelow', 'startcol');
			var strhtml = "<html>";
			strhtml += "<table border='0' class='table_fields' cellspacing='0' cellpadding='0'>" +
				"<tr>" +
				"</tr>" +
				"<tr>" +
				"<td class='text'>" +
				"<div style=\"color: gray; font-size: 8pt; margin-top: 10px; padding: 5px; border-top: 1pt solid silver\">Important: By using the NetSuite Reports, you assume all responsibility for determining whether the data you generate and download is accurate or sufficient for your purposes. You also assume all responsibility for the security of any data that you download from NetSuite and subsequently store outside of the NetSuite system.</div>" +
				"</td>" +
				"</tr>" +
				"</table>" +
				"</html>";
			myInlineHtml.setDefaultValue(strhtml);

			form.addTab('custpage_maintab', 'Tab');
			//sublista				
			var listalog = form.addSubList('custpage_sublista', 'staticlist', 'Log de geração', 'custpage_maintab');
			listalog.addField('custpage_rg_trandate', 'text', 'Data de criação').setDisplayType("disabled");
			listalog.addField('custpage_rg_transaction', 'text', 'Relatório').setDisplayType("disabled");
			listalog.addField('custpage_rg_subsidiary', 'text', 'Subsidiária').setDisplayType("disabled");
			listalog.addField('custpage_rg_employee', 'text', 'Criado pela').setDisplayType("disabled");
			listalog.addField('custpage_rg_nombre', 'text', 'Nome do arquivo').setDisplayType("disabled");
			listalog.addField('custpage_rg_archivo', 'text', 'Download').setDisplayType("normal");
			listalog.addRefreshButton();

			// the records to be displayed are from a saved search
			var s = nlapiLoadSearch('customrecord_nch_rpt_generator_log', 'customsearch_nch_rpt_generator_log');
			s.addFilter(new nlobjSearchFilter('custrecord_nch_rg_subsidiary', null, 'anyof', [3]));
			var resultSet = s.runSearch();

			// only display rows from the search result that matches the value in the drop down
			var results = resultSet.getResults(0, 1000);

			for (var i = 0; results != null && i < results.length; i++) 
			{
				var row = i + 1;
				searchresult = results[i];

				var periodname = searchresult.getValue('custrecord_nch_rg_postingperiod');
				var linktext = '';
				var url = searchresult.getValue('custrecord_nch_rg_url_file');
				if (url != null && url != '') {
					linktext = '<a target="_blank" href="' + searchresult.getValue('custrecord_nch_rg_url_file') + '">Download</a>';
				}
				listalog.setLineItemValue('custpage_rg_trandate', row, searchresult.getValue('created'));
				listalog.setLineItemValue('custpage_rg_transaction', row, searchresult.getValue('custrecord_nch_rg_transaction'));
				listalog.setLineItemValue('custpage_rg_subsidiary', row, searchresult.getText('custrecord_nch_rg_subsidiary'));
				listalog.setLineItemValue('custpage_rg_employee', row, searchresult.getText('custrecord_nch_rg_employee'));
				listalog.setLineItemValue('custpage_rg_nombre', row, searchresult.getValue('custrecord_nch_rg_name'));
				listalog.setLineItemValue('custpage_rg_archivo', row, linktext);
			};
			// Botones del formulario
			form.addSubmitButton('Gerar');
			form.addResetButton('Cancelar');
			form.setScript("customscript_nch_rpt_generator_br_clnt");

			// Crea el formulario
			response.writePage(form);
		}
		else 
		{
			var params = new Array();

			// Ejecuta el Shedule conforme el reporte que se seleccione
			var idrpts = request.getParameter('custpage_nch_reporte');
			var report = nlapiLookupField('customrecord_nch_rep_features', idrpts, ['custrecord_nch_id_schedule', 'custrecord_nch_id_deploy', 'name']);
			var tituloInforme = report.name;

			nlapiLogExecution('DEBUG', 'IdRep | Name', idrpts + '| ' + tituloInforme);

			//NCH - Log Rpt Generator Log
			var record = nlapiCreateRecord('customrecord_nch_rpt_generator_log');
			record.setFieldValue('custrecord_nch_rg_name', 'Pendente');
			record.setFieldValue('custrecord_nch_rg_transaction', tituloInforme);
			record.setFieldValue('custrecord_nch_rg_postingperiod', request.getParameter('custpage_pe_period_conta'));
			record.setFieldValue('custrecord_nch_rg_subsidiary', 3);
			record.setFieldValue('custrecord_nch_rg_url_file', '');
			record.setFieldValue('custrecord_nch_rg_employee', nlapiGetUser());
			var rec_id = nlapiSubmitRecord(record, true);

			switch (parseInt(idrpts)) 
			{
				case 2:
					// PARAMETROS A ENVIAR PARA SCRIPT PROGRAMADO DE DETALHES DOS IMPOSTOS
					params['custscript_br_subsi_detalleimpuestos'] = 3;
					params['custscript_br_idrep_detalleimpuestos'] = rec_id;
					params['custscript_br_perio_detalleimpuestos'] = request.getParameter('custpage_nch_period_conta');

					nlapiLogExecution('DEBUG', 'this0', rec_id + '|' + 'searchctalt[0]' + '|' + request.getParameter('custpage_nch_period_conta'));

					//INVOCACION DE SCRIPT PROGRAMADO
					var status = nlapiScheduleScript(report.custrecord_nch_id_schedule, report.custrecord_nch_id_deploy, params);

					if (status == 'INQUEUE' || status == 'INPROGRESS') {
						// Actualiza el log para informar que se inicio el proceso
						nlapiSubmitField('customrecord_nch_rpt_generator_log', rec_id, ['custrecord_nch_rg_name'], ['Cancelado - ' + status]);
					}

					break;

				case 4:
					// PARAMETROS A ENVIAR PARA SCRIPT PROGRAMADO DE DETALHE DO IMPOSTO IPI
					params['custscript_br_subsi_detalleimpuesto_ipi'] = 3;
					params['custscript_br_idrep_detalleimpuesto_ipi'] = rec_id;
					params['custscript_br_perio_detalleimpuesto_ipi'] = request.getParameter('custpage_nch_period_conta');

					nlapiLogExecution('DEBUG', 'this0', rec_id + '|' + 'searchctalt[0]' + '|' + request.getParameter('custpage_nch_period_conta'));

					//INVOCACION DE SCRIPT PROGRAMADO
					var status = nlapiScheduleScript(report.custrecord_nch_id_schedule, report.custrecord_nch_id_deploy, params);

					if (status == 'INQUEUE' || status == 'INPROGRESS') {
						// Actualiza el log para informar que se inicio el proceso
						nlapiSubmitField('customrecord_nch_rpt_generator_log', rec_id, ['custrecord_nch_rg_name'], ['Cancelado - ' + status]);
					}

					break;

				case 5:
					// PARAMETROS A ENVIAR PARA SCRIPT PROGRAMADO BALANCETE ANALITICO
					params['custscript_br_subsi_balancete'] = 3;
					params['custscript_br_idrep_balancete'] = rec_id;
					params['custscript_br_perio_balancete'] = request.getParameter('custpage_nch_period_conta');

					nlapiLogExecution('DEBUG', 'this0', rec_id + '|' + 'searchctalt[0]' + '|' + request.getParameter('custpage_nch_period_conta'));

					//INVOCACION DE SCRIPT PROGRAMADO
					var status = nlapiScheduleScript(report.custrecord_nch_id_schedule, report.custrecord_nch_id_deploy, params);

					if (status == 'INQUEUE' || status == 'INPROGRESS') {
						// Actualiza el log para informar que se inicio el proceso
						nlapiSubmitField('customrecord_nch_rpt_generator_log', rec_id, ['custrecord_nch_rg_name'], ['Cancelado - ' + status]);
					}

					break;

				case 6:
					// PARAMETROS A ENVIAR PARA SCRIPT PROGRAMADO SPED ECD
					params['custscript_br_subsi_sped_ecd'] 		= 3;
					params['custscript_br_idrep_sped_ecd'] 		= rec_id;
					params['custscript_br_perio_sped_ecdini'] 	= request.getParameter('custpage_nch_period_conta_ini');
					params['custscript_br_perio_sped_ecfin'] 	= request.getParameter('custpage_nch_period_conta_fin');
					
					//INVOCACION DE SCRIPT PROGRAMADO
					var status = nlapiScheduleScript(report.custrecord_nch_id_schedule, report.custrecord_nch_id_deploy, params);

					if (status == 'INQUEUE' || status == 'INPROGRESS' )
					{
						// Actualiza el log para informar que se inicio el proceso
						nlapiSubmitField('customrecord_nch_rpt_generator_log', rec_id, ['custrecord_nch_rg_name'], ['Cancelado - ' + status ]);
					}

				break;

				case 7:
				// PARAMETROS A ENVIAR PARA SCRIPT PROGRAMADO FCI
				params['custscript_br_subsi_fci'] = 3;
				params['custscript_br_idrep_fci'] = rec_id;
				params['custscript_br_perio_fci'] = request.getParameter('custpage_nch_period_conta');

				nlapiLogExecution('DEBUG', 'this0', rec_id + '|' + 'searchctalt[0]' + '|' + request.getParameter('custpage_nch_period_conta'));

				//INVOCACION DE SCRIPT PROGRAMADO
				var status = nlapiScheduleScript(report.custrecord_nch_id_schedule, report.custrecord_nch_id_deploy, params);

				if (status == 'INQUEUE' || status == 'INPROGRESS') {
					// Actualiza el log para informar que se inicio el proceso
					nlapiSubmitField('customrecord_nch_rpt_generator_log', rec_id, ['custrecord_nch_rg_name'], ['Cancelado - ' + status]);
				}

				break;

		
			}

			// Redireccion el script, vuelve a llamar al SuiteLet actual
			nlapiSetRedirectURL('SUITELET', nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId());
		}
	} catch (err) {
		nlapiLogExecution('ERROR', 'Error suitelet_main_br', err + ' - ' + err.lineNumber);
		nlapiSendEmail(20, 'jaciel.guzman@nch.com,jonathan.jimenez@nch.com', 'Error en Reporteador Brazil' + idrpts, err + ' - ' + err.line);
	}

	return true;
}
