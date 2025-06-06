    /**
     *@NApiVersion 2.0
    *@NScriptType ClientScript
    */
    define(['N/ui/dialog', 'N/search', 'N/record'], 
    function(dialog, search, record) {

    var modo            = '';
    var subsidiaCliente = '';
        
    function onPageInit( context ) 
    {

        var currentRecord   = context.currentRecord;
            modo            = context.mode;
        var VATAux          = currentRecord.getValue({fieldId:'vatregnumber'});
            subsidiaCliente = currentRecord.getValue({fieldId:'subsidiary'});
                
        if (modo == 'create') 
        {
            currentRecord.setValue({fieldId: 'emailpreference', value:'PDF' });

            //if( subsidiaCliente == '21')
            //    currentRecord.setValue({fieldId: 'custentity_psg_ei_entity_edoc_standard', value:7});//ECUADOR PAQUETE DE DOC ELECTRONICO
                
        }

        return true;
    }

    function onChangeField( context )
    {
        var currentRecord   = context.currentRecord;
        var sublistaID      = context.sublistId;
        var campoID         = context.fieldId;   
        var currentRecord   = context.currentRecord;
        var rucNuevoCliente = currentRecord.getValue({fieldId:'vatregnumber'});
            subsidiaCliente = currentRecord.getValue({fieldId:'subsidiary'});
        var Kind_Vendor     = currentRecord.getText({fieldId:'custentity_vendor_origen'});

        
        //VALIDA QUE VATREGNUMBER NO ESTE REGISTRADO EN OTRO PROVEEDOR != BRAZIL
        /*if (modo == 'create' || modo == 'edit') 
        {
            if(campoID == 'vatregnumber' && Kind_Vendor != 'Extranjero' && subsidiaCliente != '') 
            {
                var idVendor        = currentRecord.id;
                
            if ( rucNuevoCliente != null || rucNuevoCliente != '')
                {
                    //var validaCliente= verificarRUC_EnClientes(subsidiaCliente, rucNuevoCliente);
                    var validaCliente = buscaVendorBR(subsidiaCliente, rucNuevoCliente, idVendor);

                    if ( validaCliente == 0 )
                    {
                        //VALIDACION DE RUC EN PERU
                        //Ingresar nuevos IDs para Perú
                        if(subsidiaCliente == '30' || subsidiaCliente == '4')
                        {
                            if( !ValidaRUC() )
                            {    nlapiSetFieldValue('custentity_vatregnumberodbc', null);
                                return false;
                            }
                            else
                            {
                                nlapiSetFieldValue('custentity_vatregnumberodbc', rucNuevoCliente);
                                nlapiSetFieldValue('custentity_nch_vatregnumber', rucNuevoCliente);
                            }    
                        } 
                        else
                        {
                            nlapiSetFieldValue('custentity_mx_rfc', rucNuevoCliente);
                            nlapiSetFieldValue('custentity_nch_vatregnumber', rucNuevoCliente);
                        }

                        return true;
                    } 
                    else {
                    alert('El Numero de Identificacion ya se encuentra registrado con otro Proveedor.');
                    nlapiSetFieldValue('custentity_field_num_identificacion', null);
                    nlapiSetFieldValue('vatregnumber', null);
                    nlapiSetFieldValue('custentity_nch_digito_verificador_panama', null);
                    nlapiSetFieldValue('custentity_vatregnumberodbc', null);
                    nlapiSetFieldValue('custentity_nch_vatregnumber', null);
                    return false;
                    }           
                }
        
            }
        }  
        
        if (campoID == 'custentity_nch_digito_verificador_panama' && (subsidiaCliente == '19' || subsidiaCliente == '20'))
        {
            //CONCATENA RUT + DIGITO VERIFICADOR PARA ESTADO DE CUENTA CLIENTE
            var DigVer = currentRecord.getValue({fieldId:'custentity_nch_digito_verificador_panama'});
            var RUTDig = rucNuevoCliente + '-' + DigVer;        
            currentRecord.setValue({fieldId: 'custentity_nch_vatregnumber', value:RUTDig});
            
        }
        
        if (campoID == 'custentity_digit_verificator' && subsidiaCliente == '10')
        {
            //CONCATENA RUT + DIGITO VERIFICADOR PARA PANAMA
            var DigVer = currentRecord.getValue({fieldId:'custentity_digit_verificator'});
            var RUTDig = rucNuevoCliente + '-' + DigVer;        
            currentRecord.setValue({fieldId: 'custentity_nch_vatregnumber', value:RUTDig});
        }*/
        
        //CONCATENACION DE CAMPO SI ES INDIVIDUAL
        if(campoID == 'firstname' || campoID == 'lastname') 
        {
            var esindividual = currentRecord.getValue({fieldId:'isperson'});
            if( esindividual == 'T')
            {
                var nombreVendor = currentRecord.getValue({fieldId:'firstname'});
                var apellidoVendor = currentRecord.getValue({fieldId:'lastname'});
                var nombrecompletoVendor = nombreVendor+' '+apellidoVendor;
                currentRecord.setValue({fieldId: 'companyname', value:nombrecompletoVendor.toUpperCase()});
            }
            
        }
        
        // Copy Company Name on Field Legalname
        if (campoID == 'companyname')
        {
            currentRecord.setValue({fieldId: 'legalname', value:currentRecord.getValue({fieldId:'companyname'})});
            currentRecord.setValue({fieldId: 'printoncheckas', value:currentRecord.getValue({fieldId:'companyname'}).toLocaleUpperCase()});
            currentRecord.setValue({fieldId: 'custentity_legal_name_odbc', value:currentRecord.getValue({fieldId:'companyname'})});
        }
        
        
        return true;
    }

    function onSaveRecord(context)
    {

        //LOGICA NUEVA PARA CATEGORIA DEL PROVEEDOR - REP 300118
        var currentRecord   = context.currentRecord;
        var valemplo = 'SalesRep Agente';
        var valempl2 = 'SalesRep Empleado';
        var tipoemplo = currentRecord.getText({fieldId:'category'});
        var patarelac = currentRecord.getValue({fieldId:'custentitypartner_relacionado'});
        var nchgerenc = currentRecord.getValue({fieldId:'cseg_nch_gerencia'});
        var nchsubsid = currentRecord.getValue({fieldId:'subsidiary'});
        
        if(tipoemplo == valemplo || tipoemplo == valempl2)
            {
                if(patarelac == '' || patarelac == null)
                    {
                        Dialog('El Registro es tipo SALESREP - COMPLETE EL CAMPO SALES REP RELACIONADO');
                        return false;
                    }

                /*if( (nchsubsid == 20 || nchsubsid == 3) && (nchgerenc == '' || nchgerenc == null) )
                    {
                        Dialog('El Registro es tipo SALESREP - COMPLETE EL CAMPO NCH GERENCIA');
                        return false;
                    }*/
            }

        //LOGICA PARA BRASIL - COPIA CAMPO CNPJ A NCH VATREGNUMBER
        //INSTANCIA SUITETAX
        var IDExtrang = '';//currentRecord.getValue({fieldId:'custentity_o2s_t_doc_estrangeiro'});

        if( subsidiaCliente == '3' )
        {
            //var valcnpj = currentRecord.getValue({fieldId:'custentity_psg_br_cnpj'});
            //var valcpf  = currentRecord.getValue({fieldId:'custentity_psg_br_cpf'});
            var cadastroFederal = currentRecord.getValue({fieldId: 'custentity_brl_entity_t_fed_tax_reg'});
            var valpers = currentRecord.getValue({fieldId:'isperson'});

            currentRecord.setValue({fieldId: 'custentity_nch_vatregnumber', value: cadastroFederal });

            /*if( valpers == 'F' || valpers == false )
            { currentRecord.setValue({fieldId: 'custentity_nch_vatregnumber', value: valcnpj }); }
            else { currentRecord.setValue({fieldId: 'custentity_nch_vatregnumber', value: valcpf }); }     */

            //LOGICA PARA BRASIL - VALIDACION DE VATREGNUMBER
            var subVendor = subsidiaCliente;
            var VatVendor  = currentRecord.getValue({fieldId:'custentity_nch_vatregnumber'});
            var idVendor = currentRecord.id;
            
            //EXCEPCION DE VALIDACION POR CATEGORIA NO ENTRA SI ES SALESREP AGENTE O SALESREP EMPLEADO - 12.01.2024
            var category_for = currentRecord.getValue({fieldId:'category'});

            if ( VatVendor.length > 0 && (category_for != '12' && category_for != '13') ) 
            {  
                try 
                {
                    var existeVendor = buscaVendorBR(subVendor, VatVendor, idVendor);

                    if( existeVendor > 0)
                    {
                        alert( 'Já existe um registro com este número de identificação !' );
                        currentRecord.setValue({fieldId: 'custentity_nch_vatregnumber', value: null });
                        return false;
                    }
                    

                }catch(err)
                {
                    alert('Erro de validação VATREGNUMBER');
                    return false;
                }

            } 

        } 

        //CAMPO RESPOSNSABILIDAD FISCAL COLOMBIA
        /*if( currentRecord.getValue({fieldId:'subsidiary'}) == 20 )
        {
            var llenaCampo = llenaCampoResponsabilidadesFiscales( currentRecord );
            if( llenaCampo !== true )
            {
                //Message.hide();
                return false;
            }
                    
        }*/
    
        return true;
    }

    function llenaCampoResponsabilidadesFiscales( currentRecord ) 
        {
            try
            {
                var objRespuesta = {};

                var ResponsabilidadesFiscales = currentRecord.getValue( {fieldId:'custentity_nch_responsabilidad_fiscal'} );

                if( String(ResponsabilidadesFiscales) == '' || ResponsabilidadesFiscales == null || ResponsabilidadesFiscales == undefined )
                {
                    Dialog('No se ha seleccionado por lo menos una Responsabilidad Fiscal.')
                    return false;
                }

                var arrayResponsabilidadesFiscales = String(ResponsabilidadesFiscales).split(',');

                var arrayCodigosRespFiscales = [];

                for (var i = 0; i < arrayResponsabilidadesFiscales.length; i++) 
                {
                    var idResponsabilidadFiscal = arrayResponsabilidadesFiscales[i];

                    var objResponsabilidadFiscal = search.lookupFields({type: 'customrecord_nch_responsabilidad_fiscal', id: idResponsabilidadFiscal, columns:['custrecord_nch_resp_fiscal_code'] });

                    arrayCodigosRespFiscales.push( objResponsabilidadFiscal.custrecord_nch_resp_fiscal_code );
                }

                

                currentRecord.setValue( {fieldId:'custentity_nch_resp_fiscal_code', value:arrayCodigosRespFiscales.join(';') } );

                return true;

            }
            catch(error)
            {
                console.log(error);
                Dialog('Ocurrió una excepción al generar los códigos de Responsabilidad fiscal.')
                return false;
            }
        }

    function buscaVendorBR(v_subVendor, v_VatVendor, v_idVendor)
    {
        var valida = 0;
        var filters = new Array();
            filters[0] = new nlobjSearchFilter('subsidiary', null, 'is', v_subVendor);
            filters[1] = new nlobjSearchFilter('custentity_nch_vatregnumber', null, 'isnotempty');
            filters[2] = new nlobjSearchFilter('custentity_nch_vatregnumber', null, 'is', v_VatVendor);
            if( v_idVendor != '' && v_idVendor != null) filters[3] = new nlobjSearchFilter('internalidnumber', null, 'notequalto', v_idVendor);
        var columns = new Array();
            columns[0] = new nlobjSearchColumn('companyname');
        var searchresults = nlapiSearchRecord('vendor', null, filters, columns);        

        if ( searchresults != null && searchresults != '' ) 
        {
            var cantreg = searchresults.length;
            var nomenco = searchresults[0].getId();
            valida = 1;
        }
        return valida;
    }

    function verificarRUC_EnClientes(v_subsidiaCliente, v_rucNuevoCliente ) 
    {
        //SCRIPT A NIVEL INSTANCIA OSS Valida Clientes ST.JS
        var url = nlapiResolveURL('SUITELET', 'customscript_validavendorsst', 'customdeploy_validavendorsst') + '&sub=' + v_subsidiaCliente + '&ruc=' + v_rucNuevoCliente;
        var devuelve = nlapiRequestURL(url);
        var valida = devuelve.getBody();
        return valida;
    }

    //Validacion estructura de RUC Peruano
    function ValidaRUC(type,lblname)
    {
        //Valida Campos RUC
        if (nlapiGetFieldValue('isperson')=='F' && (nlapiGetFieldValue('currency')!='' || nlapiGetFieldValue('currency')!=null))
        {
            var valorIVA = nlapiGetFieldValue('vatregnumber');
            var tipoMoneda = nlapiGetFieldText('currency');
            var subsidiary  = nlapiGetFieldValue('subsidiary');
            var valorMoneda = nlapiGetFieldValue('currency');
            var codigoTipoDoc = nlapiGetFieldValue('custentity_cod_tipo_docid_sunat');
            var numeroDirecciones= nlapiGetLineItemCount('addressbook');
            var existeDirecBill='F';//dira si existe o no una direccion Billing
            var aux;//tomara los valores de True o False para cerciorar la existencia de Billing
            
            //VALIDANDO TIPO DE DOCUMENTO SEA RUC
            if (valorIVA != '' && (codigoTipoDoc=='6' || codigoTipoDoc=='06')) 
            {
                //COMIENZA AUTENTICACION DE RUC
                if (valorIVA.length != 11) 
                {
                    alert('El Nro RUC debe tener 11 digitos');
                    return false;
                }
                else
                {
                    matriz1 = new Array(11);
                    matriz2 = new Array('5', '4', '3', '2', '7', '6', '5', '4', '3', '2', '0');
                    matriz3 = new Array(11);
                    //llenando primera matriz
                    for (var conta = 0; conta < 11; conta++) 
                    {
                        matriz1[conta] = valorIVA.substr(conta, 1);
                    }
                    //llenando tercera matriz
                    matriz3[10] = 0;
                    for (var i = 0; i < 10; i++) 
                    {
                        matriz3[i] = matriz1[i] * matriz2[i];
                        matriz3[10] = matriz3[10] + matriz3[i];
                    }
                    var lnResiduo = matriz3[10] % 11;
                    var lnUltDigito = 11 - lnResiduo;
                    if (lnUltDigito == 11 || lnUltDigito == 1) 
                    {
                        lnUltDigito = 1;
                    }
                    if (lnUltDigito == 10 || lnUltDigito == 0)
                    {
                        lnUltDigito = 0;
                    }
                    if (lnUltDigito == matriz1[10]) 
                    {
                        //COMIENZA BUSQUEDA POR SIMILARES
                        var clientes = null;
                        var filtros  = new Array();
                        filtros[0] = new nlobjSearchFilter('vatregnumber', null, 'isnotempty');
                        filtros[1] = new nlobjSearchFilter('vatregnumber', null, 'is', valorIVA);
                        filtros[2] = new nlobjSearchFilter('currency', null, 'is', valorMoneda);
                        filtros[3] = new nlobjSearchFilter('subsidiary', null, 'is', subsidiary);
                        var columns = new Array();
                        columns[0] = new nlobjSearchColumn('internalid');
                        clientes = nlapiSearchRecord('vendor', null, filtros, columns);
                        if (clientes != null && clientes.length > 0) 
                        {
                            var cantidad = clientes.length;
                            alert("Ya existe " + cantidad + " cliente registrado con el RUC " + valorIVA + " con el tipo de moneda " + tipoMoneda);
                            return false;
                        }
                        
                    }
                    else 
                    {
                        return alert("Nro. RUC Erroneo");
                    }
                }
                    
            }                
        }//FIN DE VALIDAR QUE SEA EMPRESA Y TENGA UNA MONEDA ASIGNADA
        
        return true;
    }

    function Dialog(mensaje, titulo) 
    {
        
        titulo || (titulo = '&iexcl;Aviso!')
        
        if(String(mensaje).trim() == '')
            return;

        var options = {
            title   : titulo ,
            message : mensaje
        };
        dialog.alert(options);
    }

    return {

        pageInit      : onPageInit,
        fieldChanged  : onChangeField,
        saveRecord    : onSaveRecord
                        
    };

    });