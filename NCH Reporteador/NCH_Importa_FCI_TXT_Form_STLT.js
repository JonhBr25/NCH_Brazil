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

                    form.clientScriptFileId = (ambiente == 'SANDBOX') ? 203555 : 203555;// 183153 : 183153; 

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
                    var importarTXT = form.addField({
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
                        label: 'Enviar Arquivo'
                        //label: 'Carregar XML'
                    });

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
               
                   // LimpiaSession(sessionObj);

                    var tieneXML = sessionObj.get({
                        name: "id_FCI_txt"
                    });

                   // log.debug({ title: 'Teste da primeira tela', details: 'Conteudo' + tieneXML});

                    if (tieneXML) {

                        
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
                       /* var articulos = JSON.parse(sessionObj.get({
                            name: "articulosTXT"
                        }));*/
                        var id_dados = sessionObj.get({ name: "idRegistroFCI_dados" }) ;

                        var recordType = 'customrecord_nch_importar_fci_dados';

                        var recordIdDesejado = id_dados;
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


                        log.debug({ title: 'Teste da primeira tela', details: 'Length' + searchResult.length});

                        if (searchResult.length > 0) {
                            var result = searchResult[0];
                            var recordId = result.id; // Este será 16
                            var articulosJSON= result.getValue({
                                name: 'custrecord_nch_importar_fci_dados_regist' // Substitua pelo ID do campo dos dados JSON
                            });

                             var articulos= JSON.parse(articulosJSON);

                            if (articulos.length > 0) {
                                for (var j = 0; j < articulos.length; j++) {
                                    const element = articulos[j];
                                    
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
                                        value: articulos[j].percValor
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

                    log.debug({ title: 'Metodo POST', details: 'Metodo POST Funcionando'+ valida});

                    var cuantosArticulos = context.request.getLineCount({
                        group: 'custpage_sublist1'
                    });
                    
                    if (cuantosArticulos <= 0 && context.request.files.custpage_txt_fci_gov != null) {

                        //Guarda archivo XML
                        var nombreArchivo = context.request.files.custpage_txt_fci_gov.name;
                        var archivoTXT = context.request.files.custpage_txt_fci_gov.getContents();
                        var archivoTipo = context.request.files.custpage_txt_fci_gov.fileType;

                        var idArchivo = AdcionarArquivo(nombreArchivo, archivoTXT);

                        if (idArchivo == '0') {
                            throw new Error(idArchivo + '|' + nombreArchivo);
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

                            var articulos = LerConteudoTXT(archivoTXT);

                            sessionObj.set({
                                name: "articulosTXT",
                                value: JSON.stringify(articulos)
                            });

                            var registroLog = record.create({type: 'customrecord_nch_importar_fci_dados'})
                                registroLog.setValue({ fieldId: 'custrecord_nch_importar_fci_dados_regist', value: JSON.stringify(articulos)});
                            var idFCIRegistroDados = registroLog.save();
                                
                            sessionObj.set({
                                name: "idRegistroFCI_dados",
                                value: idFCIRegistroDados
                                });

                            var parametros = {'custscript_nch_fci_txt_arq_id': idFCIRegistroDados };

                            var status = task.create({
                                taskType: task.TaskType.SCHEDULED_SCRIPT,
                                scriptId: 'customscript_nch_importa_fci_txt_schd',
                                deploymentId: 'customdeploy_nch_importa_fci_txt_schd',
                                params: parametros
                            });

                            var scriptTaskId = status.submit();
                            var resultado = task.checkStatus(scriptTaskId);

                            var entraCiclo = true;

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

                        }

                        // Redireccion el script, vuelve a llamar al SuiteLet actual
                        redirect.toSuitelet({
                            scriptId: 'customscript_nch_importa_fci_txt',
                            deploymentId: 'customdeploy_nch_importa_fci_txt_gov'
                        });
                    }
                    else {  
                      
                        var id_dados = sessionObj.get({ name: "idRegistroFCI_dados" }) ;

                        var parametros = {'custscript_nch_fci_txt_arq_id': id_dados };

                        var status = task.create({
                            taskType: task.TaskType.SCHEDULED_SCRIPT,
                            scriptId: 'customscript_nch_importa_fci_txt_schd',
                            deploymentId: 'customdeploy_nch_importa_fci_txt_schd',
                            params: parametros
                        });

                        var scriptTaskId = status.submit();
                        var resultado = task.checkStatus(scriptTaskId);

                        var entraCiclo = true;

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
                LimpiaSession(sessionObj);
                log.debug({ title: 'ERRO', details: 'ERRO:'+  error + ' - ' + error.lineNumber});

                redirect.toSuitelet({
                    scriptId: 'customscript_nch_importa_fci_txt',
                    deploymentId: 'customdeploy_nch_importa_fci_txt_gov'
                });

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
                            try {

                              /* var itemYcfop = BuscaCadastroItens(campos[3]);

                                var origemTemp;
                                if (parseFloat(campos[8]) <= 40) {
                                    origemTemp = 5;
                                } else if (parseFloat(campos[8]) > 40 && parseFloat(campos[8]) <= 70) {
                                    origemTemp = 3;
                                } else if (parseFloat(campos[8]) > 70) {
                                    origemTemp = 8;
                                }
                                */
                                registrosFCI.push({
                                    regFisFedPro: 0 , //itemYcfop.identificadorInternoDoItem,
                                    codigo: campos[3],
                                    descricaoDoItem: campos[1],
                                    tipoDeUnidadeDeMedida: campos[2],
                                    quantidade: campos[6],
                                    valorUnitario: campos[7],
                                    percValor: campos[8],
                                    vFCI: campos[9],
                                    registrosStatus: "Procurando Itens"
                                });
                                        }
                            catch (error) {

                            }

                        }
                    }
                }
            }
            catch (error) {


                return '0';
            }
            
            return registrosFCI;
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





        /**
         * Vacía las sesiones activas
         * 
         * @param {object} sessionObj Objeto con las sesiones activas
         */
        function LimpiaSession(sessionObj) {
            sessionObj.set({ name: "paso", value: "" });
            sessionObj.set({ name: "idRegistroFCI_dados", value: "" });
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
            var registroLog = record.create({type: 'customrecord_nch_importa_factura_xml_br'})

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

