/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@NModuleScope Public
 *
 * Version    Date            Author        Remarks
 * 1.00       05 May 2025     Jaciel		Copia de código Impresión Masiva Documento Fiscal
 */

define(['N/search', 'N/ui/serverWidget', 'N/xml', 'N/record', 'N/file', 'N/render'],

	function (search, ui, xml, record, file, render) {

		function onRequest(context) {
			try {
				if (context.request.method == 'GET') {
					var form = ui.createForm({
						title: 'Impressão Enorme GNRE Brazil'
					});

					form.addTab({
						id: 'custpage_maintab',
						label: 'Tab'
					});
					var listaGNREim = form.addSublist({
						id: 'custpage_sublista_log',
						type: ui.SublistType.LIST,
						label: 'GNRE Impressão em massa',
						tab: 'custpage_maintab'
					});

					// Campos de sublista
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_imprime',
						type: ui.FieldType.CHECKBOX,
						label: 'Imprimir'
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_idinternot',
						type: ui.FieldType.TEXT,
						label: 'Id Interno Transaccion'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_idinternoa',
						type: ui.FieldType.TEXT,
						label: 'Id Archivo'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_documento',
						type: ui.FieldType.TEXT,
						label: 'Documento'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_tipodoc',
						type: ui.FieldType.TEXT,
						label: 'Tipo de documento'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_nombrearchivo',
						type: ui.FieldType.TEXT,
						label: 'Nombre arquivo'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_cliente',
						type: ui.FieldType.TEXT,
						label: 'Cliente'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_cadastrofederal',
						type: ui.FieldType.TEXT,
						label: 'Cadastro Federal'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.DISABLED
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_urlarchivo',
						type: ui.FieldType.TEXT,
						label: 'URL'
					}).updateDisplayType({
						displayType: ui.FieldDisplayType.HIDDEN
					});
					listaGNREim.addField({
						id: 'custpage_log_gnre_i_descarga',
						type: ui.FieldType.TEXT,
						label: 'Descarga'
					});

					// Búsqueda guardada NCH Log GNRE Impresion Masiva
					var gnreimSearchObj = search.create({
						type: "customrecord_nch_log_gnre_impresion_masi",
						filters:
							[
								["custrecord_nch_seleccion_gnre_i", "is", "F"]
							],
						columns:
							[
								search.createColumn({
									name: "custrecord_nch_idinterno_gnre_i"
								}),
								search.createColumn({
									name: "custrecord_nch_seleccion_gnre_i"
								}),
								search.createColumn({
									name: "created"
								}),
								search.createColumn({
									name: "custrecord_nch_tipodoc_gnre_i"
								}),
								search.createColumn({
									name: "custrecord_nch_nome_arquivo_gnre_i"
								}),
								search.createColumn({
									name: "custrecord_nch_cliente_gnre_i"
								}),
								search.createColumn({
									name: "custrecord_nch_cadastro_gnre_i"
								}),
								search.createColumn({
									name: "custrecord_nch_url_arquivo_gnre_i"
								}),
								search.createColumn({
									name: "internalid"
								})
							]
					});

					var renglon = 0;

					var searchResultCount = gnreimSearchObj.runPaged().count;
					log.debug("gnreimSearchObj result count", searchResultCount);

					listaGNREim.label = 'Log de geração GNRE<br/> Total documentos: ' + searchResultCount;

					gnreimSearchObj.run().each(function (result) {
						// .run().each has a limit of 4,000 results

						// Se obtienen los valores
						var idArchivo = result.getValue({
							name: 'custrecord_nch_idinterno_gnre_i'
						});
						var documento = result.getValue({
							name: 'custrecord_nch_nome_arquivo_gnre_i'
						});
						var tipoDocumento = result.getText({
							name: 'custrecord_nch_tipodoc_gnre_i'
						});
						var cliente = result.getText({
							name: 'custrecord_nch_cliente_gnre_i'
						});
						var cadastroFederal = result.getValue({
							name: 'custrecord_nch_cadastro_gnre_i'
						});
						var urlArchivo = result.getValue({
							name: 'custrecord_nch_url_arquivo_gnre_i'
						});
						var idInterno = result.getValue({
							name: 'internalid'
						});
						var enlace = '<a target="_blank" href="' + urlArchivo + '">Abrir</a>';

						// Se asignan los valores
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_idinternoa',
							line: renglon,
							value: idArchivo
						});
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_documento',
							line: renglon,
							// value: documento.toString()
							value: documento.substring(18)
						});
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_tipodoc',
							line: renglon,
							value: tipoDocumento
						});
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_nombrearchivo',
							line: renglon,
							value: documento
						});
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_cliente',
							line: renglon,
							value: cliente
						});
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_cadastrofederal',
							line: renglon,
							value: cadastroFederal
						});
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_urlarchivo',
							line: renglon,
							value: urlArchivo
						});
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_descarga',
							line: renglon,
							value: enlace
						});
						listaGNREim.setSublistValue({
							id: 'custpage_log_gnre_i_idinternot',
							line: renglon,
							value: idInterno
						});

						renglon++;

						return true;
					});

					listaGNREim.addMarkAllButtons();

					form.addSubmitButton({
						label: 'Imprimir'
					});

					context.response.writePage(form);
				}
				//POST - Delete the selected transactions and show a confirmation message
				else {
					var cuantosPDF = context.request.getLineCount({
						group: 'custpage_sublista_log'
					});

					var arrayPDF = [];

					var xmlPDF = "<?xml version=\"1.0\"?>" +
						"<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">";
					xmlPDF += "<pdfset>";

					for (var i = 0; i < cuantosPDF; i++) {
						var seleccionSublista = context.request.getSublistValue({
							group: 'custpage_sublista_log',
							name: 'custpage_log_gnre_i_imprime',
							line: i
						});

						if (seleccionSublista == 'T') {
							var idInternoTSublista = context.request.getSublistValue({
								group: 'custpage_sublista_log',
								name: 'custpage_log_gnre_i_idinternot',
								line: i
							});
							var urlSublista = context.request.getSublistValue({
								group: 'custpage_sublista_log',
								name: 'custpage_log_gnre_i_urlarchivo',
								line: i
							});
							var idArchivoSublista = context.request.getSublistValue({
								group: 'custpage_sublista_log',
								name: 'custpage_log_gnre_i_idinternoa',
								line: i
							});

							// log.debug({
							// 	title: 'DatosSublista',
							// 	details: idInternoTSublista + '|' + urlSublista + '|' + idArchivoSublista
							// });

							var origenPDF = xml.escape({
								xmlText: urlSublista
							});

							xmlPDF += "<pdf src='" + origenPDF + "'/>";

							record.submitFields({
								type: 'customrecord_nch_log_gnre_impresion_masi',
								id: idInternoTSublista,
								values: {
									'custrecord_nch_seleccion_gnre_i': 'T'
								}
							});

							arrayPDF.push(idArchivoSublista);
						}
						else {
							// log.debug({
							// 	title: 'Sin seleccionados',
							// 	details: seleccionSublista
							// });
						}
					}

					xmlPDF += "</pdfset>";

					// var tex = ' this0' + '|' + cuantosPDF + '|' + xmlPDF + '|' + origenPDF;
					// log.debug({ title: 'suitelet_main', details: tex });

					render.xmlToPdf({
						xmlString: xmlPDF
					});

					context.response.renderPdf(xmlPDF);

					log.debug({
						title: 'ArrayPDF',
						details: arrayPDF
					});

					for (var j = 0; j < arrayPDF.length; j++) {						
						file.delete({
							id: arrayPDF[j]
						});
					}
				}
			} catch (err) {
				log.debug({
					title: 'Error suitelet_main GNRE impresion',
					details: err + ' - ' + err.lineNumber
				});
			}

			return true;
		}

		return {
			onRequest: onRequest
		};
	});