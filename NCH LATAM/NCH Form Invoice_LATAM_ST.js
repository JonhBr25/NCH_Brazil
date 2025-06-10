/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 *  
 * Version    Date            Author    Remarks
 * 1.00       07 Oct 2024     Jaciel    Script de formulario para la creación de mensajes al salvar registro y en línea de item, se muestras en campos los resultados
 */

define(['N/ui/dialog', 'N/search'],
    function (dialog, search) {

        // Defines the validation function that is executed before a line is added to an inline editor sublist or editor sublist.
        function onValidateLine(context) {
            try {
                var currentRecord = context.currentRecord;
                var cantidadEmbalaje = 0;

                if (type = 'item') {
                    var itemId = currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item'
                    });
                    var clienteId = currentRecord.getValue({
                        fieldId: 'entity'
                    });

                    if (itemId != '') {
                        var mensajes = ValidaFiltrosMensaje(2, currentRecord, itemId, clienteId);

                        if (mensajes != '' || mensajes != null) {
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_nch_mensagens_fiscais_linha',
                                value: mensajes
                            });
                        }

                        // Lógica de cantidad embalaje
                        var cantidadEmbalajeItem = 0;
                        var objItemEmb = search.lookupFields({
                            type: 'item',
                            id: itemId,
                            columns: ['custitem_nch_embalaje_hasta_br']
                        });

                        cantidadEmbalajeItem = (objItemEmb.custitem_nch_embalaje_hasta_br == '') ? 0 : objItemEmb.custitem_nch_embalaje_hasta_br;

                        if (cantidadEmbalajeItem != 0) {
                            var cantidadEmbalaje = 0;
                            var cantidadLinea = currentRecord.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity'
                            });

                            // Cantidad en línea de item entre el NCH EMBALAJE ITEM, el resultado es la cantidad de embalaje requerida
                            cantidadEmbalaje = (cantidadLinea / cantidadEmbalajeItem);

                            // Si el resultado de la división es menor al mínimo de NCH EMBALAJE ITEM, se coloca ese mínimo
                            cantidadEmbalaje = (cantidadEmbalaje < 1) ? cantidadEmbalajeItem : Math.trunc(cantidadEmbalaje);

                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_nch_embalaje_hasta_br',
                                value: cantidadEmbalaje
                            });
                        }
                        else {
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_nch_embalaje_hasta_br',
                                value: 0
                            });
                        }
                    }
                }

                return true;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: '¡Error!',
                    message: 'Ocorreu um erro na linha do item: ' + error.lineNumber + '|' + itemId + ' - ' + String(error.message)
                });

                return false;
            }
        }

        function onSaveRecord(context) {
            try {
                var currentRecord = context.currentRecord;
                var cuantosItems = currentRecord.getLineCount({
                    sublistId: 'item'
                });
                var clienteId = currentRecord.getValue({
                    fieldId: 'entity'
                });
                var cantidadEmbalajeLinea = 0, cantidadEmbalajeItemTotal = 0;
                var mensajes = [];

                for (var i = 0; i < cuantosItems; i++) {
                    var itemId = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    // Si no aplica codigo enquadramento se coloca default 999
                    currentRecord.setValue({
                        fieldId: 'custbody_nch_codigo_enquadramento_ipi',
                        value: '999'
                    });

                    var mensajes = ValidaFiltrosMensaje(1, currentRecord, itemId, clienteId);

                    currentRecord.setValue({
                        fieldId: 'custbody_nch_dados_adicio_head',
                        value: mensajes.toString()
                    });
                }

                // Lógica de cantidad embalaje
                for (var z = 0; z < cuantosItems; z++) {
                    // Se suman las cantidades de las líneas de artículos
                    cantidadEmbalajeLinea = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_nch_embalaje_hasta_br',
                        line: z
                    });

                    if (cantidadEmbalajeLinea != 0) {
                        cantidadEmbalajeItemTotal += cantidadEmbalajeLinea;
                    }
                }

                // Se coloca el total de la suma de cantidades de embalaje en línea de artículos
                currentRecord.setValue({
                    fieldId: 'custbody_brl_tran_n_ship_info_qty',
                    value: cantidadEmbalajeItemTotal
                });

                return true;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: '¡Error!',
                    message: 'Ocorreu um erro ao tentar salvar a transação: ' + error.lineNumber + '|' + String(error.message)
                });

                return false;
            }
        }

        function ValidaFiltrosMensaje(ubicacionMensaje, currentRecord, itemId, clienteId) {
            try {
                var mensajesArray = [], impuestosArray = [];

                // NCH Posição da Mensagem Lista (tabla Netsuite)
                // Mensaje en item (2 Dados dos Produtos) o pie de factura (1 Dados Adicionais)

                // Datos Transacción
                var categoriaT = currentRecord.getValue({
                    fieldId: 'custpage_brl_tran_l_def_edoc_category'
                });
                var tipoTransaccion = currentRecord.type;
                if (tipoTransaccion == 'customsale_brl_outbound_delivery') {
                    categoriaT = '1,2';
                    // categoriaT = '1';
                }
                var naturalezaT = currentRecord.getValue({
                    fieldId: 'custbody_brl_tran_l_transaction_nature'
                });
                var finalidadT = currentRecord.getValue({
                    fieldId: 'custbody_nch_finalidad_br'
                });
                var cuantosImpuestosT = currentRecord.getLineCount({
                    sublistId: 'taxdetails'
                });

                // Impuestos en la transacción se guardan en array
                for (var j = 0; j < cuantosImpuestosT; j++) {
                    var codigoImpuestoT = currentRecord.getSublistValue({
                        sublistId: 'taxdetails',
                        fieldId: 'taxcode',
                        line: j
                    });

                    impuestosArray.push(codigoImpuestoT);
                }
                /*
                    PENDIENTE ALICUOTA
                 */

                // Datos item
                var objArticulo = search.lookupFields({
                    type: 'item',
                    id: itemId,
                    columns: [
                        'custitem_brl_l_item_origin', 'custitem_brl_l_cest_code', 'custitem_familia_3', 'custitem_familia_0',
                        'custitem_nch_codigo_sevicio_ncm', 'custitem_nch_codigo_base_reduzida', 'custitem_nch_tributa_ipi_53'
                    ]
                });
                var origenItemT = (objArticulo.custitem_brl_l_item_origin[0] === void undefined) ? '' : objArticulo.custitem_brl_l_item_origin[0].value;
                var cestItemT = (objArticulo.custitem_brl_l_cest_code[0] === void undefined) ? '' : objArticulo.custitem_brl_l_cest_code[0].text;
                var produtoItemT = (objArticulo.custitem_familia_3[0] === void undefined) ? '' : objArticulo.custitem_familia_3[0].value;
                var categoriaItemT = (objArticulo.custitem_familia_0[0] === void undefined) ? '' : objArticulo.custitem_familia_0[0].value;
                var ncmItemT = (objArticulo.custitem_nch_codigo_sevicio_ncm === void undefined) ? '' : objArticulo.custitem_nch_codigo_sevicio_ncm;
                var reduzidaItemT = (objArticulo.custitem_nch_codigo_base_reduzida[0] === void undefined) ? ''
                    : objArticulo.custitem_nch_codigo_base_reduzida[0].value;
                var tributaItemT = (objArticulo.custitem_nch_tributa_ipi_53[0] === void undefined) ? '' : objArticulo.custitem_nch_tributa_ipi_53[0].value;

                // Datos cliente
                var objCliente = search.lookupFields({
                    type: 'entity',
                    id: clienteId,
                    columns: [
                        'billstate', 'custentity_br_nao_contribu_icms', 'custentity_nch_code_cnae', 'custentity_nch_clasify_customer_reg',
                        'custentity_nch_incent_fiscai', 'billcity'
                    ]
                });
                var ufClienteT = (objCliente.billstate[0] === void undefined) ? '' : objCliente.billstate[0].value;
                var contribuyenteClienteT = (objCliente.custentity_br_nao_contribu_icms[0] === void undefined) ? ''
                    : objCliente.custentity_br_nao_contribu_icms[0].value;
                var cnaeClienteT = (objCliente.custentity_nch_code_cnae === void undefined) ? ''
                    : objCliente.custentity_nch_code_cnae;
                var clasificacionClienteT = (objCliente.custentity_nch_clasify_customer_reg[0] === void undefined) ? ''
                    : objCliente.custentity_nch_clasify_customer_reg[0].value;
                var incentivosClienteT = objCliente.custentity_nch_incent_fiscai[0].text;
                // Se agrega ciudad para Enquadramento IPI
                var ciudadClienteT = (objCliente.billcity === void undefined) ? '' : objCliente.billcity + ' - ' + ufClienteT;

                // Para línea (Dados dos produtos)
                // if (ubicacionMensaje == 2) {
                // Si hay UF se pasa su filtro
                var pasarFiltros = (ufClienteT == '')
                    ? [
                        ["custrecord_nch_regmsg_position", "anyof", ubicacionMensaje],
                        "AND",
                        ["custrecord_nch_regmsg_category_de", "anyof", categoriaT],
                        "AND",
                        ["custrecord_nch_mensagens_activo", "is", "T"],
                        "AND",
                        ["custrecord_nch_regmsg_uf", "anyof", "@NONE@"],    // Trae los que NO tienen UF
                    ]
                    : [
                        ["custrecord_nch_regmsg_position", "anyof", ubicacionMensaje],
                        "AND",
                        ["custrecord_nch_regmsg_category_de", "anyof", categoriaT],
                        "AND",
                        ["custrecord_nch_mensagens_activo", "is", "T"],
                        "AND",
                        ["custrecord_nch_regmsg_uf", "noneof", "@NONE@"], // Trae los que SI tienen UF
                    ];

                var customrecord_nch_regras_mensagensSearchObj = search.create({
                    type: "customrecord_nch_regras_mensagens",
                    filters:
                        [
                            ["custrecord_nch_regmsg_position", "anyof", ubicacionMensaje],
                            "AND",
                            ["custrecord_nch_regmsg_category_de", "anyof", categoriaT],
                            "AND",
                            ["custrecord_nch_mensagens_activo", "is", "T"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "custrecord_nch_regmsg_codemsg"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_descrip"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_uf"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_cidade"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_origen"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_segmento_cest"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_contricsm"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_natoper"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_finalidad"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_cod_tax"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_taxrate"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_cod_cnae"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_clasificacion"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_type_prod"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_cat_nch"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_incentivos_fiscais_zf"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_mensaje_cliente"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_cod_ser_ncm"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_base_reducida"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_tributa_ipi_53"
                            }),
                            search.createColumn({
                                name: "custrecord_nch_regmsg_cod_enq"
                            })
                        ]
                });

                var searchResultCount = customrecord_nch_regras_mensagensSearchObj.runPaged().count;
                var resultSet = customrecord_nch_regras_mensagensSearchObj.run();
                var resultados = resultSet.getRange({ start: 0, end: 1000 });

                // Se traen todos los datos correspondientes por categoría (produtos o adicionais)
                for (var x = 0; x < searchResultCount; x++) {
                    var mensajeAplica = true;

                    var codigoMensagemR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_codemsg'
                    });
                    var mensajeR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_descrip'
                    });
                    var ufR = resultados[x].getText({
                        name: 'custrecord_nch_regmsg_uf'
                    });
                    var ciudadR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_cidade'
                    });
                    var origemR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_origen'
                    });
                    var cestR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_segmento_cest'
                    });
                    var contribuyenteR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_contricsm'
                    });
                    var naturalezaR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_natoper'
                    });
                    var finalidadR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_finalidad'
                    });
                    var codigoImpuestoR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_cod_tax'
                    });
                    var alicuotaR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_taxrate'
                    });
                    var cnaeR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_cod_cnae'
                    });
                    var clasificacionR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_clasificacion'
                    });
                    var tipoProdutoR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_type_prod'
                    });
                    var categoriaProductoR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_cat_nch'
                    });
                    var incentivosR = resultados[x].getValue({
                        name: 'custrecord_nch_incentivos_fiscais_zf'
                    });
                    var mensajeClienteR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_mensaje_cliente'
                    });
                    var ncmR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_cod_ser_ncm'
                    });
                    var reduzidaR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_base_reducida'
                    });
                    var tributaR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_tributa_ipi_53'
                    });
                    var codigoEnquadramentoR = resultados[x].getValue({
                        name: 'custrecord_nch_regmsg_cod_enq'
                    });

                    if (codigoMensagemR == '182' || codigoMensagemR == '2') {
                        var uno = "";
                    }

                    // Sufijo: R = Resultado (table mensajes), T = Transacción (netsuite)
                    if (ufR == '') {
                        // En la tabla de mensajes el valor es vacío, entonces no importa el filtro de la transacción avanza
                        // Si encuentra dato entra al else y valida se cumpla condición, si no hay igualdad entre la tabla y la transacción no aplica mensaje
                    } else {
                        var ufR_Corto = ufR.substring(0, 2);
                        var entroValidacion = false;

                        // Valida si es diferente a...
                        if (ufR_Corto == '<>' || ufR_Corto == '&l') {
                            ufRDiferente = ufR.substring(ufR.length - 2);

                            // Si son diferentes el de la tabla vs la transacción pasa aplica mensaje, si son iguales a SP (en la tabla un caso es es <>SP) no aplica
                            if (ufRDiferente != ufClienteT) {
                            } else {
                                mensajeAplica = false;
                            }

                            entroValidacion = true;
                        }

                        // Validación normal, si no son iguales no aplica mensaje
                        if (!entroValidacion) {
                            if (ufR != ufClienteT) {
                                // Hay que salir de la vuelta del ciclo porque no cumple igualdad, el renglón de la tabla de mensajes no aplica
                                // continue;
                                // Se estaba usando continue pero en momentos se cicla infinitamente, se cambia por bandera
                                mensajeAplica = false;
                            }
                        }
                    }
                    if (ciudadR == '') { } else { if (ciudadR != ciudadClienteT) { mensajeAplica = false; } }
                    if (origemR == '') { } else {
                        var origemRVarios = origemR.split(",");
                        var aplicaOri = false;

                        // Si son iguales el array de la tabla vs la transacción aplica mensaje
                        for (var m = 0; m < origemRVarios.length; m++) {
                            if (origemRVarios[m] == origenItemT) {
                                aplicaOri = true;

                                break;
                            }
                        }

                        // Si no hay coincidencia en ccontribuyente sale
                        if (!aplicaOri) {
                            mensajeAplica = false;
                        }
                    }
                    if (cestR == '') {
                    } else {
                        var cestR_Corto = cestR.substring(0, 2);
                        var entroValidacion = false;

                        // Valida si es diferente a...
                        if (cestR_Corto == '<>' || cestR_Corto == '&l') {
                            cestRDiferente = cestR.substring(cestR.length - 2);

                            // Si son diferentes el de la tabla vs la transacción pasa aplica mensaje, si son iguales a 20 (en la tabla un caso es es <>20) no aplica
                            if (cestRDiferente != cestItemT.substring(0, 2)) {
                            } else {
                                mensajeAplica = false;
                            }

                            entroValidacion = true;
                        }

                        // Valida si es más de un cest en el campo
                        if (cestR_Corto == '||') {
                            var cestRVarios = cestR.split(",");
                            var aplica = false;

                            for (var k = 0; k < cestRVarios.length; k++) {
                                if (!aplica) {
                                    // Si son iguales el array de la tabla vs la transacción aplica mensaje
                                    if (cestRVarios[k] == cestItemT.substring(0, 2)) {
                                        aplica = true;
                                    } else {
                                        aplica = false;
                                    }
                                }
                            }

                            // Si no hay coincidencias no aplica mensaje
                            if (!aplica) {
                                mensajeAplica = false;
                            }

                            entroValidacion = true;
                        }

                        // Validación normal, si no son iguales no aplica mensaje
                        if (!entroValidacion) {
                            if (cestR.substring(0, 2) != cestItemT.substring(0, 2)) {
                                mensajeAplica = false;
                            }
                        }
                    }
                    if (contribuyenteR == '') { } else {
                        var contribuyenteRVarios = contribuyenteR.split(",");
                        var aplicaCon = false;

                        // Si son iguales el array de la tabla vs la transacción aplica mensaje
                        for (var h = 0; h < contribuyenteRVarios.length; h++) {
                            if (contribuyenteRVarios[h] == contribuyenteClienteT) {
                                aplicaCon = true;

                                break;
                            }
                        }

                        // Si no hay coincidencia en ccontribuyente sale
                        if (!aplicaCon) {
                            mensajeAplica = false;
                        }
                    }
                    if (naturalezaR == '') { } else { if (naturalezaR != naturalezaT) { mensajeAplica = false; } }
                    if (finalidadR == '') { } else { if (finalidadR != finalidadT) { mensajeAplica = false; } }
                    if (codigoImpuestoR == '') { }
                    else {
                        var cumpleImpuesto = false;

                        for (var y = 0; y < impuestosArray.length; y++) {
                            if (codigoImpuestoR == impuestosArray[y]) {
                                cumpleImpuesto = true;

                                break;
                            }
                        }

                        // Si no hay coincidencia en código de impuesto sale
                        if (!cumpleImpuesto) {
                            mensajeAplica = false;
                        }
                    }
                    // if (alicuotaR == '') { } else { if (alicuotaR != ) { continue; } }
                    if (cnaeR == '') { } else { if (cnaeR != cnaeClienteT) { mensajeAplica = false; } }
                    if (clasificacionR == '') { } else { if (clasificacionR != clasificacionClienteT) { mensajeAplica = false; } }
                    if (tipoProdutoR == '') { } else { if (tipoProdutoR != produtoItemT) { mensajeAplica = false; } }
                    if (categoriaProductoR == '') { } else { if (categoriaProductoR != categoriaItemT) { mensajeAplica = false; } }
                    if (incentivosR == '') { } else {
                        if (incentivosClienteT == 'N/A') {
                            mensajeAplica = false;
                        } else {
                            var incentivosRVarios = incentivosR.split(",");
                            var aplicaInc = false;

                            for (var l = 0; l < incentivosRVarios.length; l++) {
                                // Si son iguales el array de la tabla vs la transacción aplica mensaje
                                if (incentivosRVarios[l] == incentivosClienteT) {
                                    aplicaInc = true;

                                    break;
                                }

                                // Si no hay coincidencias no aplica mensaje
                                if (!aplicaInc) {
                                    mensajeAplica = false;
                                }
                            }
                        }
                    }
                    // Tabla clientes mensajes
                    // Falso es como si fuera vacío
                    if (mensajeClienteR == false) { }
                    else {
                        // Se valida en tabla NCH Mensagens Cliente BR
                        var hayVigencia = ValidaMensagensCliente(clienteId);

                        if (hayVigencia == false) { mensajeAplica = false; }
                    }
                    if (ncmR == '') { } else { if (ncmR != ncmItemT) { mensajeAplica = false; } }
                    if (reduzidaR == '') { } else { if (reduzidaR != reduzidaItemT) { mensajeAplica = false; } }
                    if (tributaR == '') { } else { if (tributaR != tributaItemT) { mensajeAplica = false; } }

                    // Se guarda el código de enquadramento en Netsuite
                    if (codigoEnquadramentoR != '' && mensajeAplica) {
                        currentRecord.setValue({
                            fieldId: 'custbody_nch_codigo_enquadramento_ipi',
                            value: codigoEnquadramentoR.substring(0, 3)
                        });
                    }

                    // Si todo el renglón de la tabla coincide en blancos y filtros se almacena el mensaje
                    // var mensajeAplica = (q == searchResultCount - 1) ? mensajeR : mensajeR + '|';
                    if (mensajeAplica) {
                        mensajesArray.push(mensajeR);
                    }
                };
                // }

                return mensajesArray;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Error!',
                    message: 'Ocorreu um erro em ValidaFiltrosMensaje: ' + error.lineNumber + '|CodMen' + codigoMensagemR + '|' + String(error.message)
                });

                mensajesArray.push(error.message);

                return mensajesArray;
            }
        }

        function ValidaMensagensCliente(clienteId) {
            try {
                var aplicaMensajeCliente = false;
                var fechaHoy = new Date();
                var diaHoy = fechaHoy.getDate();
                var mesHoy = fechaHoy.getMonth() + 1; // enero = 0
                var anoHoy = fechaHoy.getFullYear();
                var fechaFormatoHoy = diaHoy + '/' + ('00' + mesHoy).slice(-2) + '/' + anoHoy;

                var objMenCli = search.load({
                    id: 'customsearch_msg_cliente_br'
                });

                var filterArray = [];
                filterArray.push(['custrecord_nch_msg_cli', 'is', clienteId]);
                filterArray.push('and');
                filterArray.push([
                    ["custrecord_nch_msg_dataini", "onorbefore", fechaFormatoHoy],
                    "AND",
                    ["custrecord_nch_msg_datafin", "onorafter", fechaFormatoHoy]
                ]);

                objMenCli.filterExpression = filterArray;

                var arr_MenCli = objMenCli.run().getRange({
                    start: 0,
                    end: 1
                });

                if (arr_MenCli.length > 0) {
                    aplicaMensajeCliente = true;
                }

                return aplicaMensajeCliente;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: '¡Error!',
                    message: 'Ocorreu um erro em ValidaMensagensCliente: ' + error.lineNumber + '|' + String(error.message)
                });

                return aplicaMensajeCliente;
            }
        }

        return {
            validateLine: onValidateLine,
            saveRecord: onSaveRecord
        };
    });