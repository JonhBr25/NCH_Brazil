/**
* @NApiVersion 2.x
* @NScriptType Suitelet
 *
 * Version    Date            Author           Remarks
 * 1.00       16/04/2025      Joao Tadeu       Importar o FCI do arquivo retornado do Governo BR
 */

define(['N/ui/serverWidget', 'N/record', 'N/file', 'N/search', 'N/task', 'N/redirect', 'N/runtime', 'N/url', 'N/ui/message'],
    function (serverWidget, record, file, search, task, redirect, runtime, url, message) {

        var sessionObj = null;
        var teste = "";

        function onRequest(context) {
            try {
                sessionObj = runtime.getCurrentSession();

                //Método GET
                if (context.request.method == 'GET') {
                    var form = serverWidget.createForm({
                        title: 'Importação do arquivo FCI do Governo'
                    });
                    
                    //Cliente relacionado
                    var ambiente = runtime.envType;
                    form.clientScriptFileId = (ambiente == 'SANDBOX') ? 183153 : 183153; //10409 : 10409;
                    //form.clientScriptModulePath = 'SuiteScripts/NCH Developer/NCH SuiteScript Brasil/NCH_ImportaFacturaXML_Form_CLNT.js';

                    /* ****** Grupo para Campos assigment ****** */
                    var groupA = form.addFieldGroup({
                        id: 'custpage_filtros1',
                        label: 'Importar arquivo FCI do Governo'
                    });

                    var xmlEtiqueta = form.addField({
                        id: 'custpage_label0',
                        type: serverWidget.FieldType.LABEL,
                        label: ' ',
                        container: 'custpage_filtros1'
                    });
                    form.addField({
                        id: 'custpage_label1',
                        type: serverWidget.FieldType.LABEL,
                        label: ' ',
                        container: 'custpage_filtros1'
                    });
                    /* ****** Grupo para Campos assigment ****** */

                    //Nota: el tipo FILE no se acepta en FieldGroup, por lo tanto se crean los dos tipo LABEL (custpage_label0, custpage_label1)
                    //para crear espacio y acomodar el control tipo FILE, de otro modo queda "volando" sin poderse acomodar en el formulario
                    var importarXML = form.addField({
                        id: 'custpage_txt_fci_gov',
                        type: serverWidget.FieldType.FILE,
                        label: 'IMPORTAR ARQUIVO TXT'
                    });

                    if (context.request.parameters.xml) {
                        xmlEtiqueta.defaultValue = 'context.request';
                        log.debug({ title: 'suitelet_main', details: 'Sí entra' });
                        context.request.parameters.xml = null;
                    }

                    var botonPost = form.addSubmitButton({
                        id: 'custpage_paso1',
                        label: 'Enviar'
                        //label: 'Carregar XML'
                    });


                    //var contenidoXML = context.request.files.custpage_txt_fci_gov.getContents();
                    //var xmlCampoNombre = sessionObj.get({ name: "xmlNombre" });

                    // Mensaje para el cliente
                    var myInlineHtml = form.addField({
                        id: 'custpage_mensaje',
                        label: ' ',
                        type: serverWidget.FieldType.INLINEHTML
                    })
                    myInlineHtml.updateLayoutType({
                        layoutType: serverWidget.FieldLayoutType.OUTSIDEBELOW
                    });

                    var strhtml = "<html><body>";
                    strhtml += "<style> .tab { display: inline-block; margin-left: 900px; } </style>" +
                        "<table border='0' cellspacing='0' cellpadding='0' align='center'>" +
                        "<br /><br /><br /><br />" +
                        "<tr>" +
                        "<td>" +
                        "<p style=\"color: gray; font-size: 9pt; margin-top: 10px; padding: 5px; border-top: 1pt solid silver\">" +
                        "Importante: Selecione o arquivo em formato txt retornado pelo governo." +
                        "<span class='tab'></span></p>" +
                        "</td>" +
                        "</tr>" +
                        "</table>" +
                        "</body></html>";
                    myInlineHtml.defaultValue = strhtml;

                    form.addTab({
                        id: 'custpage_maintab',
                        label: 'Tab'
                    });

                    //Tabla de artículos
                    var sublistaArticulos = form.addSublist({
                        id: 'custpage_sublist1',
                        type: serverWidget.SublistType.LIST,
                        label: 'Cadastro dos FCI dos Itens',
                        container: 'custpage_maintab'
                    });

                    //Columnas
                    var articuloNetsuite = sublistaArticulos.addField({
                        id: 'custpage_sub_fld1',
                        type: serverWidget.FieldType.SELECT,
                        label: 'ITEM'
                        , source: "item"
                    });
                    articuloNetsuite.isMandatory = true;

                    sublistaArticulos.addField({
                        id: 'custpage_sub_fld2',
                        type: serverWidget.FieldType.TEXT,
                        label: 'CÓDIGO'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    sublistaArticulos.addField({
                        id: 'custpage_sub_fld3',
                        type: serverWidget.FieldType.TEXT,
                        label: 'DESCRIÇÃO DO ITEM'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    sublistaArticulos.addField({
                        id: 'custpage_sub_fld4',
                        type: serverWidget.FieldType.TEXT,
                        label: 'NCM'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    sublistaArticulos.addField({
                        id: 'custpage_sub_fld5',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Valor Item'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    sublistaArticulos.addField({
                        id: 'custpage_sub_fld6',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Valor Importado'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    sublistaArticulos.addField({
                        id: 'custpage_sub_fld7',
                        type: serverWidget.FieldType.TEXT,
                        label: '% Importado'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    sublistaArticulos.addField({
                        id: 'custpage_sub_fld8',
                        type: serverWidget.FieldType.TEXT,
                        label: 'FCI'//,
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
               
                    sublistaArticulos.addField({
                        id: 'custpage_sub_fld9',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Status'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
               
                    //LimpiaSession(sessionObj);

                    var tieneXML = sessionObj.get({
                        name: "id_FCI_txt"
                    });


                   // log.debug({ title: 'Teste da primeira tela', details: 'Conteudo' + tieneXML});

                    if (tieneXML) {

                        var btnSalvar = form.addButton({
                            id: 'custpage_salvar',
                            label: 'Salvar',
                            functionName: "Salvar()"
                        });
                        var btnCancelar = form.addButton({
                            id: 'custpage_botoncancelar',
                            label: 'Cancelar',
                            functionName: "Cancelar()"
                        });

                        if (context.request.parameters.custscript_cancelarboton === 'true') {
                            LimpiaSession(sessionObj)

                            context.response.writePage(form);

                            return false;
                        }

                        //Si validaciones tiene error no avanza al siguiente paso
                        var valida = sessionObj.get({
                            name: "valida"
                        });

                        if (valida != '') {
                            // Message object as parameter 
                            var messageObj = message.create({
                                type: message.Type.ERROR,
                                message: valida
                            });

                            form.addPageInitMessage({
                                message: messageObj
                            });

                            LimpiaSession(sessionObj);

                            context.response.writePage(form);

                            return false;
                        }
                        

                        //Los artículos se obtienen del primer POST
                        var articulos = JSON.parse(sessionObj.get({
                            name: "articulosTXT"
                        }));

                        if(articulos != null)
                        {

                            //Llena la tabla de artículos del formulario
                            if (articulos.length > 0) {
                                for (var j = 0; j < articulos.length; j++) {
                                    const element = articulos[j];

                                   // var tex = ' this1' + '|' + articulos + '|' + articulos[j].descricaoDoItem + '|' + articulos[j].codigo;

                                    /*
                                    itemYcfop = BuscaCadastroItens(articulos[j].codigo);
                                                                    //Si existen los datos en la tabla Cadastro se insertan
                                if (Object.keys(itemYcfop).length > 0) {
                                    
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld1',
                                        line: j,
                                        value: itemYcfop.identificadorInternoDoItem
                                    });

                                    log.debug({ title: 'Carregando campos', details: 'ID'+ itemYcfop.identificadorInternoDoItem + " - "+articulos[j].regFisFedPro});
                                }
                                */

                               // Salvar_FCI(itemYcfop.identificadorInternoDoItem, articulos[j].vFCI);
                                    
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld1',
                                        line: j,
                                        value: articulos[j].regFisFedPro
                                    });

                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld2',
                                        line: j,
                                        value: articulos[j].codigo
                                    });
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld3',
                                        line: j,
                                        value: articulos[j].descricaoDoItem
                                    });
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld4',
                                        line: j,
                                        value: articulos[j].tipoDeUnidadeDeMedida
                                    });
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld5',
                                        line: j,
                                        value: articulos[j].quantidade
                                    });
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld6',
                                        line: j,
                                        value: articulos[j].valorUnitario
                                    });
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld7',
                                        line: j,
                                        value: articulos[j].valor
                                    });
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld8',
                                        line: j,
                                        value: articulos[j].vFCI
                                    });
                                    
                                    sublistaArticulos.setSublistValue({
                                        id: 'custpage_sub_fld9',
                                        line: j,
                                        value: articulos[j].registrosStatus
                                    });
                                    
                                }
                               // log.debug({ title: 'suitelet_main', details: tex });
                                // Message object as parameter 
                                var messageObj = message.create({
                                    type: message.Type.INFORMATION,
                                    message: 'Importar o registros do FCI gerado pelo Governo.',
                                    duration: 10000
                                });

                                form.addPageInitMessage({
                                    message: messageObj
                                });

                                //Todo bien va a paso o post 2 para ir a scheduled
                                //sessionObj.set({ name: "paso", value: '2' });
                            }
                        }
                    }
                    else {
                        // Message object as parameter 
                        var messageObj = message.create({
                            type: message.Type.INFORMATION,
                            message: 'Anexe o arquivo no formato txt que o governo gerou e clique em Enviar.',
                            duration: 10000
                        });

                        form.addPageInitMessage({
                            message: messageObj
                        });
                    }
                    /* ****** Grupo para Campos review ****** */

                    // Crea el formulario
                    context.response.writePage(form);
                }
                else {  //Método POST
                    //Valida el paso en el que se encuentra contando la sublista de artículos
                    log.debug({ title: 'teste', details: "teste" });
                    var cuantosArticulos = context.request.getLineCount({
                        group: 'custpage_sublist1'
                    });
                    
                    if (cuantosArticulos <= 0 && context.request.files.custpage_txt_fci_gov != null) {

                        sessionObj.set({ name: "paso", value: 1 });

                        //Guarda archivo XML
                        var nombreArchivo = context.request.files.custpage_txt_fci_gov.name;
                        var archivoTXT = context.request.files.custpage_txt_fci_gov.getContents();
                        var archivoTipo = context.request.files.custpage_txt_fci_gov.fileType;



                        var idArchivo = AdcionarArquivo(nombreArchivo, archivoTXT);
                        //idXML.defaultValue = idArchivo.toString();

                        log.debug({ title: 'Teste de ler arquivo', details: 'idArchivo:'+idArchivo});

                        if (idArchivo == '0') {
                            throw new Error(idArchivo + '|' + nombreArchivo);
                            //valida = idArchivo + '|' + nombreArchivo; //Error al guardar
                        }
                        else {
                            sessionObj.set({
                                name: "id_FCI_txt",
                                value: idArchivo
                            });
                        }
                        sessionObj.set({
                            name: "valida",
                            value: ''
                        });
                        //Validaciones varias
                        var valida = Validaciones(archivoTXT, archivoTipo);


                        //Si hay error en validación, coloca el error en el paso actual, en caso contrario avanza
                        if (valida != '') {
                            sessionObj.set({
                                name: "valida",
                                value: valida
                            });
                        }
                        else {
                            log.debug({ title: 'Teste de ler arquivo', details: 'testando'+ valida});
                            var articulos = LerConteudoTXT(archivoTXT);

                            //Se incluyen en sesión los artículos para cargar en la tabla en el segundo método GET
                            sessionObj.set({
                                name: "articulosTXT",
                                value: JSON.stringify(articulos)
                            });


                            var id_FCI_txt = sessionObj.get({
                                name: "id_FCI_txt"
                            });
                            var parametros = {
                                custscript_nch_fci_txt_arq_id: id_FCI_txt
                            };
                            log.debug({ title: 'teste 2', details: 'mensajeError : '+id_FCI_txt});
                            //Ejecución de script SCheduled
                            var status = task.create({
                                taskType: task.TaskType.SCHEDULED_SCRIPT,
                                scriptId: 'customscript_nch_importa_fci_txt_schd',
                                deploymentId: 'customdeploy_nch_importa_fci_txt_schd',
                                params: parametros
                            });
    
                            var scriptTaskId = status.submit();
                            var resultado = task.checkStatus(scriptTaskId);
    
                            var entraCiclo = true;
    
                            // Se busca que el script programado termine para poder mostrar el registro recién creado
                            while (entraCiclo == true) {
                                resultado = task.checkStatus(scriptTaskId);
    
                                if (resultado.status == 'COMPLETE') {
                                    entraCiclo = false;
                                    log.debug({ title: 'Primeiro', details: "Completo"});
                                }
    
                                if (resultado.status == 'FAILED') {
                                    entraCiclo = false;
                                    log.debug({ title: 'Primeiro', details: 'FAILED'});
    
                                   // return false;
                                }
                            }

                        }

                        // Redireccion el script, vuelve a llamar al SuiteLet actual
                        redirect.toSuitelet({
                            scriptId: 'customscript_nch_importa_fci_txt',
                            deploymentId: 'customdeploy_nch_importa_fci_txt_gov'
                        });
                    }
                    else {  
                        
                        
                        log.debug({ title: 'Outro trecho do codigo', details: 'Segunda parte do codigo'});
                        //Alterar_FCI(29,'');

                        //Ya hay artículos en la sublista, se guarda en Cadastro de itens y se crea la fatura
                        sessionObj.set({
                            name: "paso",
                            value: 2
                        });


                        //Guarda los artículos no registrados en Cadastro de itens
                       // GuardaArticulos(context);

                        //Va a guardar a Scheduled
                        var objParametros = context.request.parameters;
                        log.debug({ title: 'vamos la', details: context.request.parameters});

                        var id_FCI_txt = sessionObj.get({
                            name: "id_FCI_txt"
                        });


                        var parametros = {
                            custscript_nch_fci_txt_arq_id: id_FCI_txt
                        };
                        log.debug({ title: 'teste 2', details: 'mensajeError 2'+id_FCI_txt});
                        //Ejecución de script SCheduled
                        var status = task.create({
                            taskType: task.TaskType.SCHEDULED_SCRIPT,
                            scriptId: 'customscript_nch_importa_fci_txt_schd',
                            deploymentId: 'customdeploy_nch_importa_fci_txt_schd',
                            params: parametros
                        });

                        var scriptTaskId = status.submit();
                        var resultado = task.checkStatus(scriptTaskId);

                        var entraCiclo = true;

                        // Se busca que el script programado termine para poder mostrar el registro recién creado
                        while (entraCiclo == true) {
                            resultado = task.checkStatus(scriptTaskId);

                            if (resultado.status == 'COMPLETE') {
                                entraCiclo = false;
                                log.debug({ title: 'Preparando para salvar', details: "Completo"});
                            }

                            if (resultado.status == 'FAILED') {
                                entraCiclo = false;

                                log.debug({ title: 'Preparando para salvar', details: "FAILED"});
                            }
                        }

                        redirect.toSuitelet({
                            scriptId: 'customscript_nch_importa_fci_txt',
                            deploymentId: 'customdeploy_nch_importa_fci_txt_gov'
                        });

                    }
                }
            } catch (error) {
                log.debug({ title: 'ERRO', details: 'ERRO:'+  error + ' - ' + error.lineNumber});

                redirect.toSuitelet({
                    scriptId: 'customscript_nch_importa_fci_txt',
                    deploymentId: 'customdeploy_nch_importa_fci_txt_gov'
                });
               // var mensajeError = 'Error en método onRequest: ' + error + ' - ' + error.lineNumber
               // log.debug({ title: 'Error suitelet_main', details: mensajeError });
               // GuardaLog('onRequest', '', '', mensajeError);
               // throw mensajeError;

                //assistant.sendRedirect(context.response);
            }
        }

        function Validaciones(archivoXML, archivoTipo) {
            try {
                var valida = '';

                //Valida existan artículos en el archivo XML
                var cuantosArticulos = LerConteudoTXT(archivoXML);

                if (cuantosArticulos.length == 0) {
                    valida = 'Nenhum item encontrado. Favor verificar o TXT informado.<br/>'
                        + 'Clique em Cancelar e carregue um arquivo TXT correto.=> '+teste +" Arquivo   ---"  +archivoXML;

                    return valida;
                }
                return valida;
            } catch (error) {
                valida = error + ' - ' + error.lineNumber;
               // log.debug({ title: 'Error Validaciones', details: error + ' - ' + error.lineNumber });
               // GuardaLog('Validaciones', '', '', error + ' - ' + error.lineNumber);

                return valida;
            }
        }

        function AdcionarArquivo(ArquivoNome, arquivoTXT) {
            try {


                var ambiente = runtime.envType;
                var folderNumero = (ambiente == 'SANDBOX') ? 3245 : 3245;

                var archivoObj = file.create({
                    name: ArquivoNome,
                    fileType: file.Type.PLAINTEXT,
                    contents: arquivoTXT,
                    folder: folderNumero    
                });
                var idArchivo = archivoObj.save();

                return idArchivo;
            }
            catch (error) {
                log.debug({ title: 'Error AdcionarArquivo', details: error + ' - ' + error.lineNumber });
                GuardaLog('AdcionarArquivo', '', '', 'Error ao adicionar o arquivo txt no diretorio: ' + error);

                return '0';
            }
        }


        function LerConteudoTXT(arquivoTXT) {

            var registrosFCI = [];

            try {

                var linhas = arquivoTXT.split('\n'); 

                for (var i = 0; i < linhas.length; i++) {
                    var campos = linhas[i].split('|'); 
                    if (campos.length > 4) { 
                        if(campos[0] === '5020'){


                            itemYcfop = BuscaCadastroItens(campos[3]);

                            var origemTemp;
                            if (parseFloat(campos[8]) <= 40) {
                                origemTemp = 5;
                            } else if (parseFloat(campos[8]) > 40 && parseFloat(campos[8]) <= 70) {
                                origemTemp = 3;
                            } else if (parseFloat(campos[8]) > 70) {
                                origemTemp = 8;
                            }
                            
                            registrosFCI.push({
                                regFisFedPro: itemYcfop.identificadorInternoDoItem,
                                codigo: campos[3],
                                descricaoDoItem: campos[1],
                                tipoDeUnidadeDeMedida: campos[2],
                                quantidade: campos[6],
                                valorUnitario: campos[7],
                                valor: campos[8],
                                vFCI: campos[9],
                                registrosStatus: "Processando"
                                //origemItem: origemTemp
                            });

                        }
                    }
                }
            }
            catch (error) {
               // log.debug({ title: 'Error AdcionarArquivo', details: error + ' - ' + error.lineNumber });
               // GuardaLog('AdcionarArquivo', '', '', 'Error ao adicionar o arquivo txt no diretorio: ' + error);

                return '0';
            }
            
            return registrosFCI;
        }

        function BuscaCadastroItens(codigo) {

            var nomeTypeConsulta = 'lotnumberedassemblyitem';
            var cadastroObj = {};

            var objBuscaCadastro = search.create({
                type: nomeTypeConsulta,
                columns: ['internalid','parent'],
                filters: [
                    ['externalid', search.Operator.IS, codigo ] //'21518']
                ]
            });

            var searchResultCount = objBuscaCadastro.runPaged().count;

            objBuscaCadastro.run().each(function (objResultRes) {
                //Se obtiene el objeto del id interno item y cfop en la tabla cadastro
                cadastroObj.identificadorInternoDoItem = objResultRes.getValue({
                    name: 'internalid'
                });
                cadastroObj.codigo = objResultRes.getValue({
                    name: 'parent'
                });
            });
            return cadastroObj;
        }

        /**
         * Guarda los artículos de la sublista del formulario en la tabla de Netsuite cadastro de itens
         * 
         * @param {object} context Parámetro context
         */
        function GuardaArticulos(context) {
            
           
        }

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
                log.debug({ title: 'Error alterar Origem', details: error + ' - ' + error.lineNumber });
            }
        }

        function Alterar_FCI(itemId, codigo_FCI) {
            try { 

                // Carrega a pesquisa salva
                var cargaRegistroFciSearch = search.load({
                    id: 'customsearch_nch_registro_fci'
                });

                // Adiciona filtros à pesquisa
                cargaRegistroFciSearch.filters.push(search.createFilter({
                    name: 'custrecord_nscs_fcii_enddate',
                    operator: search.Operator.ISEMPTY
                }));
                cargaRegistroFciSearch.filters.push(search.createFilter({
                    name: 'custrecord_nscs_fcii_item',
                    operator: search.Operator.IS,
                    values: itemId // Certifique-se que 'id_Prod_Envase' esteja definido no escopo
                }));

                // Executa a pesquisa e obtém os resultados
                var resultSetRegistroFci = cargaRegistroFciSearch.run();
                var pagedResults = resultSetRegistroFci.getRange({
                    start: 0,
                    end: 1000
                });


    
                if (pagedResults.length > 0) {
                    // Registro FCI
                    for (var i = 0; i < pagedResults.length; i++) {
                        var searchResult = pagedResults[i];
                        var idRegFCIprod = searchResult.id; // O ID do registro é diretamente acessível

                        var fci = searchResult.getValue({
                            name: 'custrecord_nscs_fcii_fci' // Assumindo que este é o ID do campo FCI
                        });
                        var percentualImportado = parseFloat(searchResult.getValue({
                            name: 'custrecord_nscs_fcii_percentual_importado' // Assumindo que este é o ID do campo percentual importado
                        }));

                        var origemTemp;
                        if (percentualImportado <= 40) {
                            origemTemp = 5;
                        } else if (percentualImportado > 40 && percentualImportado <= 70) {
                            origemTemp = 3;
                        } else if (percentualImportado > 70) {
                            origemTemp = 8;
                        }

                        log.debug({ title: 'alterar FCI', details: 'ID - FCI:'+idRegFCIprod});
                        // log.debug({ title: 'FCI | percentual Importado | fci_percentual', details: fci + " | " + percentualImportado + " | " + fciPercentual });

                        var nomeTypeConsulta = 'customrecord_nscs_fciinformation';

                        try {
                            // Carrega o registro para edição
                            var itemRecordFci = record.load({
                                type: nomeTypeConsulta,
                                id: idRegFCIprod
                            });

                            // Define o novo valor para o campo de data de fim
                            itemRecordFci.setValue({
                                fieldId: 'custrecord_nscs_fcii_startdate',
                                value: '15/05/2025' //new Date('2025-03-12') // Formato AAAA-MM-DD para objetos Date
                            });

                            // Salva as alterações
                            var recordId = record.submit(itemRecordFci);
                            log.debug({ title: 'Registro FCI atualizado', details: 'ID: ' + recordId });

                        } catch (e) {
                            log.error({ title: 'Erro ao processar registro FCI ID: ' + idRegFCIprod, details: e });
                        }
                    }
                }
    

            } catch (error) {
                log.debug({ title: 'Error alterar FCI', details: error + ' - ' + error.lineNumber });
            }

        }
        function Salvar_FCI(itemId, codigo_FCI) {
            

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
                  /*
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nscs_fcii_startdate', 
                    value: '15/05/2025' // Exemplo de valor
                  });
                  */
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nch_val_saida_merca', 
                    value: 10 // Exemplo de valor
                  });
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nch_parce_importacion', 
                    value: 10 // Exemplo de valor
                  });
                  novoRegistro.setValue({
                    fieldId: 'custrecord_nch_conten_importa', 
                    value: 10 // Exemplo de valor
                  });
                  //novoRegistro.save();
            
                  var idNovoRegistro = novoRegistro.save();
                  log.debug({ title: 'Salvar FCI', details: 'ID' + idNovoRegistro});
                  
                  /*
                  log.debug({                     
                            title: 'Novo Registro Criado',
                            details: 'Novo registro do tipo ' + nomeTypeNovoRegistro + ' com ID ' + idNovoRegistro + ' foi criado.'
                  });*/


            } catch (error) {
                log.debug({ title: 'Salvar FCI', details: 'Error: ' + error});
              //  log.debug({ title: 'Error GuardaArticulos', details: error + ' - ' + error.lineNumber });
               // GuardaLog('GuardaArticulos', '', '', 'Error: ' + error);
              //  throw new Error(error);

               // return false;
            }
               
               
        }


        /**
         * Vacía las sesiones activas
         * 
         * @param {object} sessionObj Objeto con las sesiones activas
         */
        function LimpiaSession(sessionObj) {
            sessionObj.set({ name: "paso", value: "" });
            sessionObj.set({ name: "id_FCI_txt", value: "" });
            sessionObj.set({ name: "articulosTXT", value: "" });
            sessionObj.set({ name: "valida", value: "" });
        }


        /**
         * Guarda éxito o error en log: NCH Log Importacion XML Compra
         * 
         * @param {string} idNombre Donde sucede el error
         * @param {string} proveedor Proveedor
         * @param {string} notas Notas extras
         * @param {string} error Mensaje de error
         */
        function GuardaLog(idNombre, proveedor, notas, error) {
            var registroLog = record.create({
                type: 'customrecord_nch_importa_factura_xml_br'
            })

            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_idnombre', value: idNombre });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_proveedor', value: proveedor });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_notas', value: notas });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_error', value: error });

            //registroLog.save();
        }

        return {
            onRequest: onRequest
        };
    });

