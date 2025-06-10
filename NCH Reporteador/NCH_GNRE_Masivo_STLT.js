/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope Public
 *
 * Version    Date            Author           Remarks
 * 1.00       08 Abr 2025     Jaciel           Generar masivamente los GNRE
 */

define(['N/runtime', 'N/search', 'N/ui/serverWidget', 'N/task', 'N/record', 'N/redirect'],

	function (runtime, search, ui, task, record, redirect) {

		function onRequest(context) {
			try {
				if (context.request.method == 'GET') {
					var form = ui.createForm({
						title: 'GNRE em massa'
					});

					var ambiente = runtime.envType;
					form.clientScriptFileId = (ambiente == 'SANDBOX') ? 202625 : 202625;

					form.addButton({
						id: 'custpage_btn',
						label: 'Gerar',
						functionName: 'Genera_GNREMasivo'
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
					var listaGNRE = form.addSublist({
						id: 'custpage_sublista_log',
						type: ui.SublistType.LIST,
						label: 'Registro de geração GNRE',
						tab: 'custpage_maintab'
					});

					// listaGNRE.addField({
					// 	id: 'custpage_log_gnre_total',
					// 	type: ui.FieldType.LABEL,
					// 	label: 'TOTAL'
					// });
					listaGNRE.addField({
						id: 'custpage_log_gnre_genera',
						type: ui.FieldType.CHECKBOX,
						label: 'Gerar'
					});
					listaGNRE.addField({
						id: 'custpage_log_gnre_idinterno',
						type: ui.FieldType.TEXT,
						label: 'Id Interno'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					listaGNRE.addField({
						id: 'custpage_log_gnre_documento',
						type: ui.FieldType.TEXT,
						label: 'Documento'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNRE.addField({
						id: 'custpage_log_gnre_tipodoc',
						type: ui.FieldType.TEXT,
						label: 'Tipo de documento'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNRE.addField({
						id: 'custpage_log_gnre_fechadoc',
						type: ui.FieldType.TEXT,
						label: 'Fecha documento'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNRE.addField({
						id: 'custpage_log_gnre_uf',
						type: ui.FieldType.TEXT,
						label: 'UF'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNRE.addField({
						id: 'custpage_log_gnre_cliente',
						type: ui.FieldType.TEXT,
						label: 'Cliente'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNRE.addField({
						id: 'custpage_log_gnre_est_doc',
						type: ui.FieldType.TEXT,
						label: 'Status de Certificação'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNRE.addField({
						id: 'custpage_log_gnre_est_gnre',
						type: ui.FieldType.TEXT,
						label: 'Status do GNRE'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					// listaGNRE.addField({
					// 	id: 'custpage_log_gnre_retorno',
					// 	type: ui.FieldType.TEXT,
					// 	label: 'Mensagem da retorno'
					// }).updateDisplayType({
					// 	displayType: ui.FieldDisplayType.DISABLED
					// });

					// listaGNRE.addRefreshButton();
					listaGNRE.addMarkAllButtons();

					// NCH Busca Genera GNRE Masiva	
					var transactionSearchObj = search.create({
						type: "transaction",
						filters:
							[
								["type", "anyof", "CustInvc", "CuTrSale113"],
								"AND",
								["custbody_brl_tran_l_edoc_status", "anyof", "3"],
								"AND",
								["custbody_brl_tran_l_gnre_edoc_status", "anyof", "4", "1"],
								"AND",
								// FCP_ST_BR, ICMS_DIFAL_BR, ICMS_ST_BR, ICMS_ST_NCH
                                ["taxdetail.taxcode","anyof","25","21","24"], 
                                "AND", 
                                ["billingaddress.state","isnot","SP"]
							],
						columns:
							[
								search.createColumn({
									name: "internalid",
									summary: "GROUP",
									sort: search.Sort.DESC
								}),
								search.createColumn({
									name: "tranid",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "trandate",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "type",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "mainname",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "custbody_brl_tran_l_edoc_status",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "custbody_brl_tran_l_gnre_edoc_status",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "custbody_psg_ei_certified_edoc",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "custbody_brl_tran_dt_cert_date",
									summary: "GROUP"
								}),
								search.createColumn({
									name: "billstate",
									summary: "GROUP"
								})
							]
					});

					var searchResultCount = transactionSearchObj.runPaged().count;
					var renglon = 0;

					var strhtml = "<html>" +
						"<table>" +
						"<tr>" +
						"</tr>" +
						"<tr>" +
						"<td class='text'>" +
						"<div style=\"font-size: 10pt; margin-top: 12px;\">" +
						"Total documentos: " + searchResultCount + "</div>" +
						"</td>" +
						"</tr>" +
						"</table>" +
						"</html>";
					myInlineHtml.defaultValue = strhtml;

					listaGNRE.label = 'Log de geração GNRE<br/> Total documentos: ' + searchResultCount;
					log.debug("transactionSearchObj result count", searchResultCount);

					transactionSearchObj.run().each(function (result) {
						// .run().each has a limit of 4,000 results
						var idInterno = result.getValue({
							name: 'internalid',
							summary: search.Summary.GROUP
						});
						var numeroDocumento = result.getValue({
							name: 'tranid',
							summary: search.Summary.GROUP
						});
						var tipoDocumento = result.getText({
							name: 'type',
							summary: search.Summary.GROUP
						});
						var fechaDocumento = result.getValue({
							name: 'trandate',
							summary: search.Summary.GROUP
						});
						var cliente = result.getText({
							name: 'mainname',
							summary: search.Summary.GROUP
						});
						var estatusCertificado = result.getText({
							name: 'custbody_brl_tran_l_edoc_status',
							summary: search.Summary.GROUP
						});
						var estatusGNRE = result.getText({
							name: 'custbody_brl_tran_l_gnre_edoc_status',
							summary: search.Summary.GROUP
						});
						var uf = result.getValue({
							name: "billstate",
							summary: search.Summary.GROUP
						});

						listaGNRE.setSublistValue({
							id: 'custpage_log_gnre_idinterno',
							line: renglon,
							value: idInterno
						});
						listaGNRE.setSublistValue({
							id: 'custpage_log_gnre_documento',
							line: renglon,
							value: numeroDocumento
						});
						listaGNRE.setSublistValue({
							id: 'custpage_log_gnre_tipodoc',
							line: renglon,
							value: tipoDocumento
						});
						listaGNRE.setSublistValue({
							id: 'custpage_log_gnre_fechadoc',
							line: renglon,
							value: fechaDocumento
						});
						listaGNRE.setSublistValue({
							id: 'custpage_log_gnre_cliente',
							line: renglon,
							value: cliente
						});
						listaGNRE.setSublistValue({
							id: 'custpage_log_gnre_est_doc',
							line: renglon,
							value: estatusCertificado
						});
						listaGNRE.setSublistValue({
							id: 'custpage_log_gnre_est_gnre',
							line: renglon,
							value: estatusGNRE
						});
						listaGNRE.setSublistValue({
							id: 'custpage_log_gnre_uf',
							line: renglon,
							value: uf
						});

						renglon++;

						return true;
					});

					// Botones del formulario
					// form.addSubmitButton('Gerar NO chive');
					// form.addResetButton('Cancelar');

					// Crea el formulario
					context.response.writePage(form);
				}
				else {	// POST
					var objParametros = context.request.parameters;
					var objScript = runtime.getCurrentScript();
					var scriptId = objScript.id;
					var deployId = objScript.deploymentId;

					var parametros = {
						custscript_nch_sourcetransactionid_gnre: transactionId,
						custscript_nch_transactiontype_gnre: transactionType
					};

					// Llamado de scheduled
					// var status = task.create({
					// 	taskType: task.TaskType.SCHEDULED_SCRIPT,
					// 	scriptId: 'customscript_nch_gnre_masivo_schd',
					// 	deploymentId: 'customdeploy_nch_gnre_masivo_schd',
					// 	params: parametros
					// });

					// status.submit();

					// if (status == 'INQUEUE' || status == 'INPROGRESS') {
					// 	// Actualiza el log para informar que se inicio el proceso
					// 	GuardaLog('Cancelado - ' + status, 'invoice', 'Status', 'Cancelado');
					// }

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
				GuardaLog('onRequest', '', '', err + ' - ' + err.lineNumber);
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