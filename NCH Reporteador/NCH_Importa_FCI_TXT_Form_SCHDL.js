/** 
 *@NApiVersion 2.x 
 *@NScriptType ScheduledScript
 *
 * Version    Date            Author           Remarks
 * 1.00       23 Abril 2025   Joao Tadeu        Importar os FCI do Governo
 */

define(['N/search', 'N/record', 'N/runtime','N/currentRecord', 'N/file', 'N/format'],

    function (search, record, runtime,currentRecord, file, format) {

        // Control de Memoria
        var intMaxReg = 1000;
        var intMinReg = 0;
        var gravarRegistro = false;
        /*** Schedule ***/
       // var sessionObj = runtime.getCurrentSession();

        function scheduled(context) {

            var id_FCI_txt = runtime.getCurrentScript().getParameter("custscript_nch_fci_txt_arq_id");


            try { 

                //var articulos = JSON.parse(id_FCI_txt);
                log.debug({ title: 'scheduled', details: "Valor registro:"});

                log.debug({ title: 'scheduled', details: "Valor registro:" + JSON.parse(id_FCI_txt)});

                var recordType = 'customrecord_nch_importar_fci_dados';

                var recordIdDesejado = JSON.parse(id_FCI_txt);
                var searchResult = search.create({
                    type: recordType, 
                    filters: [
                            search.createFilter({
                                name: 'internalid',
                                operator: search.Operator.IS,
                                values: recordIdDesejado
                            })
                        ],
                    columns: ['custrecord_nch_importar_fci_dados_regist'] 
                }).run().getRange({ start: 0, end: 1});


                if (searchResult.length > 0) {
                    var result = searchResult[0];
                    var recordId = result.id; // Este será 16
                    var articulosJSON = result.getValue({
                        name: 'custrecord_nch_importar_fci_dados_regist' // Substitua pelo ID do campo dos dados JSON
                    });

                    var articulos_new =  articulos_new = JSON.stringify( InserirItens(JSON.parse(articulosJSON)));
                    
                    if(gravarRegistro)
                    {
                        log.debug({ title: 'scheduled', details: "Entrou entrou entreou:"});
                        articulos_new = JSON.stringify( Salvar(JSON.parse(articulosJSON)));
                    }


                    // Carrega o registro em modo de edição
                    var recordParaEditar = record.load({
                        type: recordType,
                        id: recordIdDesejado,
                        isDynamic: true // Recomendado para melhor manipulação dos campos
                    });
                    
                    recordParaEditar.setValue({
                        fieldId: 'custrecord_nch_importar_fci_dados_regist',
                        value: articulos_new 
                    });
                    var idDoRegistroSalvo = recordParaEditar.save();

                    log.debug({ title: 'scheduled', details: "Resgatado:" + idDoRegistroSalvo});

                }
                



            }
            catch (error) {


            }

        }


        function Salvar(articulos) {
               
            try {

                if(articulos != null)
                {
                    if (articulos.length > 0) {
                        log.debug({ title: 'scheduled', details: "Segunda parte:"});
                        for (var j = 0; j < articulos.length; j++) {
                            try {
                                const element = articulos[j];

                                var itemID = articulos[j].regFisFedPro;
                                var vFCI = articulos[j]. vFCI;

                                var valor_saida_mercadoria = articulos[j].quantidade;
                                var valor_conteudo_importado = articulos[j].valorUnitario;
                                var percentual_conteudo_importado = articulos[j].percValor;

                                var origemGoverno = 0;
                                if (parseFloat(articulos[j].percValor) <= 40) {
                                    origemGoverno = 5;
                                } else if (parseFloat(articulos[j].percValor) > 40 && parseFloat(articulos[j].percValor) <= 70) {
                                    origemGoverno = 3;
                                } else if (parseFloat(articulos[j].percValor) > 70) {
                                    origemGoverno = 8;
                                }

                                //Localiza o ID do CustomList
                                var customListSearch = search.create({
                                    type: 'customlist',
                                    filters: [
                                        search.createFilter({
                                            name: 'scriptid',
                                            operator: search.Operator.IS,
                                            values: 'customlist_brl_item_origin'
                                        })
                                    ],
                                    columns: [
                                        search.createColumn({
                                            name: 'internalid'
                                        })
                                    ]
                                });

                                var searchResult = customListSearch.run().getRange({ start: 0, end: 1 }); // Correção: usando getRange

                                if (searchResult && searchResult.length > 0) {

                                    //pega o ID para achar a Origem na lista
                                    var internalId = searchResult[0].getValue({
                                        name: 'internalid'
                                    });

                                    var customListRecord = record.load({
                                        type: 'customlist',
                                    // scriptid: 'customlist_brl_item_origin'
                                        id: internalId  //1214
                                    });

                                    var lineCount = customListRecord.getLineCount({
                                        sublistId: 'customvalue'
                                    });
                        
                                    var ID_origem_lista = 0;
                        
                                    for (var i = 0; i < lineCount; i++) {

                                        var origem = customListRecord.getSublistValue({
                                            sublistId: 'customvalue',
                                            fieldId: 'abbreviation',
                                            line: i
                                        });
                                        var origemID= customListRecord.getSublistValue({
                                            sublistId: 'customvalue',
                                            fieldId: 'valueid',
                                            line: i
                                        });
                                        if(origemGoverno.toString() === origem.toString())
                                        {
                                            ID_origem_lista =origemID;
                                            break;
                                        }

                                    }

                                   // Salvar_FCI(itemID,vFCI);
                                   var teste =  Alterar_FCI(itemID, vFCI) ;
                                   if(teste)
                                   {
                                        Salvar_FCI(itemID,vFCI,valor_saida_mercadoria,valor_conteudo_importado,percentual_conteudo_importado);
                                        var nomeTypeConsulta = 'lotnumberedassemblyitem';
                                        AtualizarOrigemItem(nomeTypeConsulta,itemID,ID_origem_lista);
                                        articulos[j].registrosStatus = "FCI salvo com sucesso";
                                   }
                                   else
                                   {
                                        articulos[j].registrosStatus = "FCI já existe - ABORTADO";
                                   }

                                    
                                }
                                } catch (error) {
                                   // alert('ERRO:'+ error);
                                    return false;
                                }

                                
                        }
                    }

                }


                log.debug({ title: 'scheduled', details: "Salvar com successo"});

                return articulos;
            } catch (error) {
                //alert('ERRO:'+ error);
                                log.debug({ title: 'scheduled', details: "ERRO! Não finalizou o processo"});

                return false;
            }
                
        }

        function InserirItens(articulos) {
               
            try {

                if(articulos != null)
                {
                    if (articulos.length > 0) {
                        log.debug({ title: 'scheduled', details: "Segunda parte:"});
                        for (var j = 0; j < articulos.length; j++) {
                            try {
                                    const element = articulos[j];

                                    log.debug({ title: 'scheduled', details: "ID:"+articulos[j].regFisFedPro});

                                    if(articulos[j].regFisFedPro === 0)
                                    {
                                        var itemYcfop = BuscaCadastroItens(articulos[j].codigo);
                                        if(itemYcfop.identificadorInternoDoItem > 0)
                                        {
                                            articulos[j].regFisFedPro   = itemYcfop.identificadorInternoDoItem;
                                            articulos[j].registrosStatus = "Importar FCI";
                                        }
                                        else
                                        {
                                            articulos[j].registrosStatus = "Item não encontrado";
                                        }
                                    }
                                    else
                                    {
                                        gravarRegistro = true;
                                    }
                                    
                                
                                } catch (error) {
                                   // alert('ERRO:'+ error);
                                    return false;
                                }

                                
                        }
                    }

                }


                log.debug({ title: 'scheduled', details: "Salvar com successo"});

                return articulos;
            } catch (error) {
                //alert('ERRO:'+ error);
                                log.debug({ title: 'scheduled', details: "ERRO! Não finalizou o processo"});

                return false;
            }
                
        }

        function BuscaCadastroItens(codigo) {

            var nomeTypeConsulta = 'lotnumberedassemblyitem';
            var cadastroObj = {};


            try {
                    var objBuscaCadastro = search.create({
                        type: nomeTypeConsulta,
                        columns: ['internalid','parent'],
                        filters: [
                            ['externalid', search.Operator.IS, codigo ] //'21518']
                        ]
                    });

                    var searchResultCount = objBuscaCadastro.runPaged().count;
                    log.debug({ title: 'scheduled', details: "Search"+searchResultCount});
                    if(searchResultCount > 0)
                    {
                        objBuscaCadastro.run().each(function (objResultRes) {
                            //Se obtiene el objeto del id interno item y cfop en la tabla cadastro
                            cadastroObj.identificadorInternoDoItem = objResultRes.getValue({
                                name: 'internalid'
                            });
                            cadastroObj.codigo = objResultRes.getValue({
                                name: 'parent'
                            });
                        });
                    }
                    else
                    {
                        cadastroObj.identificadorInternoDoItem = 0;
                    }

            } catch (error) {
                 cadastroObj.identificadorInternoDoItem = 0;
                // alert('ERRO:'+ error);
                 return false;
            }
            return cadastroObj;
        }


        function AtualizarOrigemItem(nomeTypeConsulta,itemId, idOrigem) {
            try {
                var itemRecord = record.load({
                    type: nomeTypeConsulta,
                    id: itemId,
                    isDynamic: true
                });
    
                itemRecord.setValue({
                    fieldId: 'custitem_brl_l_item_origin',
                    value: idOrigem
                });
    
                itemRecord.save();

            } catch (error) {
                log.debug({ title: 'Error alterar Origem', details: error + ' - ' + error.lineNumber });
            }
        }

        function Alterar_FCI(itemId, codigo_FCI) {

            var fciSemCadastro = true;
            try { 

                var cargaRegistroFciSearch =  search.create({
                        type: 'customrecord_nscs_fciinformation',
                        filters: [
                            ['custrecord_nscs_fcii_item', 'is', itemId]
                           // ,'AND',
                           // ['custrecord_nscs_fcii_enddate', 'isnotempty', null] 
                        ],
                        columns: [
                            'id',
                            'custrecord_nscs_fcii_item',
                            'custrecord_nscs_fcii_number',
                            'custrecord_nscs_fcii_startdate',
                            'custrecord_nscs_fcii_enddate'
                        ]
                    });


                // Executa a pesquisa e obtém os resultados
                var resultSetRegistroFci = cargaRegistroFciSearch.run();
                var pagedResults = resultSetRegistroFci.getRange({
                    start: 0,
                    end: 1000
                });


    
                if (pagedResults.length > 0) {
                    for (var i = 0; i < pagedResults.length; i++) {
                        var searchResult = pagedResults[i];
                        var idRegFCIprod = searchResult.id; // O ID do registro é diretamente acessível

                        var numeroFCI = searchResult.getValue({ name: 'custrecord_nscs_fcii_number'});
                        var dataFinal = searchResult.getValue({ name: 'custrecord_nscs_fcii_enddate'});


                        if(codigo_FCI != numeroFCI)
                        {
                            var nomeTypeConsulta = 'customrecord_nscs_fciinformation';

                            try {
                                if(dataFinal == null || dataFinal == "")
                                {

                                    var itemRecord = record.load({
                                            type: nomeTypeConsulta ,
                                            id: idRegFCIprod,
                                            isDynamic: true
                                        });
                            
                                        itemRecord.setValue({
                                            fieldId: 'custrecord_nscs_fcii_enddate',
                                            value: new Date() //'2025-04-12') 
                                        });
                            
                                    var recordId =  itemRecord.save();
                                }

                            } catch (e) {

                                log.error({ title: 'Erro ao processar registro FCI ID: ' + idRegFCIprod, details: e });
                            }
                        }
                        else
                        {
                            fciSemCadastro = false;
                        }


                    }
                }

            } catch (error) {
                fciSemCadastro = false;
                log.debug({ title: 'Error alterar FCI', details: error + ' - ' + error.lineNumber });
            }
            return fciSemCadastro;
        }
        function Salvar_FCI(itemId, codigo_FCI,valor_saida_mercadoria,valor_conteudo_importado,percentual_conteudo_importado) {
            

            log.debug({ title: 'Salvar FCI', details: 'ID' + itemId + " | " + codigo_FCI});


            var nomeTypeConsulta = 'customrecord_nscs_fciinformation';
            
            try {

                var novoRegistro = record.create({
                    type: nomeTypeConsulta ,
                    isDynamic: true
                  });

                  
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nscs_fcii_item', 
                    value: itemId 
                  });
            
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nscs_fcii_number', 
                    value: codigo_FCI 
                  });
                  
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nscs_fcii_startdate',
                    value: new Date()//'2025-04-12') 
                  });
                  
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nch_val_saida_merca', 
                    value: valor_saida_mercadoria
                  });
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nch_parce_importacion', 
                    value: valor_conteudo_importado 
                  });
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nch_conten_importa', 
                    value: percentual_conteudo_importado
                  });
            
                  var idNovoRegistro = novoRegistro.save();         


            } catch (error) {

                log.debug({ title: 'Salvar FCI', details: 'Error: ' + error});
              //  log.debug({ title: 'Error GuardaArticulos', details: error + ' - ' + error.lineNumber });
               // GuardaLog('GuardaArticulos', '', '', 'Error: ' + error);
              //  throw new Error(error);

               // return false;
            }
               
               
        }


        //NCH Log Importacion XML Compra
        function GuardaLog(idNombre, proveedor, notas, error) {
            var registroLog = record.create({
                type: 'customrecord_nch_importa_factura_xml_br'
            })

            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_idnombre', value: idNombre });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_proveedor', value: proveedor });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_notas', value: notas });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_error', value: error });

           registroLog.save();
        }

        return {
            execute: scheduled
        };
    });