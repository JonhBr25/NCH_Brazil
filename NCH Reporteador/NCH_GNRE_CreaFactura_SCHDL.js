/** 
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *
 * Version    Date            Author           Remarks
 * 1.00       09 May 2025     Jaciel           Lee el XML de retorno de GNRE autorizado para convertirlo en factura.
 */

 define(['N/search', 'N/record', 'N/runtime', 'N/file', 'N/xml', 'N/format'],

    function (search, record, runtime, file, xml, format) {

        function scheduled(context) {
            var idXML = runtime.getCurrentScript().getParameter("custscript_nch_gnre_cf_idarchivo");
            var idInternoLog = runtime.getCurrentScript().getParameter("custscript_nch_gnre_cf_idinternolog");

            var idRegistro = 0;

            try {
                var archivoXML = file.load({
                    id: idXML
                });
                var xmlContenido = archivoXML.getContents();
                // xmlContenido = xmlContenido.replace(/xmlns/g, 'xmlns:bra');

                var xmlDocumento = xml.Parser.fromString({
                    text: xmlContenido
                });

                // Variables para insertar en vendorbill desde XML GNRE
                var tagUF = xmlDocumento.getElementsByTagName({
                    tagName: 'ns1:ufFavorecida'
                });
                var tagDocumentoOrigem = xmlDocumento.getElementsByTagName({
                    tagName: 'ns1:documentoOrigem'
                });
                var tagReceita = xmlDocumento.getElementsByTagName({
                    tagName: 'ns1:receita'
                });
                var tagDataVencimento = xmlDocumento.getElementsByTagName({
                    tagName: 'ns1:dataVencimento'
                });
                var tagDataPagamento = xmlDocumento.getElementsByTagName({
                    tagName: 'ns1:dataPagamento'
                });
                var tagValorGNRE = xmlDocumento.getElementsByTagName({
                    tagName: 'ns1:valorGNRE'
                });

                // Valores nodos
                var ufFavorecida = (tagUF.length > 0) ? tagUF[0].textContent : '';
                var documentoOrigem = (tagDocumentoOrigem.length > 0) ? tagDocumentoOrigem[0].textContent : '';
                var receita = (tagReceita.length > 0) ? tagReceita[0].textContent : '';
                var dataVencimento = (tagDataVencimento.length > 0) ? tagDataVencimento[0].textContent : '';
                var dataPagamento = (tagDataPagamento.length > 0) ? tagDataPagamento[0].textContent : '';

                // Valores atributos de nodos
                var atributoTipo = '';
                if (documentoOrigem.length > 0) {
                    atributoTipo = tagDocumentoOrigem[0].getAttribute({
                        name: 'tipo'
                    });
                }

                // Por al atributo tipo del tag documentoOrigem sacamos el número de documento origen de Netsuite
                // 10 NOTA FISCAL, 22 CHAVE DA NFe, 24 CHAVE DO DFe
                if (atributoTipo == 22 || atributoTipo == 24) {
                    documentoOrigem = documentoOrigem.substring(25, 34);
                }

                var idSubsidiaria = 3;

                var prefijo = search.lookupFields({
                    type: search.Type.SUBSIDIARY,
                    id: idSubsidiaria,
                    columns: ['tranprefix']
                });

                // var numeroFatura = ufFavorecida + parseInt(documentoOrigem) + receita;
                var numeroFatura = ufFavorecida + parseInt(documentoOrigem) + prefijo.tranprefix + receita;

                //Se verifica no exista la misma factura
                var vendorbillSearchObj = search.create({
                    type: "vendorbill",
                    settings: [{ "name": "consolidationtype", "value": "NONE" }],
                    filters:
                        [
                            ["type", "anyof", "VendBill"],
                            "AND",
                            ["mainline", "is", "T"],
                            "AND",
                            ["formulatext: {tranid}", "is", numeroFatura]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "tranid" }),
                        ]
                });

                var cuantosExiste = vendorbillSearchObj.runPaged().count;

                log.debug("cuantosExiste", cuantosExiste);

                if (cuantosExiste > 0) {
                    // Actualiza el log para informar error
                    ActualizaLog(idInternoLog, 'Já existe um registro com número: ' + numeroFatura);

                    return false;
                }

                var hoy = new Date();
                var sDia = String(hoy.getDate()).padStart(2, '0');
                var sMes = String(hoy.getMonth() + 1).padStart(2, '0'); //January is 0!
                var sAnio = hoy.getFullYear();
                var sFechaHoy = sDia + '/' + sMes + '/' + sAnio;
                var sDataVencimiento = dataVencimento.substring(8, 10) + '/' + dataVencimento.substring(5, 7) + '/' + dataVencimento.substring(0, 4);
                var sDataPagamento = dataPagamento.substring(8, 10) + '/' + dataPagamento.substring(5, 7) + '/' + dataPagamento.substring(0, 4);
                var sFechaFormato = format.parse({
                    value: sFechaHoy,
                    type: format.Type.DATE
                });
                var sFechaVencimiento = format.parse({
                    value: sDataVencimiento,
                    type: format.Type.DATE
                });

                var vendorSearchObj = search.create({
                    type: "vendor",
                    filters:
                        [
                            ["category", "anyof", "10"],
                            "AND",
                            ["entityid", "startswith", "Secret"],
                            "AND",
                            ["formulatext: {billstate}", "contains", ufFavorecida]
                        ],
                    columns:
                        [
                            search.createColumn({
											  
							   
												 
												   
							   
												 
																			  
							   
												 
                                name: "internalid"
                            }),
                            search.createColumn({
                                name: "companyname"
                            }),
                            search.createColumn({
                                name: "custentity_brl_entity_t_fed_tax_reg"
                            })
                        ]
                });

                var searchResultCount = vendorSearchObj.runPaged().count;
                log.debug("vendorSearchObj result count", searchResultCount);

                var internalId = 0;
                var nombre = '', cadastroFederal = '';

                vendorSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    internalId = result.getValue({
                        name: 'internalid'
					   
												
										   
					   
												
																	  
					   
												   
										  
                    });
                    nombre = result.getValue({
                        name: 'companyname'
                    });
																				
                    cadastroFederal = result.getValue({
                        name: 'custentity_brl_entity_t_fed_tax_reg'
                    });

                    return true;
                });

                // 211001500 Contas a Pagar : Fornecedores : Forneceodres Gorvenamentais
                var cuenta = 1285;
                var memo = 'GNRE' + ' - ' + ufFavorecida + ' ' + parseInt(documentoOrigem);
                var idArticulo = 7667;

                var articulo = search.lookupFields({
                    type: search.Type.ITEM,
                    id: idArticulo,
                    columns: ['itemid']
                });

                var descripcionArticulo = articulo.itemid + ' - ' + ufFavorecida + ' ' + parseInt(documentoOrigem);
                var cantidad = 1;
                var valorGNRE = (tagValorGNRE.length > 0) ? tagValorGNRE[0].textContent : '';
                var moneda = 1; // Real
                var departamento = 3; // 000 Hoja de Balance
                var clase = 9; // Non-Classify
                var ubicacion = 1; // BR - General Sorocaba

                // Datos extras en factura no obligatorios                
                var estatusAporbacion = 2;  // Aprovado
                var numDocEleAutorizado = sFechaFormato.toString().replaceAll('/', '')
                var terms = 95; // Adiantamento/GNRE
                var sustituirParcelas = false;

                var tex = ' this1' + '|' + sFechaVencimiento + '|' + sDataVencimiento + '|' + sDataPagamento;
                log.debug({ title: 'scheduled', details: tex });

                //Se crea el registro Fatura (vendorbill)
                var objCreaFactura = record.create({
                    type: 'vendorbill'
                });

                objCreaFactura.setValue({
                    fieldId: 'tranid',
                    value: numeroFatura
                });
                // objCreaFactura.setValue({
                //     fieldId: 'custbody_nch_chave_acesso',
                //     value: chaveAcesso
                // });
                objCreaFactura.setValue({
                    fieldId: 'entity',
                    value: internalId
                });
                objCreaFactura.setValue({
                    fieldId: 'location',
                    value: ubicacion
                });
                objCreaFactura.setValue({
                    fieldId: 'memo',
                    value: memo
                });
                objCreaFactura.setValue({
                    fieldId: 'custbody_nch_visualizar_xml',
                    value: archivoXML.id
                });
                objCreaFactura.setValue({
                    fieldId: 'account',
                    value: cuenta
                });
                objCreaFactura.setValue({
                    fieldId: 'trandate',
                    value: sFechaFormato
                });
                objCreaFactura.setValue({
                    fieldId: 'duedate',
                    value: sFechaVencimiento
                });

                // Extras
                objCreaFactura.setValue({
                    fieldId: 'approvalstatus',
                    value: estatusAporbacion
                });
                // objCreaFactura.setValue({
                //     fieldId: 'custpage_brl_tran_t_edoc_number',
                //     value: numDocEleAutorizado
                // });
                objCreaFactura.setValue({
                    fieldId: 'terms',
                    value: terms
                });
                objCreaFactura.setValue({
                    fieldId: 'overrideinstallments',
                    value: sustituirParcelas
                });

                // Línea de artículo
                objCreaFactura.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: 0,
                    value: idArticulo
                });
                objCreaFactura.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    line: 0,
                    value: descripcionArticulo
                });
                objCreaFactura.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: 0,
                    value: cantidad
                });
                objCreaFactura.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: 0,
                    value: valorGNRE
                });
                objCreaFactura.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'department',
                    line: 0,
                    value: departamento
                });
                objCreaFactura.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'class',
                    line: 0,
                    value: clase
                });

                idRegistro = objCreaFactura.save();

                if (idRegistro > 0) {
                    GuardaLog(idRegistro, '', numeroFatura, 'Entity: ' + internalId);

                    // Actualiza el log para informar que se inicio el proceso
                    var logRecord = record.load({
                        type: 'customrecord_nch_log_gnre_crear_factura',
                        id: idInternoLog
                    });

                    var resultado = search.lookupFields({
                        type: search.Type.VENDOR_BILL,
                        id: idRegistro,
                        columns: ['tranid']
                    });
                    var ambiente = (runtime.envType == 'SANDBOX') ? 'https://8589184-sb1.app.netsuite.com' : 'https://8589184.app.netsuite.com';
                    var urlNuevoRegistro = ambiente + '/app/accounting/transactions/vendbill.nl?id=' + idRegistro;

                    logRecord.setValue({
                        fieldId: 'custrecord_nch_factura_numero_gnre_cf',
                        value: resultado.tranid
                    });
                    logRecord.setValue({
                        fieldId: 'custrecord_nch_factura_creada_gnre_cf',
                        value: true
                    });
                    logRecord.setValue({
                        fieldId: 'custrecord_nch_url_arquivo_gnre_cf',
                        value: urlNuevoRegistro
                    });

                    var tex = ' this0' + '|' + idInternoLog + '|' + resultado.tranid + '|' + urlNuevoRegistro;
                    log.debug({ title: 'scheduled', details: tex });

                    logRecord.save();
                }

                return true;
            }
            catch (error) {
                // Envio de mail si sucede error.
                //sendemail(err + tex);
                log.debug({ title: 'Error scheduled', details: error + ' - ' + error.lineNumber });
                log.error(error.name);

                GuardaLog('Error scheduled', '', '', 'Error en método scheduled: ' + error + ' - ' + error.lineNumber);

                // Actualiza el log para informar error
                ActualizaLog(idInternoLog, error.message);

                return false;
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
        }

        function ActualizaLog(idInternoLog, mensaje) {
            // Actualiza el log para informar error
            var logRecord = record.load({
                type: 'customrecord_nch_log_gnre_crear_factura',
                id: idInternoLog
            }).setValue({
                fieldId: 'custrecord_nch_factura_numero_gnre_cf',
                value: mensaje
            }).setValue({
                fieldId: 'custrecord_nch_url_arquivo_gnre_cf',
                value: 'Error'
            }).save();
        }

        return {
            execute: scheduled
        };
    });