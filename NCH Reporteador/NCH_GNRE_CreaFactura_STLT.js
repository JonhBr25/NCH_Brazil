/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope Public
 *
 * Version    Date            Author           Remarks
 * 1.00       08 May 2025     Jaciel           Crear facturas a partir de los GNRE autorizados
 */

define(['N/runtime', 'N/search', 'N/ui/serverWidget', 'N/task', 'N/record', 'N/redirect', 'N/ui/message'],

	function (runtime, search, ui, task, record, redirect, message) {

		function onRequest(context) {
			try {
				if (context.request.method == 'GET') {
					var form = ui.createForm({
						title: 'GNRE Criar Fatura'
					});

					var ambiente = runtime.envType;
					form.clientScriptFileId = (ambiente == 'SANDBOX') ? 203865 : 203865;

					form.addButton({
						id: 'custpage_btn',
						label: 'Criar fatura no chive'
					});

					// Mensaje para el cliente
					var myInlineHtml = form.addField({
						id: 'custpage_field',
						label: 'Log',
						type: ui.FieldType.INLINEHTML
					})
					myInlineHtml.updateLayoutType({
						layoutType: ui.FieldLayoutType.OUTSIDEBELOW
					});
					myInlineHtml.updateBreakType({
						breakType: ui.FieldBreakType.STARTCOL
					});

					var tab = form.addTab({
						id: 'custpage_maintab',
						label: 'Tab'
					});

					//Sublista Log de generacion				
					var listaGNREcf = form.addSublist({
						id: 'custpage_sublista_log',
						type: ui.SublistType.LIST,
						label: 'Registro de criação de faturas do GNRE',
						tab: 'custpage_maintab'
					});

					// Campos de sublista
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_criar',
						type: ui.FieldType.CHECKBOX,
						label: 'Criar'
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_idinternot',
						type: ui.FieldType.TEXT,
						label: 'Id Interno Transaccion'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_idinternoa',
						type: ui.FieldType.TEXT,
						label: 'Id Archivo'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_documento',
						type: ui.FieldType.TEXT,
						label: 'Documento de origem'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_tipodoc',
						type: ui.FieldType.TEXT,
						label: 'Tipo de documento'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_nombrearchivo',
						type: ui.FieldType.TEXT,
						label: 'Nombre arquivo XML GNRE'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_cliente',
						type: ui.FieldType.TEXT,
						label: 'Cliente'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_fatura_numero',
						type: ui.FieldType.TEXT,
						label: 'Número da fatura'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_factura_creada',
						type: ui.FieldType.CHECKBOX,
						label: 'Fatura criada'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_urlarchivo',
						type: ui.FieldType.TEXT,
						label: 'URL'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					listaGNREcf.addField({
						id: 'custpage_log_gnre_cf_descarga',
						type: ui.FieldType.TEXT,
						label: 'Descarga'
					});

					// listaGNRE.addRefreshButton();
					listaGNREcf.addMarkAllButtons();

					// NCH Log GNRE Creacion Factura
					var transactionSearchObj = search.create({
						type: "customrecord_nch_log_gnre_crear_factura",
						filters:
							[
								["custrecord_nch_seleccion_gnre_cf", "is", "F"]
							],
						columns:
							[
								search.createColumn({
									name: "custrecord_nch_idarchivo_gnre_cf"
								}),
								search.createColumn({
									name: "custrecord_nch_seleccion_gnre_cf"
								}),
								search.createColumn({
									name: "created"
								}),
								search.createColumn({
									name: "custrecord_nch_tipodoc_gnre_cf"
								}),
								search.createColumn({
									name: "custrecord_nch_nome_arquivo_gnre_cf"
								}),
								search.createColumn({
									name: "custrecord_nch_cliente_gnre_cf"
								}),
								search.createColumn({
									name: "custrecord_nch_factura_numero_gnre_cf"
								}),
								search.createColumn({
									name: "custrecord_nch_factura_creada_gnre_cf"
								}),
								search.createColumn({
									name: "custrecord_nch_url_arquivo_gnre_cf"
								}),
								search.createColumn({
									name: "internalid"
								})
							]
					});

					var searchResultCount = transactionSearchObj.runPaged().count;
					var renglon = 0;

					listaGNREcf.label = 'Registro de criação de faturas do GNRE<br/> Total documentos: ' + searchResultCount;
					log.debug("transactionSearchObj result count", searchResultCount);

					transactionSearchObj.run().each(function (result) {
						// .run().each has a limit of 4,000 results

						// Se obtienen los valores
						var idArchivo = result.getValue({
							name: 'custrecord_nch_idarchivo_gnre_cf'
						});
						var documento = result.getValue({
							name: 'custrecord_nch_nome_arquivo_gnre_cf'
						});
						var tipoDocumento = result.getText({
							name: 'custrecord_nch_tipodoc_gnre_cf'
						});
						var cliente = result.getText({
							name: 'custrecord_nch_cliente_gnre_cf'
						});
						var facturaNumero = result.getValue({
							name: 'custrecord_nch_factura_numero_gnre_cf'
						});
						var facturaCreada = result.getValue({
							name: 'custrecord_nch_factura_creada_gnre_cf'
						});
						var urlArchivo = result.getValue({
							name: 'custrecord_nch_url_arquivo_gnre_cf'
						});
						var idInterno = result.getValue({
							name: 'internalid'
						});
						// var enlace = 'Para criar';

						if (urlArchivo != 'Error' && urlArchivo != 'Para criar') {
							urlArchivo = '<a target="_blank" href="' + urlArchivo + '">Abrir</a>';
						}

						log.debug("FacturaCreada", facturaCreada);

						// Se asignan los valores
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_idinternoa',
							line: renglon,
							value: idArchivo
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_documento',
							line: renglon,
							// value: documento.toString()
							value: documento.substring(26)
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_tipodoc',
							line: renglon,
							value: tipoDocumento
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_nombrearchivo',
							line: renglon,
							value: documento
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_cliente',
							line: renglon,
							value: cliente
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_fatura_numero',
							line: renglon,
							value: (facturaNumero == '') ? '0' : facturaNumero
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_fatura_creada',
							line: renglon,
							value: (facturaCreada) ? 'T' : 'F'
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_urlarchivo',
							line: renglon,
							value: urlArchivo
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_descarga',
							line: renglon,
							value: urlArchivo
						});
						listaGNREcf.setSublistValue({
							id: 'custpage_log_gnre_cf_idinternot',
							line: renglon,
							value: idInterno
						});

						renglon++;

						return true;
					});

					// Botones del formulario
					form.addSubmitButton({
						label: 'Criar fatura'
					});
					// form.addResetButton('Cancelar');

					// Crea el formulario
					context.response.writePage(form);
				}
				else {	// POST
					var objParametros = context.request.parameters;
					var objScript = runtime.getCurrentScript();
					var scriptId = objScript.id;
					var deployId = objScript.deploymentId;

					var cuantosPDF = context.request.getLineCount({
						group: 'custpage_sublista_log'
					});

					var haySeleccion = false;

					for (var i = 0; i < cuantosPDF; i++) {
						var seleccionSublista = context.request.getSublistValue({
							group: 'custpage_sublista_log',
							name: 'custpage_log_gnre_cf_criar',
							line: i
						});

						if (seleccionSublista == 'T') {
							haySeleccion = true;

							var idArchivoSublista = context.request.getSublistValue({
								group: 'custpage_sublista_log',
								name: 'custpage_log_gnre_cf_idinternoa',
								line: i
							});
							var idInternoLog = context.request.getSublistValue({
								group: 'custpage_sublista_log',
								name: 'custpage_log_gnre_cf_idinternot',
								line: i
							});

							log.debug({
								title: 'DatosSublista',
								details: seleccionSublista + '|' + 'urlSublista' + '|' + idArchivoSublista
							});

							var parametros = {
								custscript_nch_gnre_cf_idarchivo: idArchivoSublista,
								custscript_nch_gnre_cf_idinternolog: idInternoLog
								// custscript_nch_transactiontype_gnre: transactionType
							};

							// Llamado de scheduled
							var status = task.create({
								taskType: task.TaskType.SCHEDULED_SCRIPT,
								scriptId: 'customscript_nch_gnre_crea_factura_schdl',
								deploymentId: 'customdeploy_nch_gnre_crea_factura_schdl',
								params: parametros
							});

							var scriptTaskId = status.submit();
							var resultado = task.checkStatus(scriptTaskId);

							var entraCiclo = true;

							// if (status == 'INQUEUE' || status == 'INPROGRESS') {
							// 	// Actualiza el log para informar que se inicio el proceso
							// 	GuardaLog('Cancelado - ' + status, 'invoice', 'Status', 'Cancelado');
							// }

							// Se busca que el script programado termine para poder mostrar el registro recién creado
							while (entraCiclo == true) {
								resultado = task.checkStatus(scriptTaskId);

								if (resultado.status == 'COMPLETE') {
									entraCiclo = false;
								}

								if (resultado.status == 'FAILED') {
									entraCiclo = false;

									return false;
								}
							}

							// Al salir del while continua el ciclo for
							// Se actualiza el log de pantalla
						}
					}

					if (!haySeleccion) {
						// log.debug({
						// 	title: 'Sin seleccionados',
						// 	details: seleccionSublista
						// });

						// Message object as parameter 
						var messageObj = message.create({
							type: message.Type.ERROR,
							message: 'Você deve selecionar pelo menos um GNRE.'
						});

						// form.addPageInitMessage({
						//     message: messageObj
						// });

						// context.response.writePage(form);

						// return false;
					}

					var tex = ' this0' + '|' + resultado + '|' + resultado.status + '|' + parametros.custscript_nch_gnre_cf_idarchivo;
					log.debug({ title: 'onRequest', details: tex });

					// Se llama de nuevo al SuiteLet actual
					redirect.toSuitelet({
						scriptId: scriptId,
						deploymentId: deployId
					});
				}
			}
			catch (err) {
				log.debug({
					title: 'Error suitelet_main', details: err + ' - ' + err.lineNumber
				});
				GuardaLog('onRequest', '', 'GNRE Crea Factura', err + ' - ' + err.lineNumber);
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