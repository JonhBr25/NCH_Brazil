/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *
 * Version    Date            Author           Remarks
 * 1.00       23 May 2025     Jaciel           Crea transacción outbound delivery (Remessa de Saída) desde Ejecución de pedido de artículo
 */

define(['N/ui/dialog', 'N/record', 'N/search', 'N/runtime', 'N/redirect', 'N/url', 'N/https'],
    function (dialog, record, search, runtime, redirect, url, https) {

        function afterSubmit(context) {
            try {
                var nuevoIdInterno = context.newRecord.id;
                var modo = context.type;

                log.debug('modo|executionContext', context.newRecord.getValue('custbody_nch_idnuevo_rm_desde_if') + '|' + modo + '|' + runtime.executionContext);

                // Solo en la creación se dispara, se deja en modo EDIT para que funcione cuando se crea manualmente (UI) y masivamente (SUITELET)
                // if (modo == context.UserEventType.CREATE || modo == context.UserEventType.COPY) {
                if (modo == context.UserEventType.CREATE || modo == context.UserEventType.EDIT || modo == context.UserEventType.COPY) {
                    // if (runtime.executionContext === 'USERINTERFACE') {
                    // Se debe cumplir que sea execution SUITELET y el registro nuevo (remessa saída) no exista
                    if (runtime.executionContext === 'SUITELET' && context.newRecord.getValue('custbody_nch_idnuevo_rm_desde_if') == '') {
                        var tipoTransaccion = context.newRecord.getValue({
                            fieldId: 'custbody_nch_natope_trans_netsuite'
                        });

                        // Si es tipo Outbound Delivery va a crear el registro
                        if (tipoTransaccion == 1) {
                            var registroCreado = record.load({
                                type: record.Type.ITEM_FULFILLMENT,
                                id: nuevoIdInterno,
                                isDynamic: false // isDynamic false es mejor para lectura de datos en UE Scripts
                            });

                            var creadoDesde = registroCreado.getValue({
                                fieldId: 'createdfrom'
                            });

                            // Línea de artículos
                            var cuantos = registroCreado.getLineCount({
                                sublistId: 'item'
                            });

                            var articulos = [];

                            for (var i = 0; i < cuantos; i++) {
                                var articulosObj = {};

                                var itemId = registroCreado.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    line: i
                                });
                                var quantity = registroCreado.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    line: i
                                });
                                var description = registroCreado.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemdescription',
                                    line: i
                                });
                                var itemFxAmount = registroCreado.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemfxamount',
                                    line: i
                                });
                                var itemUnitPrice = registroCreado.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'itemunitprice',
                                    line: i
                                });
                                var cfopLinea = registroCreado.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_ftebr_l_cfop_code',
                                    line: i
                                });
                                var pesoBrutoL = registroCreado.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_nch_peso_bruto_br',
                                    line: i
                                });
                                var pesoNetoL = registroCreado.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_nch_peso_neto_br',
                                    line: i
                                });

                                var detalleInventario = registroCreado.getSublistSubrecord({
                                    sublistId: 'item',
                                    fieldId: 'inventorydetail',
                                    line: i
                                });

                                // Si hay detalle de inventario entra
                                if (detalleInventario) {
                                    var sublistaInvCuantos = detalleInventario.getLineCount({
                                        sublistId: 'inventoryassignment'
                                    });

                                    if (sublistaInvCuantos == 0) {
                                        dialog.alert({
                                            title: 'Aviso!',
                                            message: 'Você deve configurar o detalhe do inventário da linha ' + parseInt(i) + 1
                                        })

                                        return false;
                                    } else {
                                        var detInvDatos = [];

                                        for (var j = 0; j < sublistaInvCuantos; j++) {
                                            var lote = detalleInventario.getSublistValue({
                                                sublistId: 'inventoryassignment',
                                                fieldId: 'issueinventorynumber',
                                                line: j
                                            });

                                            var bin = detalleInventario.getSublistValue({
                                                sublistId: 'inventoryassignment',
                                                fieldId: 'binnumber',
                                                line: j
                                            });

                                            var cantidad = detalleInventario.getSublistValue({
                                                sublistId: 'inventoryassignment',
                                                fieldId: 'quantity',
                                                line: j
                                            });

                                            detInvDatos.push({
                                                lote: lote,
                                                qua: cantidad
                                            });
                                        }
                                    }
                                }

                                // Item Fulfillment
                                articulosObj.idA = itemId;
                                articulosObj.can = quantity;
                                articulosObj.des = description;
                                articulosObj.mon = itemFxAmount;    // Monto total
                                articulosObj.pre = itemUnitPrice;   // Precio Unitario
                                articulosObj.cfo = cfopLinea;
                                articulosObj.bru = pesoBrutoL;
                                articulosObj.net = pesoNetoL;
                                articulosObj.detInv = detInvDatos;

                                articulos.push(articulosObj);
                            }

                            // Parámetros a pasar a los siguientes scripts
                            var parametros = {
                                metodoAccion: 'creaRemSaiDesdeEjecucion',
                                cabecera: {
                                    idPedido: creadoDesde
                                },
                                linea: articulos
                            }

                            var idRegistroRS = CreaRemessaSaida(nuevoIdInterno, parametros);
                            // idRegistroRS = 586377;
                            // idRegistroRS = '4';

                            if (idRegistroRS > 0) {
                                var ambiente = (runtime.envType == 'SANDBOX') ? 'https://8589184-sb1.app.netsuite.com' : 'https://8589184.app.netsuite.com';
                                var urlNuevoRegistro = ambiente + '/app/accounting/transactions/cutrsale.nl?id=' + idRegistroRS + '&whence=&customtype=113';

                                record.submitFields({
                                    type: record.Type.ITEM_FULFILLMENT,
                                    id: nuevoIdInterno,
                                    values: {
                                        'custbody_nch_idnuevo_rm_desde_if': idRegistroRS
                                    },
                                    options: {
                                        enableSourcing: false,
                                        ignoreMandatoryFields: true
                                    }
                                });

                                var tex = ' this0' + '|' + nuevoIdInterno + '|' + idRegistroRS + '|' + urlNuevoRegistro;
                                log.debug({ title: 'user_event', details: tex });

                            }
                        }
                    }
                }

                return true;
            } catch (error) {
                log.debug({
                    title: 'Error',
                    details: 'aftersubmit: ' + error.lineNumber + '|' + '' + ' - ' + String(error.message)
                });

                return false;
            }
        }

        function CreaRemessaSaida(nuevoIdInterno, datosTransaccion) {

            var idPedido = datosTransaccion.cabecera.idPedido;
            var lineaArt = datosTransaccion.linea;

            var idRegistroRS = 0;

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
                                name: "memo"
                            }),
                            search.createColumn({
                                name: "custbody_brl_tran_l_def_edoc_category"
                            }),
                            search.createColumn({
                                name: "custbody_brl_tran_l_transaction_nature"
                            }),
                            search.createColumn({
                                name: "custbody_nch_finalidad_br"
                            }),
                            search.createColumn({
                                name: "custbody_nch_natope_trans_netsuite"
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

                var cliente = 0, natureza = 0, ubicacion = 0, pBruto = 0, pLiquido = 0, finalidad = 0, tipoTran = 0, categoria = 0;
                var proyecto = '', tranIdPedido = '', notas = '';

                salesorderSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    cliente = result.getValue({
                        name: 'entity'
                    });
                    proyecto = result.getValue({
                        name: 'projecttask'
                    });
                    notas = result.getValue({
                        name: 'memo'
                    });
                    categoria = result.getValue({
                        name: 'custbody_brl_tran_l_def_edoc_category'
                    });
                    natureza = result.getValue({
                        name: 'custbody_brl_tran_l_transaction_nature'
                    });
                    finalidad = result.getValue({
                        name: 'custbody_nch_finalidad_br'
                    });
                    tipoTran = result.getValue({
                        name: 'custbody_nch_finalidad_br'
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
                    // cuenta = result.getValue({
                    //     name: 'tranid'
                    // });

                    return true;
                });

                var tex = ' this1' + '|' + nuevoIdInterno.id + '|' + categoria + '|' + nuevoIdInterno;
                log.debug({ title: 'user_event', details: tex });

                var formulario = 451; // NCH Remessa de Saída
                var departamento = 3; // 000 Hoja de Balance
                var clase = 9; // Non-Classify
                var metodo = 4; // NCH Brazil E-Doc Sending Method
                var plantilla = 2; // E-Doc Brazil Template | NF-e Emissão
                var statusDocEle = 1; // Para geração
                var serieDocEle = 1; // Por el momento es la única serie

                //Se crea el registro Remessa Saída (outbound delivery)
                var objCreaRemessaSaida = record.create({
                    type: 'customsale_brl_outbound_delivery',
                    isDynamic: true
                });

                objCreaRemessaSaida.setValue({
                    fieldId: 'customform',
                    value: formulario
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
                    fieldId: 'memo',
                    value: notas
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'otherrefnum',
                    value: tranIdPedido
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_brl_tran_l_created_from',
                    value: nuevoIdInterno
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_brl_tran_l_def_edoc_category',
                    value: categoria
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_brl_tran_l_transaction_nature',
                    value: natureza
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_nch_finalidad_br',
                    value: finalidad
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_nch_natope_trans_netsuite',
                    value: tipoTran
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
                    fieldId: 'custbody_brl_tran_t_edoc_series',
                    value: serieDocEle
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_psg_ei_sending_method',
                    value: metodo
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_psg_ei_template',
                    value: plantilla
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_psg_ei_status',
                    value: statusDocEle
                });
                objCreaRemessaSaida.setValue({
                    fieldId: 'custbody_brl_tran_f_disable_inventory',
                    value: true
                });

                // Artículos del item fulfillment
                // El item se hereda de la ejecución de pedido de artículo
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
                    objCreaRemessaSaida.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_nch_peso_bruto_br',
                        value: lineaArt[i].bru
                    });
                    objCreaRemessaSaida.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_nch_peso_neto_br',
                        value: lineaArt[i].net
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
                }

                idRegistroRS = objCreaRemessaSaida.save();

                if (idRegistroRS > 0) {
                    GuardaLog(idRegistroRS, '', numeroFatura, 'Entity: ' + cliente);
                }

                return idRegistroRS;
            }
            catch (error) {
                // Envio de mail si sucede error.
                //sendemail(err + tex);
                log.debug({ title: 'Error CreaRemessaSaida', details: error + ' - ' + error.lineNumber });
                log.error(error.name);

                // GuardaLog('Error user_event', '', '', 'Error en método CreaRemessaSaida: ' + error + ' - ' + error.lineNumber);

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
            afterSubmit: afterSubmit
        };
    }); 