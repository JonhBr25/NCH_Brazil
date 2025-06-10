/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 *  
 * Version    Date            Author        Remarks
 * 1.00       02 Abril 2025     Joao Tadeu    Script de formulario para alterar a origem dos itens
 */

 define(['N/ui/dialog', 'N/search', 'N/record'],
    function (dialog, search, record) {

        function atualizarOrigemItem(nomeTypeConsulta,itemId, novoValor) {
            try {

                var itemRecord = record.load({
                    type: nomeTypeConsulta,
                    id: itemId,
                    isDynamic: true
                });
    
                itemRecord.setValue({
                    fieldId: 'custitem_brl_l_item_origin',
                    value: novoValor
                });
    
                itemRecord.save();

            } catch (error) {
                    dialog.alert({
                        title: '¡ERRO Atualização!',
                        message: 'itemId|origemResultado|ERRO ' + itemId+ "|"+origemResultado + " | -" + error

                });
            }
        }

        function onSaveRecord(context) {
            try {
                var currentRecord = context.currentRecord;

                var itemCount = currentRecord.getLineCount({ sublistId: 'item' });
               
                for (var i = 0; i < itemCount; i++) {
                    var itemId = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });


                    var origemCode = currentRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_ftebr_t_origin_code', 
                        line: i
                    });

                    var objitem = search.lookupFields({
                        type: 'ITEM',
                        id: itemId,
                        columns: ['itemid', 'type']
                    });

                    var itemid          = objitem.itemid;
                    var itemtype        = objitem.type[0].value;

                    var nomeTypeConsulta = '';

                    if(itemtype == 'Assembly')
                    {
                        nomeTypeConsulta = 'lotnumberedassemblyitem';
                    }

                    if(itemtype == 'InvtPart')
                    {
                        nomeTypeConsulta = 'inventoryitem';
                    }

                    if(origemCode != ''){


                        var pesquisaItem = search.create({
                            type: nomeTypeConsulta, 
                            filters: [
                                ['internalid', search.Operator.IS, itemId ] //'21518']
                            ],
                            columns: ['custitem_nch_codigo_sevicio_ncm','custitem_familia_4']
                        });
            
                        var resulItem = pesquisaItem.run().getRange({ start: 0, end: 10 }); // Obtenha os primeiros 10 resultados

/*
                        if(resulItem = null)
                        {

                            var pesquisaItem_assembly = search.create({
                                type: 'lotnumberedassemblyitem', 
                                filters: [
                                    ['internalid', search.Operator.IS, itemId ] //'21518']
                                ],
                                columns: ['custitem_nch_codigo_sevicio_ncm','custitem_familia_4']
                            });

                            resulItem = pesquisaItem_assembly.run().getRange({ start: 0, end: 10 }); // Obtenha os primeiros 10 resultados

                      //  }*/

            
                        var custitem_nch_codigo_sevicio_ncm = null;
                        var custitem_familia_4 = null;

                        // Itere pelos resultados e acesse os dados
                        resulItem.forEach(function(resultadoItem) {
                            custitem_nch_codigo_sevicio_ncm = resultadoItem.getValue({ name: 'custitem_nch_codigo_sevicio_ncm' });
                            custitem_familia_4              = resultadoItem.getValue({ name: 'custitem_familia_4' });
                        });


                        var pesquisaNCM = search.create({
                            type: 'customrecord_fte_itemcode',
                            filters: [
                                ['custrecord_fte_itemcode_t_code', search.Operator.IS, custitem_nch_codigo_sevicio_ncm]
                            ],
                            columns: ['custrecord_nch_camex_item']
                        });
            
                        var resulNCM = pesquisaNCM.run().getRange({ start: 0, end: 10 }); // Obtenha os primeiros 10 resultados
            
                        var custrecord_nch_camex_item = null;
                        // Itere pelos resultados e acesse os dados
                        resulNCM.forEach(function(resultadoNCM) {
                            custrecord_nch_camex_item = resultadoNCM.getValue({ name: 'custrecord_nch_camex_item' });

                        });

                        if(custitem_familia_4 != 5)
                        {
                            var pesquisa = search.create({
                                type: 'CUSTOMRECORD_NCH_REGRA_ORIG_RECEIPT', 
                                filters: [
                                    ['custrecord_nch_origin_vendor', search.Operator.IS, origemCode],
                                    'AND',
                                    ['custrecord_nch_origen_base', search.Operator.IS, 'local'], 
                                    'AND',
                                    ['custrecord_nch_item_camex', search.Operator.IS, custrecord_nch_camex_item] 
                                ],
                                columns: ['custrecord_nch_origin_vendor', 'custrecord_nch_origen_base', 'custrecord_nch_item_camex', 'custrecord_nch_result_origen']
                            });
                
                            var resultados = pesquisa.run().getRange({ start: 0, end: 10 }); // Obtenha os primeiros 10 resultados
                
                            // Itere pelos resultados e acesse os dados
                            resultados.forEach(function(resultado) {
                                var origemFornecedor = resultado.getValue({ name: 'custrecord_nch_origin_vendor' });
                                var origemBase = resultado.getValue({ name: 'custrecord_nch_origen_base' });
                                var itemCamex = resultado.getValue({ name: 'custrecord_nch_item_camex' });
                                var origemResultado = resultado.getValue({ name: 'custrecord_nch_result_origen' });               

                                atualizarOrigemItem(nomeTypeConsulta,itemId,origemResultado);

                            });
                        }
                    }
                    else
                    {
                        dialog.alert({
                            title: '¡ERRO Origem!',
                            message: 'Origem Não Informada' 
                            });
                        return false;
                    }

                }

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
            saveRecord: onSaveRecord
        };
    });