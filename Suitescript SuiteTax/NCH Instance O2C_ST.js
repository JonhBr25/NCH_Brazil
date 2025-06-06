/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
 define(['N/ui/dialog', 'N/https', 'N/search', 'N/record'],
    function (dialog, https, search, record) 
    {
        var Nat_Oper            = '';
        var Fin_Oper            = '';
        var Nam_Oper            = ''; 
        var flag_contri         = 1;
        var flag_suframa        = 1;
        var flag_UF             = 1;
        //1 - false 
        //2 - true 
        var cat_docelec         = '';
        var incent_fiscai       = '';
        var id_inc_fiscai       = ''; 
        var modo                = '';
        var type_transaction    = '';
        
        function onPageInit(context)
        {
            //SEGMENTACION PARA PEDIDOS DE VENTAS
            var currentRecord   = context.currentRecord;
            var tip_tran        = currentRecord.getValue({fieldId:'type'});
            var val_form        = currentRecord.getValue({fieldId:'customform'});            
            modo = context.mode;

            if( tip_tran == 'salesord' && val_form == '441' )
            {
                //currentRecord.setValue({ fieldId: 'custbody_brl_tran_l_def_edoc_category', value: 'Documento fiscal eletrônico de produtos', ignoreFieldChange: true }); 
                nlapiSetFieldValue('custpage_brl_tran_l_def_edoc_category', '1');
                currentRecord.getField({fieldId: 'custpage_brl_tran_l_def_edoc_category'}).isDisabled = true;
            } 
            if( tip_tran == 'salesord' && val_form == '445' )
            {
                //currentRecord.setValue({ fieldId: 'custbody_brl_tran_l_def_edoc_category', value: 'Documento fiscal eletrônico de produtos', ignoreFieldChange: true }); 
                nlapiSetFieldValue('custpage_brl_tran_l_def_edoc_category', '2');
                currentRecord.getField({fieldId: 'custpage_brl_tran_l_def_edoc_category'}).isDisabled = true;
            }   

            if( tip_tran == 'salesord' )
            {
                var id_natoper = currentRecord.getValue({fieldId:'custpage_brl_tran_l_transaction_nature'});  
            
                var objnatoper = search.lookupFields({
                    type: 'customrecord_brl_tran_nature',
                    id: id_natoper,
                    columns: ['custrecord_nch_tran_natureza_net']
                });;
                        
                var nao_tran  = objnatoper.custrecord_nch_tran_natureza_net[0].value;

                nlapiSetFieldValue('custbody_nch_natope_trans_netsuite', nao_tran );
            }

            return true;
        }

        function onChangeField(context)
        {
            //LOGICA PARA SUGERENCIA DE CFOP BR
            //ACTUALIZACION LUN 08 OCTUBRE 2024
            var currentRecord       = context.currentRecord;
            var sublistName         = context.sublistId;
            var sublistFieldName    = context.fieldId;
            var Active_line         = context.line;
            var id_customer         = currentRecord.getValue({fieldId:'entity'});
            var flag_cest_st        = 1;
            var regr_cest_st        = 1;  
            var flag_seg_cimp       = 1;   
            var id_natoper = currentRecord.getValue({fieldId:'custpage_brl_tran_l_transaction_nature'}); 
            
            if( context.fieldId == 'custpage_brl_tran_l_transaction_nature' && (id_natoper != '' && id_natoper != null ))
            {                
            
                var objnatoper = search.lookupFields({
                    type: 'customrecord_brl_tran_nature',
                    id: id_natoper,
                    columns: ['custrecord_nch_tran_natureza_net']
                });;

                if( objnatoper.custrecord_nch_tran_natureza_net.length > 0)
                {
                    var nao_tran  = objnatoper.custrecord_nch_tran_natureza_net[0].value;

                    nlapiSetFieldValue('custbody_nch_natope_trans_netsuite', nao_tran );
                }
                        
                
            }
                            
            //CARGA DATA UNICAMENTE PARA PRODUCTOS
            if( context.fieldId == 'custbody_nch_finalidad_br' )
            {               
                //Documento fiscal eletrônico de produtos -> 1
                //Documento fiscal eletrônico de serviços -> 2
                //EXCEPCION PARA OUTBOUND DELIVERY 01.04.2025
                cat_docelec         = currentRecord.getValue({fieldId:'custpage_brl_tran_l_def_edoc_category'});
                type_transaction    = currentRecord.type;
                
                //TRANSACTION FIELDS                    
                Nat_Oper    = currentRecord.getValue({fieldId:'custpage_brl_tran_l_transaction_nature'});
                Fin_Oper    = currentRecord.getValue({fieldId:'custbody_nch_finalidad_br'});
                Nam_Oper    = currentRecord.getText({fieldId:'custbody_nch_finalidad_br'});

                //alert(Fin_Oper + ' | ' + Nam_Oper);

                //LOAD CUSTOMER FIELDS
                var objclie = search.lookupFields({
                    type: 'CUSTOMER',
                    id: id_customer,
                    columns: ['companyname', 'custentity_br_nao_contribu_icms', 'custentity_brl_entity_t_suframa_reg', 'custentity_nch_incent_fiscai']
                });;
                        
                var nao_contri_cli  = objclie.custentity_br_nao_contribu_icms[0].value;
                //var reg_suframa     = objclie.custentity_brl_entity_t_suframa_reg;
                    
                if( objclie.custentity_nch_incent_fiscai.length > 0 )
                {
                    id_inc_fiscai   = objclie.custentity_nch_incent_fiscai[0].value;
                    incent_fiscai   = objclie.custentity_nch_incent_fiscai[0].text;
                }

                //if( reg_suframa != '')
                //{
                    //flag_suframa = 2;
                //}

                //LOAD ESTADO EN DIRECCION DE ENVIO
                //MUDA LOGICA DE CAMPO CUSTOMFIELD TO STANDARFIELD 28.03.2025
                var subrecord = nlapiViewSubrecord('billingaddress');
                //state_bill = subrecord.getFieldValue('custrecord_statecode');
                state_bill = subrecord.getFieldValue('state');

                if( state_bill == '' || state_bill == null )
                {
                     alert('Valide o endereço de cobrança - status vazio');
                    return false;
                }

                //LOGICA PARA DESTINO RESULTADO
                //Si estado de Facturacion = SP then TRUE Else False
                if( state_bill === 'SP' )
                {
                    flag_UF = 2;
                }
                
                ///alert('UF Destino : ' + flag_UF );

                //EVALUACION PARA NAO CONTRIBUYENTE ICMS
                //Contribuinte ICMS = 1
                //Contribuinte IE = 2
                //Não Contribuinte = 3
                //CONDITION : IF Estado <> SP and Nao Contribuyuente ICMS = TRUE and FInalidad = Uso y Consumo then true else false
                if( state_bill != 'SP' && (nao_contri_cli == '2' || nao_contri_cli == '3') && Fin_Oper == '2' )
                {
                    flag_contri = 2;
                }

                ///alert('Nao Contribuyente ICMS : ' + flag_contri);
                
            }
                
            if (sublistName === 'item')
            {   
                //LOGICA PARA OBTENCION DE CFOP EN REGLAS DE PRODUCTOS
                if( sublistFieldName === 'item' && currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'item' }) != '' && (cat_docelec === '1' || type_transaction === 'customsale_brl_outbound_delivery') )
                {
                    //alert('REGLAS DE PRODUCTOS : ' + cat_docelec);
                    
                    //ITEMS FIELDS
                        id_item     = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'item' });
                    var id_tipro    = '';
                    var id_cest     = '';
                    var id_pmerc    = '';
                    var tipro_flag  = 1;
                    var flag_susti  = 1;
                    var id_tribipi  = '';
                    var flag_ipi    = 1;
                    var flag_cst55  = 1;
                    var flag_cst40  = 1;
                    
                    var objitem = search.lookupFields({
                        type: 'ITEM',
                        id: id_item,
                        columns: ['itemid', 'custitem_brl_l_cest_code', 'custitem_br_item_prodmerc', 'custitem_br_tipart', 'type', 'custitem_nch_sustituido_br', 'custitem_nch_tributa_ipi_53', 'custitem_nch_embala50_br', 'custitem_nch_seg_calc_imp_br']
                    });;
                    
                    itemid          = objitem.itemid;
                    itemtype        = objitem.type[0].value;
                    
                    if( itemtype != 'Service')
                    {
                        //REALIZA COMPARACION EN TABLA NCH Cest ST MW
                        //IF NATURALEZA OPERACION = NOTA FISCAL VENTA AND CEST ST = "S"
                        //IF State = SP and Finalidad = Revenda then TRUE Else IF State <> SP and Finalidad IN (Revenda,USO Consumo) then True ELSE FALSE
                        if( Nat_Oper === '108' && objitem.custitem_brl_l_cest_code.length > 0 )
                        {
                            id_cest = objitem.custitem_brl_l_cest_code[0].value;

                            var objCestST  = search.load({ id: 'customsearch_br_cest_st_mw' });
            
                            var filterArray = [];
                                filterArray.push(['custrecord_br_cest_uf','is', state_bill]);
                                filterArray.push('and');
                                filterArray.push(['custrecord_br_cest_cest','is', id_cest]);
                                filterArray.push('and');
                                filterArray.push(['custrecord_br_cest_st','is', 'T']);
                
                                objCestST.filterExpression = filterArray;
                                    
                            var arrResult = objCestST.run().getRange({ start: 0, end: 1 });
                                    
                            if( arrResult.length > 0 )
                            {                                
                                if ( state_bill === 'SP' && Nam_Oper === 'Revenda' )
                                {
                                    regr_cest_st = 2;
                                }
                                else if (state_bill != 'SP' && (Nam_Oper === 'Revenda' || Nam_Oper === 'Uso Consumo'))
                                {
                                    regr_cest_st = 2;
                                }
                                    
                            } 

                            ///alert('CEST ST : ' + regr_cest_st );
                        }
                        
                        //REALIZA COMPARACION EN TABLA NCH Cest ST MW
                        //IF NATURALEZA OPERACION = NOTA FISCAL VENTA then
                        //if [ITEM] - NCH SEGMENTO CALCULO IMPUESTO = Material Limpieza
                        //           IF com ST = S (evaluado UF CEST & com ST)
                        //             IF State <> SP and Finalidad = USO Consumo AND [ITEM] NCH EMBALAJE >50 then True ELSE false

                        if( Nat_Oper === '108' && objitem.custitem_brl_l_cest_code.length > 0 )
                        {
                            id_cest = objitem.custitem_brl_l_cest_code[0].value;
                            var seg_cimp = '';

                            if( objitem.custitem_nch_seg_calc_imp_br.length > 0 )
                            {
                                seg_cimp = objitem.custitem_nch_seg_calc_imp_br[0].text; //NCH Segmento Calculo Impuesto
                                //alert('seg_cimp ' + seg_cimp);
                            }

                            flag_SegCImp = objitem.custitem_nch_embala50_br; //NCH Embalaje > 50

                            ///alert('flag_SegCImp : ' + flag_SegCImp);

                            if( seg_cimp === 'Material Limpieza' )
                            {   
                                var obj_segCestST  = search.load({ id: 'customsearch_br_cest_st_mw' });
            
                                var filterArray = [];
                                    filterArray.push(['custrecord_br_cest_uf','is', state_bill]);
                                    filterArray.push('and');
                                    filterArray.push(['custrecord_br_cest_cest','is', id_cest]);
                                    filterArray.push('and');
                                    filterArray.push(['custrecord_br_cest_st','is', 'T']);
                    
                                    obj_segCestST.filterExpression = filterArray;
                                        
                                var arr_SegCImp = obj_segCestST.run().getRange({ start: 0, end: 1 });
                                        
                                if( arr_SegCImp.length > 0 )
                                {                                
                                    if (state_bill != 'SP' && Nam_Oper === 'Uso Consumo' && flag_SegCImp == true )
                                    {
                                        flag_seg_cimp = 2;
                                    }
                                        
                                } 
                            }        

                            ///alert('Segmento_CImpuesto  : ' + flag_seg_cimp );
                        }
                        
                        if( objitem.custitem_br_item_prodmerc.length > 0 )
                        {
                            id_pmerc        = objitem.custitem_br_item_prodmerc[0].value;//NCH PRODUCAO / MERCADORIA - 1.Mercadoria - 2.Producao

                            ///alert('NCH Producao / Mercadoria : ' + objitem.custitem_br_item_prodmerc[0].text);
                        }                        
                        
                        if( objitem.custitem_br_tipart.length > 0 )
                        {
                            //NCH TIPO PRODUCTO BR - CAMBIO DE EVALUACION A TRUE & FALSE
                            //IF Nat Operacion es Nota Fiscal de Venda y NCH TIPO PRODUCTO BR = Lubricantes C/ST then True Else False
                            // 108 - Nota Fiscal de Venda
                            // 1 - Lubricantes C/ST
                            id_tipro        = objitem.custitem_br_tipart[0].value;

                            if( Nat_Oper === '108' && id_tipro === '1' )
                            {
                                tipro_flag = 2;
                            }
                            
                        }
                        
                        //alert('Nat_Oper : ' + currentRecord.getText({fieldId:'custpage_brl_tran_l_transaction_nature'}) );
                        ///alert('Lubricantes C/ST : ' + tipro_flag );
                        ///alert('Incentivo Fiscai : ' + incent_fiscai);
                        //alert('Sustituido : ' + objitem.custitem_nch_sustituido_br);
                        

                        //If naturalez operacion es Nota Fiscal de Venda and If Sustituido = check AND INCENTIVO FISCAL = N/A  then True, else False
                        if( Nat_Oper === '108' && objitem.custitem_nch_sustituido_br === true && incent_fiscai == 'N/A' )
                        { 
                            flag_susti = 2;
                        }

                        ///alert('flag_susti : ' + flag_susti);

                        //IF NATURALEZA OPERACION - NOTA FISCAL  DE VENDA  & Campo Item - NCH Tributação IPI == IPI não tributado (53 - Saída não Tributada) then true else false
                        if( objitem.custitem_nch_tributa_ipi_53.length > 0 )
                        {
                            //NCH Tributação IPI 
                            // 1.IPI tributado (50 - Saída Tributada) - 2.IPI não tributado (53 - Saída não Tributada)
                            id_tribipi = objitem.custitem_nch_tributa_ipi_53[0].value;

                            if( Nat_Oper === '108' && id_tribipi === '2' )
                            {
                                flag_ipi = 2;
                            }    
                        } 
                        
                        ///alert('Tributação IPI  :' + flag_ipi);

                        //BUSCA REGLAS ASOCIADAS EN CLIENTES - NCH Mensagens Cliente BR
                        //if regla en cliente de suspencion DE IPI esta activa y campo impuesto = CST55 = true
                        //if regla en cliente de suspencion de ICMS  esta activa y campo impuesto = CST 40  = true
                        var fechaHoy        = new Date();
                        var diaHoy          = fechaHoy.getDate();
                        var mesHoy          = fechaHoy.getMonth() + 1; // enero = 0
                        var anoHoy          = fechaHoy.getFullYear();
                        var fechaFormatoHoy = diaHoy + '/' + ('00' + mesHoy).slice(-2) + '/' + anoHoy;
                        
                        //alert('fechaHoy :' + fechaFormatoHoy);

                        var objMenCli  = search.load({ id: 'customsearch_msg_cliente_br' });
            
                        var filterArray = [];
                            filterArray.push(['custrecord_nch_msg_cli','is', id_customer]);
                            filterArray.push('and');
                            filterArray.push(['isinactive','is', 'F']);
                            filterArray.push('and');
                            filterArray.push([["custrecord_nch_msg_dataini","onorbefore",fechaFormatoHoy],"AND",["custrecord_nch_msg_datafin","onorafter",fechaFormatoHoy]]);
            
                            objMenCli.filterExpression = filterArray;
                                
                        var arr_MenCli = objMenCli.run().getRange({ start: 0, end: 1 });

                        //alert('CUENTA MENSAJES : ' + arr_MenCli.length);
                                
                        if( arr_MenCli.length > 0 )
                        {
                            for (var i = 0; i < arr_MenCli.length; i++) 
                            {
                                var cst55 = arr_MenCli[i].getValue({
                                    name: 'custrecord_nch_msg_cst55'
                                    });
                                
                                //IF NATURALEZ OPERACION ES VENDA Y if regla en cliente de suspencion DE IPI esta activa y campo impuesto = CST55 = true
                                if( Nat_Oper === '108' && cst55 == true )
                                {
                                    flag_cst55 = 2;
                                }

                                var cst40 = arr_MenCli[i].getValue({
                                    name: 'custrecord_nch_msg_cst40'
                                    });

                                //if NATURALEZA OPERACION ES NOTA FISCAL DE VENTA & regla en cliente de suspencion de ICMS  esta activa y campo impuesto = CST 40  = true
                                if( Nat_Oper === '108' && cst40 == true )
                                {
                                    flag_cst40 = 2;
                                }                         

                            }
                        } 

                        ///alert('cst55 | cst40 ' + flag_cst55 + ' | ' + flag_cst40);
                        
                        //CARGA DE BUSQUEDA GUARDADA PARA COINCIDNCIA DE REGRAS CFOP - NCH Regras CFOP's (Script)
                        var objRegras  = search.load({ id: 'customsearch_regras_cfop_br' });
        
                        var filterArray = [];
                            filterArray.push(['custrecord_cfop_natoper','is', Nat_Oper]);//NATURALEZA DE OPERACION
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_item_prodmerc','is', id_pmerc]);//NCH PRODUCAO / MERCADORIA
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_destino_result','is', flag_UF]);//UF Destino Resultado
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_lubri_cst','is', tipro_flag]);//Lubricantes C/ST IN ITEM
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_sustituido','is', flag_susti]);//SUSTITUIDO IN ITEM
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_val_cest_st','is', regr_cest_st]);//VALIDATION CEST ST MW
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_val_emba_seg','is', flag_seg_cimp]);//Valida Embal_50 y SegCalcImp
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_nao_contribu','is', flag_contri]);//NAO CONTRIBUYENTE ICMS
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_incenti_fiscai','is', id_inc_fiscai]);//Incentivo Fiscai
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_finalidad_tra','is', Fin_Oper]);//FINALIDAD ON TRANSACTION   
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_tributa_ipi_53','is', flag_ipi]);//Tributação IPI  
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_suspende_ipi','is', flag_cst55]);//Suspencion IPI - CST 55
                            filterArray.push('and');
                            filterArray.push(['custrecord_cfop_suspende_icms','is', flag_cst40]);//Suspencion ICMS - CST 40          
            
                            objRegras.filterExpression = filterArray;
                                
                        var arr_regras = objRegras.run().getRange({ start: 0, end: 10 });

                        ///alert('CFOP Sugeridos : ' + arr_regras.length);
                                
                        if( arr_regras.length > 0 )
                        {
                            for (var i = 0; i < arr_regras.length; i++) 
                            {
                                id_CFOP_suger = arr_regras[i].getValue({
                                    name: 'custrecord_cfop_code_cfop'
                                    });
                                name_CFOP_suger = arr_regras[i].getText({
                                    name: 'custrecord_cfop_code_cfop'
                                    });

                                    ///alert('id_CFOP_suger | name_CFOP_suger :' + arr_regras.length + ' -> ' + id_CFOP_suger + ' | ' + name_CFOP_suger);
                            }

                            //alert('id_CFOP_suger | name_CFOP_suger :' + arr_regras.length + ' -> ' + id_CFOP_suger + ' | ' + name_CFOP_suger);
                            
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_ftebr_l_cfop_code',                        
                                value: id_CFOP_suger
                            });
                        }
                    }                    
                        
                }
                    
                 //LOGICA PARA OBTENCION DE CFOP EN REGLAS DE SERVICIOS
                 cat_docelec = currentRecord.getValue({fieldId:'custpage_brl_tran_l_def_edoc_category'});

                if( sublistFieldName === 'item' && currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'item' }) != '' && cat_docelec === '2')
                {
                    //alert('REGLAS DE SERVICOS : ' + cat_docelec);
                    
                    //ITEMS FIELDS
                    id_item    = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'item' });                            
                    
                    var objitem = search.lookupFields({
                        type: 'ITEM',
                        id: id_item,
                        columns: ['itemid', 'type']
                    });
                    
                    itemid          = objitem.itemid;
                    itemtype        = objitem.type[0].value;

                    //CUSTOMER FIELDS                            
                    var objcustomer = search.lookupFields({
                        type: 'CUSTOMER',
                        id: id_customer,
                        columns: ['entityid', 'custentity_nch_cat_reg_br']
                    });
                    
                    cust_id          = objcustomer.entityid;
                    cust_category    = objcustomer.custentity_nch_cat_reg_br.length > 0 ? objcustomer.custentity_nch_cat_reg_br[0].value : ''; 

                    Nat_Oper    = currentRecord.getValue({fieldId:'custpage_brl_tran_l_transaction_nature'});
                    
                    if( itemtype == 'Service')
                    {
                        //CARGA DE BUSQUEDA GUARDADA PARA COINCIDeNCIA DE REGRAS CFOP - NCH Regras Serviços CFOP's
                        var objRegras_serv  = search.load({ id: 'customsearch_regras_cfop_servicio_br' });
        
                        var filterArray = [];
                            filterArray.push(['custrecord_cfop_serv_natoper','is', Nat_Oper]);//NATURALEZA DE OPERACION
                            if( cust_category != '' )
                            {
                                filterArray.push('and');
                                filterArray.push(['custrecord_cfop_serv_category','is', cust_category]);//CATEGORIA CLIENTE
                            }
                            else
                            {
                                filterArray.push('and');
                                filterArray.push(['custrecord_cfop_serv_category','is', '@NONE@']);
                            }
            
                            objRegras_serv.filterExpression = filterArray;
                                
                        var arr_regras = objRegras_serv.run().getRange({ start: 0, end: 1 });
                                
                        if( arr_regras.length > 0 )
                        {
                            for (var i = 0; i < arr_regras.length; i++) 
                            {
                                id_CFOP_suger = arr_regras[i].getValue({
                                    name: 'custrecord_cfop_serv_cfop'
                                    });
                                name_CFOP_suger = arr_regras[i].getText({
                                    name: 'custrecord_cfop_serv_cfop'
                                    });
                            }
                            
                            //alert('id_CFOP_suger | name_CFOP_suger :' + arr_regras.length + ' -> ' + id_CFOP_suger + ' | ' + name_CFOP_suger);
                            
                            currentRecord.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_ftebr_l_cfop_code',                        
                                value: id_CFOP_suger
                            });
                        }
                    }                    
                            
                }
                    
            }   

            // Valida datos del cliente con el CNPJ
            if (context.fieldId == 'entity') {
                var hayCliente = currentRecord.getValue({
                    fieldId: 'entity'
                });

                var objCliente = search.lookupFields({
                    type: 'CUSTOMER',
                    id: id_customer,
                    columns: ['isperson']
                });

                var tipoPersona = objCliente.isperson;

                // Solo entra a CNPJ si es persona jurídica
                if (!tipoPersona) {
                    if ((modo == 'create' || modo == 'copy') && hayCliente != '') {
                        ValidaCNPJ(currentRecord);
                    }
                }
            }
                
            return true;
        }

        function cfop_produtos(context)
        {
            
            return true;
        }
        
        function onValidateLine(context) 
        {
            var currentRecord = context.currentRecord;
            var sublistaID = context.sublistId;            

            if (sublistaID == 'item') 
            {
                var idItem = currentRecord.getCurrentSublistValue({ sublistId: sublistaID, fieldId: 'item' });
                var objItem = search.lookupFields({ type: search.Type.ITEM, id: idItem, columns: ['weight', 'custitem_nch_peso_bruto_br'] });
                var pesnet = objItem.weight;
                var pesbru = objItem.custitem_nch_peso_bruto_br;

                var quantitylin = currentRecord.getCurrentSublistValue({ sublistId: sublistaID, fieldId: 'quantity' });

                var lin_pesnet = quantitylin * pesnet;
                var lin_pesbru = quantitylin * pesbru;

                //alert('quantitylin | pesnet | pesbru' + quantitylin + ' | ' + pesnet + ' | ' + pesbru);
                //alert('lin_pesnet | lin_pesbru ' + lin_pesnet + ' | ' + lin_pesbru);

                currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_nch_peso_neto_br',
                    value: parseFloat(lin_pesnet).toFixed(2)
                });

                currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_nch_peso_bruto_br',
                    value: parseFloat(lin_pesbru).toFixed(2)
                });              

            }

            return true;

        }

        function onSaveRecord(context) 
        {
            try {

                var currentRecord = context.currentRecord;
                var numItems = currentRecord.getLineCount('item');

                var Val_PesNet = 0;
                var Val_PesBru = 0;

                //alert('numItems' + numItems);

                for (var i = 0; i < numItems; i++) {
                    var imp_pesnet = currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_nch_peso_neto_br', line: i });
                    var imp_pesbru = currentRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_nch_peso_bruto_br', line: i });

                    Val_PesNet += parseFloat(imp_pesnet);
                    Val_PesBru += parseFloat(imp_pesbru);

                }

                currentRecord.setValue({ fieldId: 'custbody_brl_tran_n_ship_info_net_wt', value: Val_PesNet.toFixed(2), ignoreFieldChange: true });
                currentRecord.setValue({ fieldId: 'custbody_brl_tran_n_ship_info_gross_wt', value: Val_PesBru.toFixed(2), ignoreFieldChange: true });

                return true;

            } catch (e) {
                console.log(e);
                Dialog('Ocurrió una excepción al Guardar Transaccion.', 'SaveRecord!');
                return false;
            }
        }


        function Dialog(mensaje, titulo) 
        {
            titulo || (titulo = '&iexcl;Aviso!')

            if (String(mensaje).trim() == '')
                return;

            var options = {
                title: titulo,
                message: mensaje
            };
            dialog.alert(options);
        }

        function ValidaCNPJ(currentRecord) 
        {
            try {
                var mensajesCNPJ = '';

                var clienteId = currentRecord.getValue({
                    fieldId: 'entity'
                });

                var cnpjN = '', situacaoN = '', nomeN = '', fantasiaN = '', cnaeCodeN = '', natureza_juridicaN = '', emailN = '', telefoneN = '';
                var internalIdDireccion = 0;
                var logradouroN = '', numeroN = '', complementoN = '', cepN = '', bairroN = '', municipioN = '', ufN = '';

                /* var tex = ' this0' + '|' + currentRecord + '|' + currentRecord.getValue({fieldId:'entity'}) + '|' + 'subsidiariaPresentacion';
                log.debug({ title: 'instance', details: tex }); */

                // Lee campos de cliente Netsuite
                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            ["internalidnumber",
                                "equalto",
                                clienteId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "internalid"
                            }),
                            search.createColumn({
                                name: "custentity_nch_vatregnumber"
                            }),
                            search.createColumn({
                                name: "custentity_nch_situacion_catastral_br"
                            }),
                            search.createColumn({
                                name: "altname"
                            }),
                            search.createColumn({
                                name: "custentity_nch_nombre_comercial"
                            }),
                            search.createColumn({
                                name: "custentity_nch_code_cnae"
                            }),
                            search.createColumn({
                                name: "custentity_nch_customer_cod_natjur"
                            }),
                            search.createColumn({
                                name: "internalid",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "addressinternalid",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "address1",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "address3",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "custrecord_brl_addrform_t_complement",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "zipcode",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "address2",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "city",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "custrecord_brl_addr_form_city",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "state",
                                join: "billingAddress"
                            }),
                            search.createColumn({
                                name: "email"
                            }),
                            search.createColumn({
                                name: "phone"
                            })
                        ]
                });

                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count", searchResultCount);
                customerSearchObj.run().each(function (result) {
                    cnpjN = result.getValue({
                        name: 'custentity_nch_vatregnumber'
                    });
                    situacaoN = result.getText({
                        name: 'custentity_nch_situacion_catastral_br'
                    });
                    nomeN = result.getValue({
                        name: 'altname'
                    });
                    fantasiaN = result.getValue({
                        name: 'custentity_nch_nombre_comercial'
                    });
                    cnaeCodeN = result.getText({
                        name: 'custentity_nch_code_cnae'
                    });
                    natureza_juridicaN = result.getText({
                        name: 'custentity_nch_customer_cod_natjur'
                    });
                    emailN = result.getValue({
                        name: 'email'
                    });
                    // telefoneN = result.getText({
                    telefoneN = result.getValue({
                        name: 'phone'
                    });

                    // Dirección
                    logradouroN = result.getValue({
                        name: "address1",
                        join: "billingAddress"
                    });
                    numeroN = result.getValue({
                        name: 'address3',
                        join: "billingAddress"
                    });
                    complementoN = result.getValue({
                        name: 'custrecord_brl_addrform_t_complement',
                        join: "billingAddress"
                    });
                    cepN = result.getValue({
                        name: 'zipcode',
                        join: "billingAddress"
                    });
                    bairroN = result.getValue({
                        name: 'address2',
                        join: "billingAddress"
                    });
                    municipioN = result.getValue({
                        name: 'city',
                        join: "billingAddress"
                    });
                    ufN = result.getValue({
                        name: 'state',
                        join: "billingAddress"
                    });

                    return true;
                });

                // Lee página
                var leerPaginaCNPJCom = ObtieneJSONCNPJ(cnpjN);

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
                                    id: clienteId
                                });

                                rec.setText({
                                    fieldId: 'custentity_nch_situacion_catastral_br',
                                    // text: 'INAPTA'
                                    text: situacaoRevisa
                                });

                                rec.save();

                                // Se limpia cliente para no avanzar con la transacción
                                currentRecord.setValue({
                                    fieldId: 'entity',
                                    value: ''
                                });
                            }
                        }

                        function failure(reason) { console.log('Failure: ' + reason) }

                        var tipo = currentRecord.getValue({
                            fieldId: 'type'
                        });

                        var transaccion = '';

                        switch (tipo) {
                            case 'salesorder':
                            case 'salesord':
                                transaccion = 'Pedido de venda'
                                break;
                            case 'invoice':
                            case 'custinvc':
                                transaccion = 'Documento fiscal'
                                break;
                            case 'estimate':
                                transaccion = 'Estimativa'
                                break;
                            default:
                                transaccion = 'Transação'
                                break;
                        };

                        dialog.alert({
                            title: 'Erro!',
                            message: 'O status cadastral (' + cnpjRevisa + ') do cliente ' + nomeRevisa + ' é ' + situacaoRevisa + '. ' +
                                '<br /><br />Não é possível fazer a ' + transaccion + '.'
                        }).then(ok).catch(failure);

                        return mensajesCNPJ;
                    } else {
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

                        telefoneN = (telefoneN.length > 15)
                            ? telefoneN.replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '').replaceAll('-', '').replaceAll('/', '') : telefoneN.substring(3);
                        telefoneRevisa = telefoneRevisa.replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '').replaceAll('-', '').replaceAll('/', '');

                        // Compara los resultados
                        mensajesCNPJ = (situacaoN == situacaoRevisa) ? '' : '<p>Existem diferenças no Situação cadastral, Netsuite: ' + situacaoN +
                            ' vs URL Receita: ' + situacaoRevisa + '</p>';
                        mensajesCNPJ += (nomeN == nomeRevisa) ? '' : '<p>Existem diferenças no Nome, Netsuite: ' + nomeN +
                            ' vs URL Receita: ' + nomeRevisa + '</p>';
                        mensajesCNPJ += (fantasiaN == fantasiaRevisa) ? '' : '<p>Existem diferenças no Nome fantasia, Netsuite: ' + fantasiaN +
                            ' vs URL Receita: ' + fantasiaRevisa + '</p>';
                        mensajesCNPJ += (telefoneN == telefoneRevisa) ? '' : '<p>Existem diferenças no Telefone, Netsuite: ' + telefoneN +
                            ' vs URL Receita: ' + telefoneRevisa + '</p>';
                        mensajesCNPJ += (emailN == emailRevisa) ? '' : '<p>Existem diferenças no Email, Netsuite: ' + emailN +
                            ' vs URL Receita: ' + emailRevisa + '</p>';
                        mensajesCNPJ += (cnaeCodeN == cnaeRevisa) ? '' : '<p>Existem diferenças no Code CNAE, Netsuite: ' + cnaeCodeN +
                            ' vs URL Receita: ' + cnaeRevisa + '</p>';
                        mensajesCNPJ += (natureza_juridicaN == natureza_juridicaRevisa) ? '' :
                            '<p>Existem diferenças no Natureza Juridica, Netsuite: ' + natureza_juridicaN + ' vs URL Receita: ' + natureza_juridicaRevisa
                        mensajesCNPJ = (mensajesCNPJ != '') ? mensajesCNPJ +
                            '<br />Você quer atualizar os dados?<br />Se você clicar em sim, eles serão atualizados automaticamente no registro do cliente.'
                            : '';

                        municipioN = municipioN.toLowerCase();
                        municipioRevisa = municipioRevisa.toLowerCase();
                        cepN = cepN.replace('.', '').replace('-', '');
                        cepRevisa = cepRevisa.replace('.', '').replace('-', '');

                        // Compara los resultados dirección
                        mensajesDireccionCNPJ = (logradouroN == logradouroRevisa) ? '' : '<p>Logradouro, Netsuite: ' + logradouroN +
                            ' vs URL Receita: ' + logradouroRevisa + '</p>';
                        mensajesDireccionCNPJ += (numeroN == numeroRevisa) ? '' : '<p>Número, Netsuite: ' + numeroN +
                            ' vs URL Receita: ' + numeroRevisa + '</p>';
                        mensajesDireccionCNPJ += (bairroN == bairroRevisa) ? '' : '<p>Bairro, Netsuite: ' + bairroN +
                            ' vs URL Receita: ' + bairroRevisa + '</p>';
                        // mensajesDireccionCNPJ += (municipioN == municipioRevisa) ? '' : '<p>Cidade, Netsuite: ' + municipioN +
                        //     ' vs URL Receita: ' + municipioRevisa + '</p>';
                        mensajesDireccionCNPJ += (ufN == ufRevisa) ? '' : '<p>Estado, Netsuite: ' + ufN + ' vs URL Receita: ' + ufRevisa + '</p>';
                        mensajesDireccionCNPJ += (cepN == cepRevisa) ? '' : '<p>Cep, Netsuite: ' + cepN + ' vs URL Receita: ' + cepRevisa + '</p>';
                        mensajesDireccionCNPJ = (mensajesDireccionCNPJ != '') ? mensajesDireccionCNPJ +
                            '<br />Atualize as informações de endereço no registro do cliente, se necessário.' : '';

                        if (mensajesCNPJ.length > 0) {
                            // Si es clic en OK
                            function si(clicSi) {
                                if (clicSi) {
                                    try {
                                        // Colocar los valores nuevos del JSON en el cliente
                                        var recCus = record.load({
                                            type: record.Type.CUSTOMER,
                                            id: clienteId
                                        });

                                        if ((situacaoN != situacaoRevisa)) {
                                            recCus.setText({
                                                fieldId: 'custentity_nch_situacion_catastral_br',
                                                text: situacaoRevisa
                                            });
                                        };
                                        if ((nomeN != nomeRevisa)) {
                                            recCus.setValue({
                                                fieldId: 'companyname',
                                                value: nomeRevisa
                                            });
                                        };
                                        if ((fantasiaN != fantasiaRevisa)) {
                                            recCus.setValue({
                                                fieldId: 'custentity_nch_nombre_comercial',
                                                value: fantasiaRevisa
                                            });
                                        };
                                        if ((telefoneN != telefoneRevisa)) {
                                            recCus.setValue({
                                                fieldId: 'phone',
                                                value: telefoneRevisa
                                            });
                                        };
                                        if ((emailN != emailRevisa)) {
                                            /* recCus.setValue({
                                                fieldId: 'email',
                                                value: emailRevisa
                                            }); */
                                        };
                                        if ((cnaeCodeN != cnaeRevisa)) {
                                            recCus.setText({
                                                fieldId: 'custentity_nch_code_cnae',
                                                text: cnaeRevisa
                                            });
                                        };
                                        if ((natureza_juridicaN != natureza_juridicaRevisa)) {
                                            recCus.setText({
                                                fieldId: "custentity_nch_customer_cod_natjur",
                                                text: natureza_juridicaRevisa
                                            });
                                        };

                                        if (!recCus.getValue('custrecord_psg_ei_email_recipient_cont')) {
                                            recCus.setValue({
                                                fieldId: 'custrecord_psg_ei_email_recipient_cont',
                                                value: 25096
                                            });
                                        }

                                        recCus.save({
                                            // enableSourcing: true,
                                            // ignoreMandatoryFields: true
                                        });
                                    } catch (error) {
                                        var uno = error;
                                    }
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
                }
                else {
                    dialog.alert({
                        title: 'Erro!',
                        message: 'Erro ao ler a página do CNPJ ' +
                            error.lineNumber + '|' + 'leerPaginaCNPJCom'
                    });
                }

                return mensajesCNPJ;
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

        return {
            pageInit      : onPageInit,
            saveRecord: onSaveRecord,
            fieldChanged  : onChangeField   ,
            //validateField : onValidateField ,
            //validateDelete: onDeleteLine    ,
            validateLine: onValidateLine
            //validateInsert: onValidateInsert ,
            //sublistChanged: onSublistChanged,

        };
    }); 