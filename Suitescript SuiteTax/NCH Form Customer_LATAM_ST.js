/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 *  
 * Version    Date            Author    Remarks
 * 1.00       25 Feb 2025     Jaciel    Lógica para obtener CNPJ en cliente nuevo
 */

define(['N/ui/dialog', 'N/https', 'N/search', 'N/record', 'N/url'],
    function (dialog, https, search, record, url) {

        var modo = '';

        function onPageInit(context) {
            try {
                var currentRecord = context.currentRecord;
                modo = context.mode;

                var tipoPersona = currentRecord.getValue({
                    fieldId: 'isperson'
                });

                // Solo entra a CNPJ si es persona jurídica
                if (tipoPersona == 'F') {
                    if (modo == 'edit') {
                        ValidaCNPJ(currentRecord);
                    }
                }

                return true;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Erro!',
                    message: 'onPageInit' + error.lineNumber + '|' + '' + ' - ' + String(error.message)
                });

                return true;
            }
        }

        function onFieldChanged(context) {
            try {
                var currentRecord = context.currentRecord;

                if (context.fieldId == 'custentity_nch_vatregnumber') {
                    var cnpjConsultar = currentRecord.getValue({
                        fieldId: 'custentity_nch_vatregnumber'
                    });

                    var tipoPersona = currentRecord.getValue({
                        fieldId: 'isperson'
                    });

                    // Solo entra a CNPJ si es persona jurídica
                    if (tipoPersona == 'F') {
                        var leerPaginaCNPJ = ObtieneJSONCNPJ(cnpjConsultar);

                        // Si regresa datos la página asigna los datos
                        // Si se esta editando el registro no es necesario asignar desde onFieldChanged
                        if (modo != 'edit') {
                            if (leerPaginaCNPJ && cnpjConsultar != '') {
                                // Lee JSON de la página y asigna a campos los resultados
                                AsignaCampos(leerPaginaCNPJ.toJSON(), currentRecord);
                            }
                        }
                    }
                }

                return true;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Erro!',
                    message: 'Ocorreu um erro com o CNPJ no cadastro do cliente. Continue salvando manualmente ou informe o erro ao seu administrador: ' +
                        error.lineNumber + '|' + 'onFieldChanged' + ' - ' + String(error.message)
                });

                return true;
            }
        }

        function ObtieneJSONCNPJ(cnpj) {
            try {
                var leerPagina = '';

                // Sitio para extraer información de CNPJ
                var url = "https://receitaws.com.br/v1/cnpj/" + cnpj.trim().replaceAll('.', '').replace('-', '').replace('/', '');

                leerPagina = https.get({
                    url: url,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', 'Accept': '*/*' }
                });
            } catch (error) {
                dialog.alert({
                    title: 'Erro!',
                    message: 'Erro ao ler a página do CNPJ' +
                        error.lineNumber + '|' + 'ObtieneJSONCNPJ' + ' - ' + String(error.message)
                });
            }
            finally {
                return leerPagina;
            }
        }

        function AsignaCampos(datosPagina, currentRecord) {
            try {
                var jsonDatos = JSON.parse(datosPagina.body);
                var atividade_principal = 0;
                var code = [];
                var data_situacao = '', nome = '', telefone = '', email = '', situacao = '', bairro = '', logradouro = '', complemento = '',
                    numero = '', cep = '', municipio = '', abertura = '', natureza_juridica = '', uf = '', cnpj = '', efr = '', fantasia = '';

                if (jsonDatos.status == 'ERROR') {
                    dialog.alert({
                        title: jsonDatos.status,
                        message: jsonDatos.message
                    });
                }
                else {
                    situacao = jsonDatos.situacao;
                    nome = jsonDatos.nome;
                    cnpj = jsonDatos.cnpj;

                    // Se valida la situación sea ACTIVA para presentar los datos en caso contrario no se setean valores
                    if (situacao != 'ATIVA') {
                        dialog.alert({
                            title: 'Erro!',
                            message: 'O status cadastral (' + cnpj + ') do cliente ' + nome + ' é ' + situacao + '. O cliente não pode ser criado devido ao seu situação cadastral..'
                        });

                        currentRecord.setValue({
                            fieldId: 'custentity_nch_vatregnumber',
                            value: ''
                        });

                        currentRecord.setValue({
                            fieldId: 'custentity_brl_entity_t_fed_tax_reg',
                            value: ''
                        });
                    } else {
                        // Se asignan los valores de JSON procedentes de la página a variables locales
                        atividade_principal = jsonDatos.atividade_principal.length;
                        for (a = 0; a < atividade_principal; a++) {
                            code.push(jsonDatos.atividade_principal[a].code);
                        }
                        data_situacao = jsonDatos.data_situacao;    // ¿Este campo se aplicará en Netsuite?
                        telefone = jsonDatos.telefone;
                        email = jsonDatos.email;
                        bairro = jsonDatos.bairro;
                        logradouro = jsonDatos.logradouro;
                        complemento = jsonDatos.complemento;
                        numero = jsonDatos.numero;
                        cep = jsonDatos.cep;
                        municipio = jsonDatos.municipio;
                        abertura = jsonDatos.abertura;
                        natureza_juridica = jsonDatos.natureza_juridica;
                        uf = jsonDatos.uf;
                        efr = jsonDatos.efr;
                        fantasia = jsonDatos.fantasia;

                        // Se asignan los valores a campos de Netsuite
                        currentRecord.setValue({
                            fieldId: 'custentity_brl_entity_t_fed_tax_reg',
                            value: cnpj
                        });

                        currentRecord.setText({
                            fieldId: 'custentity_nch_situacion_catastral_br',
                            text: situacao
                        });

                        currentRecord.setValue({
                            fieldId: 'companyname',
                            value: nome
                        });

                        if (fantasia.length > 0) {
                            currentRecord.setValue({
                                fieldId: 'custentity_nch_nombre_comercial',
                                value: fantasia
                            });
                        } /* else {
                        currentRecord.setValue({
                            fieldId: "custentity_nch_nombre_comercial",
                            value: nome
                        });
                    } */

                        currentRecord.setValue({
                            fieldId: 'phone',
                            value: telefone
                        });

                        /* currentRecord.setValue({
                            fieldId: 'email',
                            value: email
                        }); */

                        // Se ingresa el primer código de actividad principal (CNAE)
                        currentRecord.setText({
                            fieldId: 'custentity_nch_code_cnae',
                            text: code[0]
                            // value: '1332'
                        });

                        currentRecord.setText({
                            fieldId: "custentity_nch_customer_cod_natjur",
                            text: natureza_juridica.substring(0, 5).replace('-', '')
                        });

                        // Dirección nueva
                        currentRecord.selectNewLine({
                            sublistId: 'addressbook'
                        });

                        // Nombre de la dirección
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'addressbook',
                            fieldId: 'label',
                            value: 'Endereço principal'
                        });

                        // Se crea el subrecord de la dirección
                        var subRegistro = currentRecord.getCurrentSublistSubrecord({
                            sublistId: 'addressbook',
                            fieldId: 'addressbookaddress'
                        });

                        subRegistro.setValue({
                            fieldId: 'country',
                            value: 'BR'
                        });

                        subRegistro.setValue({
                            fieldId: 'addr1',
                            value: logradouro
                        });

                        subRegistro.setValue({
                            fieldId: 'addr3',
                            value: numero
                        });

                        subRegistro.setValue({
                            fieldId: 'custrecord_brl_addrform_t_complement',
                            value: complemento
                        });

                        subRegistro.setValue({
                            fieldId: 'addr2',
                            value: bairro
                        });

                        subRegistro.setValue({
                            fieldId: 'city',
                            value: municipio
                        });

                        // Datos relacionados a CEP
                        var datosCEP = ObtieneDatosCEP(cep);
                        // var ciudadCEP = municipio;
                        var ciudadIdCEP = 0;

                        if (datosCEP.error == '') {
                            // Se requiere la ciudad en la dirección
                            if (datosCEP.ibge != '') {
                                ciudadCEP = ObtieneCiudad(datosCEP.ibge);
                            } else {
                                dialog.alert({
                                    title: 'Erro!',
                                    message: 'O CEP não possui IBGE associado.'
                                });
                            }
                        } else {
                            dialog.alert({
                                title: 'Erro!',
                                message: 'Ocorreu um erro em ObtieneDatosCEP. Continue salvando o endereço manualmente ou informe o erro ao seu administrador.: ' +
                                    datosCEP.error
                            });
                        }

                        subRegistro.setValue({
                            fieldId: 'custrecord_brl_addr_form_city',
                            value: ciudadCEP
                            // value: '5477'
                        });

                        subRegistro.setValue({
                            fieldId: 'state',
                            value: uf
                        });

                        subRegistro.setValue({
                            fieldId: 'zip',
                            value: cep
                        });

                        // Se guarda el subregistro de dirección
                        currentRecord.commitLine({
                            sublistId: 'addressbook'
                        });
                    }
                }

                return true;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Erro!',
                    message: 'Ocorreu um erro com o CNPJ no cadastro do cliente. Continue salvando manualmente ou informe o erro ao seu administrador: ' +
                        error.lineNumber + error.line + '|' + 'AsignaCampos' + ' - ' + String(error.message)
                });

                return true;
            }
        }

        function ObtieneDatosCEP(cep) {
            try {
                var objCEP = {};

                // Se requiere la ciudad por lo cual es necesario ir por el JSON del ibge con el cep
                var urlCEP = "https://viacep.com.br/ws/" + cep.replace('.', '').replace('-', '') + "/json/";

                var leerPaginaCEP = https.get({
                    url: urlCEP,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', 'Accept': '*/*' }
                });

                var datosPaginaCEP = leerPaginaCEP.toJSON();

                if (datosPaginaCEP.code != '200') {
                    if (datosPaginaCEP.code == '400') {
                        objCEP.error = 'Bad Request';
                    } else {
                        objCEP.error = 'Error code: ' + datosPaginaCEP.code;
                    }
                } else {
                    var jsonDatosCEP = JSON.parse(datosPaginaCEP.body);

                    objCEP.logradouro = jsonDatosCEP.logradouro;
                    objCEP.complemento = jsonDatosCEP.complemento;
                    objCEP.unidade = jsonDatosCEP.unidade;
                    objCEP.bairro = jsonDatosCEP.bairro;
                    objCEP.localidade = jsonDatosCEP.localidade;
                    objCEP.uf = jsonDatosCEP.uf;
                    objCEP.estado = jsonDatosCEP.estado;
                    objCEP.regiao = jsonDatosCEP.regiao;
                    objCEP.ibge = jsonDatosCEP.ibge;
                    objCEP.gia = jsonDatosCEP.gia;
                    objCEP.ddd = jsonDatosCEP.ddd;
                    objCEP.siafi = jsonDatosCEP.siafi;

                    objCEP.error = '';
                }

                return objCEP;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Erro!',
                    message: 'Ocorreu um erro ao tentar obter o CEP. Continue salvando manualmente ou informe o erro ao seu administrador: ' +
                        error.lineNumber + error.line + '|' + 'ObtieneDatosCEP' + ' - ' + String(error.message)
                });

                objCEP.error = error.message;

                return objCEP;
            }
        }

        function ObtieneCiudad(ibge) {
            try {
                var ciudad = '';

                /* var fechaT = new Date();

                var diaT = fechaT.getDate();
                var mesT = fechaT.getMonth() + 1;
                var anoT = fechaT.getFullYear();

                var fechaTransporte = diaT + '/' + mesT + '/' + anoT; */

                /* var objBuscaCEP = search.lookupFields({
                    type: 'customrecord_ftebr_city',
                    id: ibge,
                    columns: ['name']
                });

                ciudad = objBuscaCEP.name; */

                var objBuscaCEP = search.create({
                    type: 'customrecord_ftebr_city',
                    filters:
                        [
                            ['custrecord_ftebr_city_i_ibge_code', 'equalto', ibge]
                        ],
                    columns:
                        [
                            search.createColumn({ name: 'name' }),
                            search.createColumn({ name: 'internalid' })
                        ]
                });

                // var searchResultCount = objBuscaCEP.runPaged().count;

                objBuscaCEP.run().each(function (result) {
                    ciudad = result.getValue({
                        // name: 'name'
                        name: 'internalid'
                    });

                    return true;
                });

                return ciudad;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Erro!',
                    message: 'Ocorreu um erro ao tentar obter o CEP. Continue salvando manualmente ou informe o erro ao seu administrador: ' +
                        error.lineNumber + '|' + 'ObtieneDatosCEP' + ' - ' + String(error.message)
                });

                return ciudad;
            }
        }

        function ValidaCNPJ(currentRecord) {
            try {
                var mensajesCNPJ = '', mensajesDireccionCNPJ = '';

                var cnpjComparar = currentRecord.getValue({
                    fieldId: 'custentity_nch_vatregnumber'
                });

                // Lee página
                var leerPaginaCNPJCom = ObtieneJSONCNPJ(cnpjComparar);

                // Si regresa datos la página
                if (leerPaginaCNPJCom) {
                    // Lee JSON de la página
                    datosPaginaCNPJ = leerPaginaCNPJCom.toJSON();

                    var jsonDatosCNPJ = JSON.parse(datosPaginaCNPJ.body);
                    var atividade_principal = 0;
                    var codeRevisa = [];

                    var situacaoRevisa = jsonDatosCNPJ.situacao;
                    var nomeRevisa = jsonDatosCNPJ.nome;
                    var cnpjRevisa = jsonDatosCNPJ.cnpj;

                    // Se validan los datos del CNPJ
                    if (situacaoRevisa != 'ATIVA') {
                        function ok(clicOk) {
                            // Se guarda el registro cuando la situación catastral es diferente a ATIVA
                            if (clicOk) {
                                var rec = record.load({
                                    type: record.Type.CUSTOMER,
                                    id: currentRecord.id
                                });

                                rec.setText({
                                    fieldId: 'custentity_nch_situacion_catastral_br',
                                    // text: 'INAPTA'
                                    text: situacaoRevisa
                                });

                                rec.save();

                                var redirectUrl = url.resolveRecord({
                                    recordType: 'customer',
                                    recordId: currentRecord.id,
                                    isEditMode: false
                                });

                                // var paginaActual = window.location.href;

                                window.open(redirectUrl, '_self');
                            }
                        }

                        function failure(reason) { console.log('Failure: ' + reason) }

                        dialog.alert({
                            title: 'Erro!',
                            message: 'O status cadastral (' + cnpjComparar + ') do cliente ' + nomeRevisa + ' é ' + situacaoRevisa + '. Seus dados não serã comparados.'
                        }).then(ok).catch(failure);

                        // currentRecord.setText({
                        //     fieldId: 'custentity_nch_situacion_catastral_br',
                        //     text: situacaoRevisa.charAt(0).toUpperCase() + situacaoRevisa.slice(1)
                        // });

                        // Solo se setea la situación catastral y se guarda el registro
                        // currentRecord.commit;
                        // currentRecord.save();

                        return 'situacion' + situacaoRevisa.charAt(0).toUpperCase() + situacaoRevisa.slice(1);
                    } else {
                        const SituacionCatastral = {
                            ATIVA: 1,
                            SUSPENSA: 2,
                            INAPTA: 3,
                            BAIXADA: 4,
                            NULA: 5
                        }

                        /* currentRecord.setValue({
                            fieldId: 'custentity_nch_vatregnumber',
                            value: cnpjComparar
                        }); */

                        // Lee campos de Netsuite
                        currentRecord.setValue({
                            fieldId: 'custentity_nch_vatregnumber',
                            value: cnpjRevisa
                        });

                        var situacaoComparar = currentRecord.getText({
                            fieldId: 'custentity_nch_situacion_catastral_br'
                        });

                        // Si no hay Situação Cadastral se coloca
                        // if (situacaoComparar == '') {
                        currentRecord.setText({
                            fieldId: 'custentity_nch_situacion_catastral_br',
                            text: situacaoRevisa
                        });
                        // }

                        var nomeComparar = currentRecord.getValue({
                            fieldId: 'companyname'
                        });
                        var fantasiaComparar = currentRecord.getValue({
                            fieldId: 'custentity_nch_nombre_comercial'
                        });
                        var telefoneComparar = currentRecord.getText({
                            fieldId: 'phone'
                        });
                        var emailComparar = currentRecord.getValue({
                            fieldId: 'email'
                        });
                        var codeComparar = currentRecord.getText({
                            fieldId: 'custentity_nch_code_cnae'
                        });
                        var natureza_juridicaComparar = currentRecord.getText({
                            fieldId: "custentity_nch_customer_cod_natjur"
                        });

                        // Lee campos dirección facturación
                        var logradouroComparar = currentRecord.getText({
                            fieldId: 'billaddr1'
                        });
                        var numeroComparar = currentRecord.getText({
                            fieldId: 'billaddr3'
                        });
                        var bairroComparar = currentRecord.getText({
                            fieldId: 'billaddr2'
                        });
                        var municipioComparar = currentRecord.getText({
                            fieldId: 'billcity'
                        });
                        var ufComparar = currentRecord.getText({
                            fieldId: 'billstate'
                        });
                        var cepComparar = currentRecord.getText({
                            fieldId: 'billzip'
                        });

                        // Lee campos página
                        var fantasiaRevisa = jsonDatosCNPJ.fantasia;
                        var telefoneRevisa = jsonDatosCNPJ.telefone;
                        var emailRevisa = jsonDatosCNPJ.email;
                        atividade_principal = jsonDatosCNPJ.atividade_principal.length;
                        for (b = 0; b < atividade_principal; b++) {
                            codeRevisa.push(jsonDatosCNPJ.atividade_principal[b].code);
                        }
                        var cnaeRevisa = codeRevisa[0];
                        var natureza_juridicaRevisa = jsonDatosCNPJ.natureza_juridica.substring(0, 5).replace('-', '');

                        // Lee campos dirección página
                        var logradouroRevisa = jsonDatosCNPJ.logradouro;
                        var numeroRevisa = jsonDatosCNPJ.numero;
                        var bairroRevisa = jsonDatosCNPJ.bairro;
                        var municipioRevisa = jsonDatosCNPJ.municipio;
                        var ufRevisa = jsonDatosCNPJ.uf;
                        var cepRevisa = jsonDatosCNPJ.cep;
                    }

                    telefoneComparar = telefoneComparar.replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '').replaceAll('-', '').replaceAll('/', '');
                    telefoneRevisa = telefoneRevisa.replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '').replaceAll('-', '').replaceAll('/', '')

                    // Compara los resultados
                    mensajesCNPJ = (nomeComparar == nomeRevisa) ? '' : '<p>Existem diferenças no Nome, Netsuite: ' + nomeComparar +
                        ' vs URL Receita: ' + nomeRevisa + '</p>';
                    mensajesCNPJ += (fantasiaComparar == fantasiaRevisa) ? '' : '<p>Existem diferenças no Nome fantasia, Netsuite: ' + fantasiaComparar +
                        ' vs URL Receita: ' + fantasiaRevisa + '</p>';
                    mensajesCNPJ += (telefoneComparar == telefoneRevisa) ? '' : '<p>Existem diferenças no Telefone, Netsuite: ' + telefoneComparar +
                        ' vs URL Receita: ' + telefoneRevisa + '</p>';
                    mensajesCNPJ += (emailComparar == emailRevisa) ? '' : '<p>Existem diferenças no Email, Netsuite: ' + emailComparar +
                        ' vs URL Receita: ' + emailRevisa + '</p>';
                    mensajesCNPJ += (codeComparar == cnaeRevisa) ? '' : '<p>Existem diferenças no Code CNAE, Netsuite: ' + codeComparar +
                        ' vs URL Receita: ' + cnaeRevisa + '</p>';
                    mensajesCNPJ += (natureza_juridicaComparar == natureza_juridicaRevisa) ? '' :
                        '<p>Existem diferenças no Natureza Juridica, Netsuite: ' + natureza_juridicaComparar + ' vs URL Receita: ' + natureza_juridicaRevisa
                    mensajesCNPJ = (mensajesCNPJ != '') ? mensajesCNPJ + '<br /><br />Você quer atualizar os dados?' : '';

                    municipioComparar = municipioComparar.toLowerCase();
                    municipioRevisa = municipioRevisa.toLowerCase();
                    cepComparar = cepComparar.replace('.', '').replace('-', '');
                    cepRevisa = cepRevisa.replace('.', '').replace('-', '');

                    // Compara los resultados dirección
                    mensajesDireccionCNPJ = (logradouroComparar == logradouroRevisa) ? '' : '<p>Logradouro, Netsuite: ' + logradouroComparar +
                        ' vs URL Receita: ' + logradouroRevisa + '</p>';
                    mensajesDireccionCNPJ += (numeroComparar == numeroRevisa) ? '' : '<p>Número, Netsuite: ' + numeroComparar +
                        ' vs URL Receita: ' + numeroRevisa + '</p>';
                    mensajesDireccionCNPJ += (bairroComparar == bairroRevisa) ? '' : '<p>Bairro, Netsuite: ' + bairroComparar +
                        ' vs URL Receita: ' + bairroRevisa + '</p>';
                    // mensajesDireccionCNPJ += (municipioComparar == municipioRevisa) ? '' : '<p>Cidade, Netsuite: ' + municipioComparar +
                    //     ' vs URL Receita: ' + municipioRevisa + '</p>';
                    mensajesDireccionCNPJ += (ufComparar == ufRevisa) ? '' : '<p>Estado, Netsuite: ' + ufComparar +
                        ' vs URL Receita: ' + ufRevisa + '</p>';
                    mensajesDireccionCNPJ += (cepComparar == cepRevisa) ? '' : '<p>Cep, Netsuite: ' + cepComparar +
                        ' vs URL Receita: ' + cepRevisa + '</p>';
                    mensajesDireccionCNPJ = (mensajesDireccionCNPJ != '') ? mensajesDireccionCNPJ + '<br />Atualize as informações de endereço, se necessário.' : '';

                    if (mensajesCNPJ.length > 0) {
                        // Si es clic en OK
                        function si(clicSi) {
                            if (clicSi) {
                                // Colocar los valores nuevos del JSON
                                if ((nomeComparar != nomeRevisa)) {
                                    currentRecord.setValue({
                                        fieldId: 'companyname',
                                        value: nomeRevisa
                                    });
                                };
                                if ((fantasiaComparar != fantasiaRevisa)) {
                                    currentRecord.setValue({
                                        fieldId: 'custentity_nch_nombre_comercial',
                                        value: fantasiaRevisa
                                    });
                                };
                                if ((telefoneComparar != telefoneRevisa)) {
                                    currentRecord.setValue({
                                        fieldId: 'phone',
                                        value: telefoneRevisa
                                    });
                                };
                                if ((emailComparar != emailRevisa)) {
                                    /* currentRecord.setValue({
                                        fieldId: 'email',
                                        value: emailRevisa
                                    }); */
                                };
                                if ((codeComparar != cnaeRevisa)) {
                                    currentRecord.setText({
                                        fieldId: 'custentity_nch_code_cnae',
                                        text: cnaeRevisa
                                    });
                                };
                                if ((natureza_juridicaComparar != natureza_juridicaRevisa)) {
                                    currentRecord.setText({
                                        fieldId: "custentity_nch_customer_cod_natjur",
                                        text: natureza_juridicaRevisa
                                    });
                                };
                            };

                            // Mensajes dirección
                            if (mensajesDireccionCNPJ.length > 0) {
                                // Si es clic en OK
                                function siDireccion(clicSiDir) {
                                    console.log('Successful: ' + clicSiDir)
                                }

                                // Presenta mensaje con diferencias en dirección
                                dialog.alert({
                                    title: 'Aviso, Existem diferenças no Endereço!',
                                    message: mensajesDireccionCNPJ
                                }).then(siDireccion);
                            }
                        }

                        function no(clicNo) {
                            return mensajesCNPJ;
                        }

                        // Presenta mensaje con diferencias
                        dialog.confirm({
                            title: 'Aviso!',
                            message: mensajesCNPJ
                        }).then(si).catch(no);
                    } else {
                        // Mensajes dirección
                        if (mensajesDireccionCNPJ.length > 0) {
                            // Si es clic en OK
                            function siDireccion(clicSiDir) {
                                console.log('Successful: ' + clicSiDir)
                            }

                            // Presenta mensaje con diferencias en dirección
                            dialog.alert({
                                title: 'Aviso, Existem diferenças no Endereço!',
                                message: mensajesDireccionCNPJ
                            }).then(siDireccion);
                        }
                    }
                }

                return mensajesCNPJ
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Erro!',
                    message: 'Ocorreu um erro ao tentar obter o CNPJ para comparação.' +
                        error.lineNumber + '|' + 'ValidaCNPJ' + ' - ' + String(error.message)
                });

                return mensajesCNPJ;
            }
        }

        function ValidaCEP(currentRecord) {
            try {
                var mensajesCEP = '';

                // Se valida la parte de la dirección con CEP
                var cuantasDir = currentRecord.getLineCount({
                    sublistId: 'addressbook'
                });

                for (var i = 0; i < cuantasDir; i++) {
                    //Selecciona la línea de la sublista
                    currentRecord.selectLine({
                        sublistId: "addressbook",
                        line: i
                    });

                    var subRegistroDir = currentRecord.getCurrentSublistSubrecord({
                        sublistId: 'addressbook',
                        fieldId: 'addressbookaddress'
                    });

                    var comparaLograduro = subRegistroDir.getValue({
                        fieldId: 'addr1'
                    });

                    var comparaNumero = subRegistroDir.getValue({
                        fieldId: 'addr3'
                    });

                    var comparaComplemento = subRegistroDir.getValue({
                        fieldId: 'custrecord_brl_addrform_t_complement'
                    });

                    var comparaBairro = subRegistroDir.getValue({
                        fieldId: 'addr2'
                    });

                    var comparaMunicipio = subRegistroDir.getValue({
                        fieldId: 'city'
                    });

                    var comparaCiudadCEP = subRegistroDir.getValue({
                        fieldId: 'custrecord_brl_addr_form_city'
                    });

                    var comparaUF = subRegistroDir.getValue({
                        fieldId: 'state'
                    });

                    var comparaCEP = subRegistroDir.getValue({
                        fieldId: 'zip'
                    });

                    var comparaDatosCEP = ObtieneDatosCEP(comparaCEP);
                }

                return mensajesCEP;
            } catch (error) {
                console.log(error);
                dialog.alert({
                    title: 'Erro!',
                    message: 'Ocorreu um erro ao tentar obter o CEP para comparação.' +
                        error.lineNumber + '|' + 'ValidaCEP' + ' - ' + String(error.message)
                });

                return mensajesCEP;
            }
        }

        return {
            fieldChanged: onFieldChanged,
            pageInit: onPageInit
        };
    });