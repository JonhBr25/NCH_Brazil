/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope Public
 *
 * Version    Date            Author           Remarks
 * 1.00       23 May 2025     Jaciel           Crear transacción Remessa de Saída a partir de ItemFulfillment
 */

define(['N/ui/serverWidget', 'N/record', 'N/redirect'],

	function (ui, record, redirect) {

		function onRequest(context) {
			try {
				if (context.request.method == 'GET') {
					// var form = serverWidget.createForm({
					// 	title: 'Crear Remessa Saida (sin guardar)'
					// });

					// var objCreaRemessaSaida = record.create({
					// 	type: 'customsale_brl_outbound_delivery',
					// 	isDynamic: true
					// });

					// objCreaRemessaSaida.setValue({
					// 	fieldId: 'entity',
					// 	value: 21868
					// });
					// objCreaRemessaSaida.setValue({
					// 	fieldId: 'subsidiary',
					// 	value: 3
					// });

					var parametros = {
						entity: 21868
					}

					redirect.toRecord({
						type: 'customsale_brl_outbound_delivery',
						id: null, 
						isEditMode: true,
						parameters: parametros
					});

					context.response.writePage(form);

					return respuesta;
				}
			}
			catch (err) {
				log.debug({
					title: 'Error suitelet_main', details: err + ' - ' + err.lineNumber
				});

				GuardaLog('onRequest', '', 'Crea RemessaSaida stlt', err + ' - ' + err.lineNumber);
				//sendemail(err + tex, NCH_script);
			}

			/**
			 * Guarda éxito o error en log: NCH Log GNRE Masivo
			 * 
			 * @param {string} idDocumento Documento / Donde sucede el error
			 * @param {string} tipoDocumento Tipo de documento
			 * @param {string} notas Notas extras
			 * @param {string} error Mensaje de error
			 */
			function GuardaLog(idDocumento, tipoDocumento, notas, error) {
				var registroLog = record.create({
					type: 'customrecord_nch_log_gnre_masivo_br'
				})

				registroLog.setValue({
					fieldId: 'custrecord_nch_documento_gnre_m', value: idDocumento
				});
				registroLog.setValue({
					fieldId: 'custrecord_nch_tipodoc_gnre_m', value: tipoDocumento
				});
				registroLog.setValue({
					fieldId: 'custrecord_nch_notas_gnre_m', value: notas
				});
				registroLog.setValue({
					fieldId: 'custrecord_nch_error_gnre_m', value: error
				});

				registroLog.save();
			}

			return true;
		}

		return {
			onRequest: onRequest
		};
	});