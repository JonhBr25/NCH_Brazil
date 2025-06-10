/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *
 * Version    Date            Author           Remarks
 * 1.00       23 May 2025     Jaciel           Crea transacción outbound delivery (Remessa de Saída) desde Ejecución de pedido de artículo
 */

define(['N/ui/dialog', 'N/url', 'N/https', 'N/currentRecord'],
    function (dialog, url, https, registroActual) {

        var modo = '';

        function onPageInit(context) {
            modo = context.mode;
        }

        function onSaveRecord(context) {
            try {
                var currentRecord = context.currentRecord;

                var tipoTransaccion = currentRecord.getValue({
                    fieldId: 'custbody_nch_natope_trans_netsuite'
                });

                // Solo en la creación se dispara
                // if (modo == 'create' || modo == 'copy') {
                if (modo == 'create' || modo == 'edit' || modo == 'copy') {
                    // Si es tipo Outbound Delivery va a crear el registro
                    if (tipoTransaccion == 1) {
                        // var suiteletUrl = url.resolveScript({
                        //     scriptId: 'customscript_nch_iteful_remsai_stlt',
                        //     deploymentId: 'customdeploy_nch_iteful_remsai_stlt'
                        // });

                        // var creadoDesde = currentRecord.getValue({
                        //     fieldId: 'createdfrom'
                        // });

                        // // Línea de artículos
                        // var cuantos = currentRecord.getLineCount({
                        //     sublistId: 'item'
                        // });

                        // var articulos = [];

                        // for (var i = 0; i < cuantos; i++) {
                        //     var articulosObj = {};

                        //     var itemId = currentRecord.getSublistValue({
                        //         sublistId: 'item',
                        //         fieldId: 'item',
                        //         line: i
                        //     });
                        //     var quantity = currentRecord.getSublistValue({
                        //         sublistId: 'item',
                        //         fieldId: 'quantity',
                        //         line: i
                        //     });
                        //     var description = currentRecord.getSublistValue({
                        //         sublistId: 'item',
                        //         fieldId: 'itemdescription',
                        //         line: i
                        //     });
                        //     var itemFxAmount = currentRecord.getSublistValue({
                        //         sublistId: 'item',
                        //         fieldId: 'itemfxamount',
                        //         line: i
                        //     });
                        //     var itemUnitPrice = currentRecord.getSublistValue({
                        //         sublistId: 'item',
                        //         fieldId: 'itemunitprice',
                        //         line: i
                        //     });
                        //     var cfopLinea = currentRecord.getSublistValue({
                        //         sublistId: 'item',
                        //         fieldId: 'custcol_ftebr_l_cfop_code',
                        //         line: i
                        //     });

                        //     currentRecord.selectLine({
                        //         sublistId: 'item',
                        //         line: i
                        //     });

                        //     var detalleInventario = currentRecord.getCurrentSublistSubrecord({
                        //         sublistId: 'item',
                        //         fieldId: 'inventorydetail'
                        //     });

                        //     // Si hay detalle de inventario entra
                        //     if (detalleInventario) {
                        //         var sublistaInvCuantos = detalleInventario.getLineCount({
                        //             sublistId: 'inventoryassignment'
                        //         });

                        //         if (sublistaInvCuantos == 0) {
                        //             dialog.alert({
                        //                 title: 'Aviso!',
                        //                 message: 'Você deve configurar o detalhe do inventário da linha ' + parseInt(i) + 1
                        //             })

                        //             return false;
                        //         } else {
                        //             var detInvDatos = [];

                        //             for (var j = 0; j < sublistaInvCuantos; j++) {
                        //                 var lote = detalleInventario.getSublistValue({
                        //                     sublistId: 'inventoryassignment',
                        //                     fieldId: 'issueinventorynumber',
                        //                     line: j
                        //                 });

                        //                 var bin = detalleInventario.getSublistValue({
                        //                     sublistId: 'inventoryassignment',
                        //                     fieldId: 'binnumber',
                        //                     line: j
                        //                 });

                        //                 var cantidad = detalleInventario.getSublistValue({
                        //                     sublistId: 'inventoryassignment',
                        //                     fieldId: 'quantity',
                        //                     line: j
                        //                 });

                        //                 detInvDatos.push({
                        //                     lote: lote,
                        //                     qua: cantidad
                        //                 });
                        //             }
                        //         }
                        //     }

                        //     // Item Fulfillment
                        //     articulosObj.idA = itemId;
                        //     articulosObj.can = quantity;
                        //     articulosObj.des = description;
                        //     articulosObj.mon = itemFxAmount;    // Monto total
                        //     articulosObj.pre = itemUnitPrice;   // Precio Unitario
                        //     articulosObj.cfo = cfopLinea;
                        //     articulosObj.detInv = detInvDatos;

                        //     articulos.push(articulosObj);
                        // }

                        // // Parámetros a pasar a los siguientes scripts
                        // var parametros = {
                        //     metodoAccion: 'creaRemSaiDesdeEjecucion',
                        //     cabecera: {
                        //         idPedido: creadoDesde
                        //     },
                        //     linea: articulos
                        // }

                        var idInterno = currentRecord.getValue({
                            fieldId: 'internalid'
                        });
                        // var currentRec = registroActual.get();
                        dialog.alert({
                            title: 'ID INTERNO',
                            // message: idInterno + '|' + currentRec.id + '|' + registroActual.get() + '|' + currentRecord.id
                            message: idInterno + '|'
                        });

                        //                         var respuesta = https.post({
                        //                             url: suiteletUrl,
                        //                             body: JSON.stringify(parametros)
                        //                         });
                        // // REVISANDO COMO REGRESAR RESPUESTA
                        //                         dialog.alert({
                        //                             title: 'respuesta',
                        //                             message: respuesta + '|' + https.respuesta + '|' + respuesta.resultado
                        //                         });
                    }
                }

                // return true;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Erro!',
                    message: 'onSaveRecord: ' + error.lineNumber + '|' + '' + ' - ' + String(error.message)
                });

                return false;
            }
        }

        return {
            saveRecord: onSaveRecord,
            pageInit: onPageInit
        };
    }); 