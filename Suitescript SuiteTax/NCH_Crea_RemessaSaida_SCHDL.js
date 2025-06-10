/** 
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *
 * Version    Date            Author           Remarks
 * 1.00       23 May 2025     Jaciel           Crear transacción Remessa de Saída a partir de ItemFulfillment
 */

define(['N/search', 'N/record', 'N/runtime', 'N/file', 'N/xml', 'N/format', 'N/redirect'],

    function (search, record, runtime, file, xml, format, redirect) {

        function scheduled(context) {
            var idPedido = runtime.getCurrentScript().getParameter({
                name: "custscript_nch_if_rs_idPedido"
            });
            var lineaJSON = runtime.getCurrentScript().getParameter({
                name: "custscript_nch_if_rs_lineaArt"
            });

            // Se convierte a array de nuevo
            var lineaArt = JSON.parse(lineaJSON);

            var idRegistro = 0;

            try {
                // var numeroFatura = ufFavorecida + parseInt(documentoOrigem) + prefijo.tranprefix + receita;
                var numeroFatura = 0;

                //Se traen los datos del pedido para crear la transacción NCH Busca Pedido para Remessa Saida
                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters:
                        [
                            ["type", "anyof", "SalesOrd"],
                            "AND",
                            ["internalidnumber", "equalto", idPedido],
                            "AND",
                            ["mainline", "is", "F"],
                            "AND",
                            ["taxline", "is", "F"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "entity"
                            }),
                            search.createColumn({
                                name: "projecttask"
                            }),
                            search.createColumn({
                                name: "custbody_brl_tran_l_transaction_nature"
                            }),
                            search.createColumn({
                                name: "subsidiary"
                            }),
                            search.createColumn({
                                name: "location"
                            }),
                            search.createColumn({
                                name: "tranid"
                            }),
                            search.createColumn({
                                name: "custbody_brl_tran_n_ship_info_gross_wt"
                            }),
                            search.createColumn({
                                name: "custbody_brl_tran_n_ship_info_net_wt"
                            })
                        ]
                });

                var cuantos = salesorderSearchObj.runPaged().count;
                log.debug("cuantos", cuantos);

                var cliente = 0, natureza = 0, ubicacion = 0, pBruto = 0, pLiquido = 0, cuenta = 0;
                var proyecto = '', tranIdPedido = '';

                salesorderSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    cliente = result.getValue({
                        name: 'entity'
                    });
                    proyecto = result.getValue({
                        name: 'projecttask'
                    });
                    natureza = result.getValue({
                        name: 'custbody_brl_tran_l_transaction_nature'
                    });
                    subsidiaria = result.getValue({
                        name: 'subsidiary'
                    });
                    ubicacion = result.getValue({
                        name: 'location'
                    });
                    tranIdPedido = result.getValue({
                        name: 'tranid'
                    });
                    pBruto = result.getValue({
                        name: 'custbody_brl_tran_n_ship_info_gross_wt'
                    });
                    pLiquido = result.getValue({
                        name: 'custbody_brl_tran_n_ship_info_net_wt'
                    });
                    // cuenta = result.getValue({
                    //     name: 'tranid'
                    // });

                    return true;
                });

                // Artículos del item fulfillment
                // El item se hereda de la ejecución de pedido de artículo
                var articulosObj = lineaArt;

                var tex = ' this1' + '|' + cliente + ubicacion + '|' + JSON.stringify(lineaArt) + '|' + JSON.stringify(lineaArt[0].detInv);
                log.debug({ title: 'scheduled', details: tex });

                var departamento = 3; // 000 Hoja de Balance
                var clase = 9; // Non-Classify
                var metodo = 4; // NCH Brazil E-Doc Sending Method
                var plantilla = 2; // E-Doc Brazil Template | NF-e Emissão

                //Se crea el registro Remessa Saída (outbound delivery)
                var objCreaRemessaSaida = record.create({
                    type: 'customsale_brl_outbound_delivery',
                    isDynamic: true
                });

                // objCreaRemessaSaida.setValue({
                //     fieldId: 'tranid',
                //     value: numeroFatura
                // });
                objCreaRemessaSaida.setValue({
                    fieldId: 'entity',
                    value: cliente
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'location',
                    value: ubicacion
                });
                // objCreaRemessaSaida.setValue({
                //     fieldId: 'trandate',
                //     value: sFechaFormato
                // });

                // Extras
                objCreaRemessaSaida.setValue({
                    fieldId: 'job',
                    value: proyecto
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'otherrefnum',
                    value: tranIdPedido
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'memo',
                    value: 'memoPrueba desde ItemFulfillment'
                });
                // objCreaRemessaSaida.setValue({
                //     fieldId: 'custbody_brl_tran_l_created_from',
                //     value: idItemFulfillment
                // });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custpage_brl_tran_l_transaction_nature',
                    value: natureza
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'department',
                    value: departamento
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'class',
                    value: clase
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_brl_tran_n_ship_info_gross_wt',
                    value: pBruto
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_brl_tran_n_ship_info_net_wt',
                    value: pLiquido
                });
                // objCreaRemessaSaida.setValue({
                //     fieldId: 'account',
                //     value: 1135
                // });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_psg_ei_sending_method',
                    value: metodo
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_psg_ei_template',
                    value: plantilla
                });

                // Línea de artículo
                for (var i = 0; i < lineaArt.length; i++) {
                    objCreaRemessaSaida.selectNewLine({
                        sublistId: 'item'
                    });

                    objCreaRemessaSaida.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: lineaArt[i].idA
                    });
                    objCreaRemessaSaida.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        value: lineaArt[i].des
                    });
                    objCreaRemessaSaida.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: lineaArt[i].can
                    });
                    objCreaRemessaSaida.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        value: lineaArt[i].mon
                    });
                    objCreaRemessaSaida.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ftebr_l_cfop_code',
                        value: lineaArt[i].cfo
                    });

                    // Ingresa al subregistro de Inventario
                    var inventarioSubrecord = objCreaRemessaSaida.getCurrentSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail'
                    });

                    if (inventarioSubrecord) {
                        for (var j = 0; j < lineaArt[i].detInv.length; j++) {
                            inventarioSubrecord.selectNewLine({
                                sublistId: 'inventoryassignment'
                            });

                            inventarioSubrecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                                value: lineaArt[i].detInv[j].lote
                                // value: '202505-1'
                            });

                            inventarioSubrecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                value: lineaArt[i].detInv[j].qua
                            });

                            inventarioSubrecord.commitLine({
                                sublistId: 'inventoryassignment'
                            });
                        }
                    }

                    objCreaRemessaSaida.commitLine({
                        sublistId: 'item'
                    });

                    /* objCreaRemessaSaida.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i,
                        value: lineaArt[i].idA
                    });
                    objCreaRemessaSaida.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: i,
                        value: lineaArt[i].des
                    });
                    objCreaRemessaSaida.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                        // value: lineaArt[i].can
                        value: 1
                    });
                    objCreaRemessaSaida.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i,
                        // value: lineaArt[i].pre
                        value: 100
                    });
                    objCreaRemessaSaida.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ftebr_l_cfop_code',
                        line: i,
                        // value: lineaArt[i].pre
                        value: 578
                    });

                    if (lineaArt[i].detInv.length > 0) {
                        var inventarioSubrecord = objCreaRemessaSaida.setSublistSubrecord({
                            sublistId: 'item',
                            fieldId: 'inventorydetail',
                            line: i
                        });

                        for (var j = 0; j < lineaArt[i].detInv.length; j++) {
                            inventarioSubrecord.setSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                                line: j,
                                value: lineaArt[i].detInv[j].lote
                                // value: '202505-1'
                            });

                            inventarioSubrecord.setSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                line: j,
                                value: lineaArt[i].detInv[j].qua
                            });
                        }
                    } */
                }

                idRegistro = objCreaRemessaSaida.save();

                if (idRegistro > 0) {
                    GuardaLog(idRegistro, '', numeroFatura, 'Entity: ' + cliente);

                    // Lo siguiente es para el caso de pantalla masiva
                    // // Actualiza el log para informar que se inicio el proceso
                    // var logRecord = record.load({
                    //     type: 'customrecord_nch_log_gnre_crear_remsai',
                    //     id: idInternoLog
                    // });

                    var resultado = search.lookupFields({
                        type: 'customsale_brl_outbound_delivery',
                        id: idRegistro,
                        columns: ['tranid']
                    });

                    var ambiente = (runtime.envType == 'SANDBOX') ? 'https://8589184-sb1.app.netsuite.com' : 'https://8589184.app.netsuite.com';
                    var urlNuevoRegistro = ambiente + '/app/accounting/transactions/cutrsale.nl?id=' + idRegistro + '&whence=&customtype=113';

                    // logRecord.setValue({
                    //     fieldId: 'custrecord_nch_factura_numero_remsai',
                    //     value: resultado.tranid
                    // });
                    // logRecord.setValue({
                    //     fieldId: 'custrecord_nch_factura_creada_remsai',
                    //     value: true
                    // });
                    // logRecord.setValue({
                    //     fieldId: 'custrecord_nch_url_arquivo_remsai',
                    //     value: urlNuevoRegistro
                    // });

                    var tex = ' this0' + '|' + 'idInternoLog' + '|' + resultado.tranid + '|' + urlNuevoRegistro;
                    log.debug({ title: 'scheduled', details: tex });

                    // logRecord.save();
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
                // ActualizaLog(idInternoLog, error.message);

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