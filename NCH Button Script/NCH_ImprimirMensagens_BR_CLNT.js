/**
 * @NApiVersion 2.x 
 * @NScriptType ClientScript
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2024     Jaciel           Mostrar PDF de Factura de cliente con sus mensajes relacionados a nivel de artículo y general
 */

define(['N/url', 'N/record', 'N/runtime'],
	function (url, record, runtime) {

		function pageInit(context) {

			var tex = ' this1' + '|' + context + '|' + context + '|' + context;
			log.debug({ title: 'beforeLoad_addButton', details: tex });

			var currentRecord = context.currentRecord;

		}

		function ImprimeFacturaMensajes(context) {
			//var currentRecord = context.currentRecord;

			var tex = ' this0' + '|' + 'context Cliente' + '|' + nlapiGetRecordId() + '|' + context;
			log.debug({ title: 'beforeLoad_addButton', details: tex });

			// alert('prueba mensajes\n');
			// alert(currentRecord.id)

			var creaURL = url.resolveScript({
				scriptId: 'customscript_nch_imprime_mensaje_br_stlt',
				deploymentId: 'customdeploy_nch_imprime_mensaje_br_stlt',
				returnExternalUrl: false
			});

			//Se pasa el id interno del registro actual
			creaURL += '&id=' + nlapiGetRecordId();

			//muestra el PDF 
			newWindow = window.open(creaURL);
		}

		function onSaveRecord(context) {
			var currentRecord = context.currentRecord;
		}

		return {
			pageInit: pageInit,
			saveRecord: onSaveRecord,
			ImprimeFacturaMensajes: ImprimeFacturaMensajes
		}

	});
