/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 *  
 * Version    Date            Author    Remarks
 * 1.00       07 Oct 2024     Jaciel    Script de formulario para la creación de mensajes al salvar registro y en línea de item, se muestras en campos los resultados
 * 1.00       13 Feb 2025     Jaciel    Solo se mete la lógica de cantidad de embalaje
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

                        if (itemId != '') {
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
                var cantidadEmbalajeLinea = 0, cantidadEmbalajeItemTotal = 0;

                // Lógica de cantidad embalaje
                for (z = 0; z < cuantosItems; z++) {
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

        return {
            validateLine: onValidateLine,
            saveRecord: onSaveRecord
        };
    });