/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope Public
 *
 * Version    Date            Author           Remarks
 * 1.00       23 May 2025     Jaciel           Redirecciona transacción Remessa de Saída a partir de ItemFulfillment
 */

define(['N/redirect', 'N/record', 'N/log'],

	function (redirect, record, log) {

		function onRequest(context) {
			try {

				var tex = ' this1' + '|' + 'noCHIVEEEE' + '|' + 'categoria' + '|' + 'nuevoIdInterno';
				log.debug({ title: 'onRequest', details: tex });

				if (context.request.method === 'POST') {
					var requestBody = JSON.parse(context.request.body);

					// var nuevoIdInternoRM = context.request.parameters.nuevoIdInterno_rmdesdeif;
					var nuevoIdInternoRS = requestBody.nuevoIdInterno_rmdesdeif;

					var tex = ' this0' + '|' + nuevoIdInternoRS + '|' + 'categoria' + '|' + 'nuevoIdInterno';
					log.debug({ title: 'onRequest', details: tex });

					if (nuevoIdInternoRS) {
						// redirect.toRecord({
						// 	type: 'customsale_brl_outbound_delivery',
						// 	id: parseInt(nuevoIdInternoRM)
						// });
						context.response.sendRedirect({
							type: 'customsale_brl_outbound_delivery',
							identifier: nuevoIdInternoRS,
							defaultValues: {}
						});
					}

					context.response.write({
						output: JSON.stringify({
							status: 'SUCCESS',
							message: 'Datos recibidos y procesados por el Suitelet. Sí estoy llegando.'
						})
					});
				}
			}
			catch (err) {
				log.debug({
					title: 'Error suitelet_main', details: err + ' - ' + err.lineNumber
				});
				log.error({
					title: 'Error',
					details: err.toString() + ' Stack: ' + err.stack // e.stack puede dar más detalles
				});
				context.response.write({
					output: JSON.stringify({
						status: 'ERROR',
						message: 'Error interno en Suitelet: ' + err.toString()
					}),
					code: http.ServerResponse.STATUS_CODE.INTERNAL_ERROR, // Esto asegura que regrese un 500
					headers: { 'Content-Type': 'application/json' }
				});

				// GuardaLog('onRequest', '', 'Crea RemessaSaida stlt', err + ' - ' + err.lineNumber);
				//sendemail(err + tex, NCH_script);
			}
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

			return true;
		}

		return {
			onRequest: onRequest
		};
	});