/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
 define(['N/ui/dialog', 'N/ui/message','N/record', 'N/runtime', 'N/search'],

 function(dialog, message, record, runtime, search) 
 {
    var entryPoint          = '';
    var tip_pag_cnab_load    = '';
     
     function onPageInit( context )
     {

        var currentRecord   = context.currentRecord;
            modo            = context.mode;
        var idSubsidiaria   = currentRecord.getValue({fieldId:'subsidiary'});
        var idVendor        = currentRecord.getValue({fieldId:'entity'});

        /*if( idSubsidiaria === '20')
        {
            if( idVendor )
            {
                var objVendor       = search.lookupFields({type:search.Type.VENDOR, id:idVendor, columns:['custentity_psg_ei_entity_edoc_standard']});
                var largoobje       = objVendor.custentity_psg_ei_entity_edoc_standard.length;

                if( largoobje > 0 )
                {
                    var dataPaquete     = objVendor.custentity_psg_ei_entity_edoc_standard[0].value;  

                    if( dataPaquete )
                    {
                        currentRecord.setValue({fieldId: 'custbody_nbl_cf_documentoequivalente', value: true});
                    }
                }
                
            }
        } */
        
        //LOGICA PARA TRAER TODOS LOS DATOS PERO SOLO PARA PRAZOS QUE NO GENERAN INSTALLMENTS
        //LOGICA PARA EXTRACCION DE DATA FROM FORNECEDOR PARA PAGAMENTO CNAB
        //SOLO PARA BRASIL
        if( idSubsidiaria === '3')
        {
            var val_prazo       = currentRecord.getValue({fieldId: 'terms'});
            var objPrazo        = search.lookupFields({type: search.Type.TERM, id: val_prazo, columns:['name','installment'] });
            var tex_prazo       = objPrazo.name;
            var check_prazo     = objPrazo.installment;

            //alert('val_prazo | tex_prazo | check_prazo' + val_prazo + ' - ' + tex_prazo + ' - ' + check_prazo );

            if( check_prazo == false)
            {
                if( currentRecord.getValue({fieldId: 'entity'}) != '' )
                {
                    var val_fun  = currentRecord.getValue({fieldId: 'entity'});
                    var ObjFun   = search.lookupFields({type:search.Type.VENDOR, 
                                    id:val_fun, 
                                    columns:['custentity_brl_entity_l_def_pay_method']});

                    var met_pay  = ObjFun.custentity_brl_entity_l_def_pay_method[0].value;

                    currentRecord.setValue({fieldId: 'custbody_brl_tran_l_payment_method', value: met_pay});
                    
                }
         
                //OBTIENE VALORES EN TABLA INFORMACOES BANCARIAS MARCADA COMO DEFAULT (NCH Informações bancárias BR)
                var objInfBank   = search.load({ id: 'customsearch_nch_list_inf_bank_subsi' });
    
                var filterBank = [];
                    filterBank.push(['custrecord_nch_br_pref_bank','is', true]);
    
                    objInfBank.filterExpression = filterBank;
                        
                var arrResult_2 = objInfBank.run().getRange({ start: 0, end: 1 });
                        
                for (var i = 0; i < arrResult_2.length; i++) 
                {
                    var id_bank = arrResult_2[i].getValue({
                        name: 'internalid'
                    });
                    
                    var nome_bank = arrResult_2[i].getText({
                        name: 'custrecord_brl_bnkginf_l_bank'
                    });
                                          
                }

                //OBTIENE VALORES DE PREFERENCIAS DE PAGAMENTO EN FORNECEDOR EN BUSQUEDA NCH Prefer pagto do fornecedor
                var id_forn         = currentRecord.getValue({fieldId: 'entity'});
                var objFornecedor   = search.load({ id: 'customsearch_nch_list_pag_forn_br' });
    
                var filterArray = [];
                    filterArray.push(['custrecord_brl_venpaytpref_l_vendor','anyof', id_forn]);
                    filterArray.push('and');
                    filterArray.push(['custrecord_brl_venpaytpref_f_default','is', 'T']);
    
                    objFornecedor.filterExpression = filterArray;
                        
                var arrResult = objFornecedor.run().getRange({ start: 0, end: 1 });
                        
                if( arrResult.length > 0 )
                {
                    for (var i = 0; i < arrResult.length; i++) 
                    {
                        tip_pag_cnab_load = arrResult[i].getValue({
                            name: 'custrecord_nch_vendor_type_payment_br' 
                        });
                            
                        var tip_serv_cnab = arrResult[i].getValue({
                            name: 'custrecord_nch_vendor_type_service_br'
                        });
    
                        var fin_ted_cnab = arrResult[i].getValue({
                            name: 'custrecord_nch_vendor_ted_purpose_br'
                        });
    
                        var cam_cent_cnab = arrResult[i].getValue({
                            name: 'custrecord_nch_br_cam_cent_cnab'
                        });
                            
                    } 
                } 

                //alert('tip_pag_cnab : ' + tip_pag_cnab_load);
                                
                currentRecord.setValue({fieldId: 'custbody_brl_tran_l_subs_bank_info'   , value: id_bank});
                //currentRecord.setValue({fieldId: 'custbody_brl_tran_l_type_of_payment'  , value: tip_pag_cnab, ignoreFieldChange: true});
                currentRecord.setValue({fieldId: 'custbody_brl_tran_l_type_of_service'  , value: tip_serv_cnab});
                currentRecord.setValue({fieldId: 'custbody_brl_tran_l_cent_clear_house' , value: cam_cent_cnab});
                currentRecord.setValue({fieldId: 'custbody_brl_tran_l_ted_purpose'      , value: fin_ted_cnab});

            }

        }
       
       return true;

     }

     function fieldChanged(context, fieldId, name)
     {
         var currentRecord = context.currentRecord;
         
         if( context.fieldId == 'terms' )
         {
             //OBTIENE VALORES DE PREFERENCIAS DE PAGAMENTO EN FORNECEDOR EN BUSQUEDA NCH Prefer pagto do fornecedor
             var id_forn         = currentRecord.getValue({fieldId: 'entity'});
             var objFornecedor   = search.load({ id: 'customsearch_nch_list_pag_forn_br' });
 
             var filterArray = [];
                 filterArray.push(['custrecord_brl_venpaytpref_l_vendor','anyof', id_forn]);
                 filterArray.push('and');
                 filterArray.push(['custrecord_brl_venpaytpref_f_default','is', 'T']);
 
                 objFornecedor.filterExpression = filterArray;
                     
             var arrResult = objFornecedor.run().getRange({ start: 0, end: 1 });
                     
             if( arrResult.length > 0 )
             {
                 for (var i = 0; i < arrResult.length; i++) 
                 {
                     var tip_pag_cnab = arrResult[i].getValue({
                         name: 'custrecord_nch_vendor_type_payment_br'
                     });
                         
                     var tip_serv_cnab = arrResult[i].getValue({
                         name: 'custrecord_nch_vendor_type_service_br'
                     });
 
                     var fin_ted_cnab = arrResult[i].getValue({
                         name: 'custrecord_nch_vendor_ted_purpose_br'
                     });
 
                     var cam_cent_cnab = arrResult[i].getValue({
                         name: 'custrecord_nch_br_cam_cent_cnab'
                      });
                         
                 } 
             }            
 
             //OBTIENE VALORES EN TABLA INFORMACOES BANCARIAS MARCADA COMO DEFAULT (NCH Informações bancárias BR)
             var objInfBank   = search.load({ id: 'customsearch_nch_list_inf_bank_subsi' });
 
             var filterBank = [];
                 filterBank.push(['custrecord_nch_br_pref_bank','is', true]);
 
                 objInfBank.filterExpression = filterBank;
                     
             var arrResult_2 = objInfBank.run().getRange({ start: 0, end: 1 });
                     
             for (var i = 0; i < arrResult_2.length; i++) 
             {
                 var id_bank = arrResult_2[i].getValue({
                     name: 'internalid'
                 });
                 
                 var nome_bank = arrResult_2[i].getText({
                     name: 'custrecord_brl_bnkginf_l_bank'
                 });
                                          
             } 
 
             //alert(id_bank + ' - ' + nome_bank + ' - ' + cam_centr );
             
             var linea       = currentRecord.getLineCount('installment'); 
             
             for(var j = 0; j < linea; j++ )
             {                        
                 currentRecord.selectLine({sublistId:'installment', line: j});
                         
                 if( arrResult.length > 0 )
                 {
                     currentRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_type_payment',                        
                         value: tip_pag_cnab
                     });
 
                     currentRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_type_service',                        
                         value: tip_serv_cnab
                     });
 
                     currentRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_ted_purpose',                        
                         value: fin_ted_cnab
                     });

                     currentRecord.setCurrentSublistValue({
                        sublistId: 'installment',
                        fieldId: 'custrecord_brl_inst_l_cent_clear_house',                        
                        value: cam_cent_cnab
                     });
                 }                
                 
                  currentRecord.setCurrentSublistValue({
                     sublistId: 'installment',
                     fieldId: 'custrecord_brl_inst_l_subs_bank_info',                        
                     value: id_bank
                     });
 
                     entryPoint = currentRecord.getCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_vendor_paymt_pref'
                         });
                         
                     currentRecord.commitLine({
                     sublistId: 'installment'
                     });                     
                 
             }
                 
         }
 
         var sublistName         = context.sublistId;
         var sublistFieldName    = context.fieldId;
         var Active_line         = context.line;
 
         if(entryPoint.length > 0)
         {
             if (sublistName === 'installment' && sublistFieldName === 'custrecord_brl_inst_l_vendor_paymt_pref')
             {
                 var teste = currentRecord.getCurrentSublistValue({
                     sublistId: sublistName,
                     fieldId: sublistFieldName
                     })
                 
                 if ( ( teste.length > 0 ) && (teste != entryPoint) )
                 {
                     var objNewBank = search.lookupFields({
                             type: 'customrecord_brl_vendor_payment_prefer',
                             id: teste,
                             columns: ['custrecord_nch_vendor_type_payment_br','custrecord_nch_vendor_type_service_br','custrecord_nch_vendor_ted_purpose_br', 'custrecord_nch_br_cam_cent_cnab']
                         });
                     var new_tip_pag = objNewBank.custrecord_nch_vendor_type_payment_br[0].value;
                     var new_tip_ser = objNewBank.custrecord_nch_vendor_type_service_br[0].value;
                     var new_fin_ted = objNewBank.custrecord_nch_vendor_ted_purpose_br[0].value;
                     var new_cam_cen = objNewBank.custrecord_nch_br_cam_cent_cnab[0].value;
 
                     currentRecord.selectLine({sublistId:'installment', line: Active_line});
                     
                     currentRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_type_payment', 
                         value: new_tip_pag
                     });
 
                     currentRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_type_service',                        
                         value: new_tip_ser
                     });
 
                     currentRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_ted_purpose',                        
                         value: new_fin_ted
                     });
 
                     currentRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_cent_clear_house',                        
                         value: new_cam_cen
                     });
                 }
             }
         }

         if( context.fieldId == 'overrideinstallments' )
         {            
            if( currentRecord.getValue({fieldId: 'overrideinstallments'}) == true )
            {
                currentRecord.setValue({fieldId: 'custbody_nch_ejecute_script', value:true});
            }
            else
            {
                currentRecord.setValue({fieldId: 'custbody_nch_ejecute_script', value:false});
            }
         }

         if( context.fieldId == 'tranid' )
         {
            var tran_tippay = currentRecord.getValue({fieldId: 'custbody_brl_tran_l_payment_method'});

            if(tran_tippay.length > 0)
            {
                //alert('tip_pag_cnab : ' +tip_pag_cnab_load);
                currentRecord.setValue({fieldId: 'custbody_brl_tran_l_type_of_payment', value: tip_pag_cnab_load, ignoreFieldChange: true});
            } 
         }
 
     }
     
    function onValidateLine( context ) 
    {
         try
         {             
             var currentRecord = context.currentRecord;
             var sublistaID    = context.sublistId;
             var RecordType    = currentRecord.type;
             var idSubsidiaria = currentRecord.getValue({fieldId:'subsidiary'});
             var objSubsidiaria = search.lookupFields({type:search.Type.SUBSIDIARY, id:idSubsidiaria, columns:['country']});
             var pais = objSubsidiaria.country[0].value;    
             
             if( pais == 'MX')
             {

             if( RecordType == 'expensereport' && sublistaID == 'expense' )
             {

                 var valuuid   = currentRecord.getCurrentSublistValue({sublistId: sublistaID, fieldId: 'custcol_lmry_foliofiscal'});

                 if(valuuid.length != '36')
                 {
                     Dialog('La longitud del Folio Fiscal debe ser 36 digitos, favor de validar nuevamente');
                     return false;
                 }
                 else
                 {
                     var patron = /^[a-fA-F0-9\-]*$/;
                     var emo = patron.test(valuuid);
                 
                 if(!(emo))
                     {
                      Dialog('Formato de Folio Fiscal Invalido: Caracteres Alfanuméricos (del numero 0 al 9 y de la letra A a la F)');          
                      return false;
                     }                    
                 }

               }
             }               

             return true;

         }
         catch(e)
         {   
             console.log(e);
             Dialog('Ocurrió una excepción al realizar las validaciones de nueva linea: '+String(e),'Error!');
             return false;
         }
     }      

     function onSaveRecord(context) 
     {
         try
         {
             var Message = message.create({type:message.Type.INFORMATION, title:'Aviso', message:'Se están validando los datos introducidos, por favor espere.'});
             Message.show();

             var currentRecord = context.currentRecord;
             var RecordType    = currentRecord.type;
             var idSubsidiaria = currentRecord.getValue({fieldId:'subsidiary'});
             var objSubsidiaria = search.lookupFields({type:search.Type.SUBSIDIARY, id:idSubsidiaria, columns:['country']});
             var pais = objSubsidiaria.country[0].value;

             var transact = nlapiGetRecordType();
 
             if( pais == 'MX')
             {
                if( RecordType == 'vendorbill' )
                {
                    if( currentRecord.getValue({fieldId:'custbody_lmry_foliofiscal'}).length != '36' )
                    {
                        Dialog('La longitud del Folio Fiscal debe ser 36 digitos, favor de validar nuevamente');
                        return false;
                    }
                    else
                    {
                        var patron = /^[a-fA-F0-9\-]*$/;
                        var emo = patron.test(currentRecord.getValue({fieldId:'custbody_lmry_foliofiscal'}));
                        
                        if(!(emo))
                        {
                            Dialog('Formato de Folio Fiscal Invalido: Caracteres Alfanuméricos (del numero 0 al 9 y de la letra A a la F). Ejemplo: 4754BBB3-818E-42DD-AD63-760784F97CBB');          
                            return false;
                        }
                        
                    }
                    
                }
                
                if( RecordType == 'expensereport' )
                {
                    var numgasto = currentRecord.getLineCount({sublistId: 'expense'}); 
                    var fiscal;
                    
                    for (var i = 0; i < numgasto; i++) 
                    {
                        fiscal = currentRecord.getSublistValue({sublistId: 'expense', fieldId: 'custcol_lmry_foliofiscal', line: i});
                        
                        if( fiscal.length != '36' )
                        {
                            Dialog('La longitud del Folio Fiscal debe ser 36 digitos, favor de validar nuevamente');
                            return false;
                        }
                        else
                        {
                            var patron = /^[a-fA-F0-9\-]*$/;
                            var emo = patron.test(fiscal);
                            
                            if(!(emo))
                                {
                                    Dialog('Formato de Folio Fiscal Invalido: Caracteres Alfanuméricos (del numero 0 al 9 y de la letra A a la F). Ejemplo: 4754BBB3-818E-42DD-AD63-760784F97CBB');          
                                    return false;
                                }                            
                        }       
                    }
                } 

             } 

             if( pais == 'AR' )
             {
                 var ptoventa = currentRecord.getValue({fieldId:'custbody_serie_doc'});
                 var numdocum = currentRecord.getValue({fieldId:'custbody_numero_doc'});

                 currentRecord.setValue({fieldId: 'tranid', value: ptoventa + '-' + numdocum});
             }

             if( pais == 'CO' )
             {
                 var flagDS = currentRecord.getValue({fieldId:'custbody_nbl_cf_documentoequivalente'});
                 var Valfol = currentRecord.getValue({fieldId:'custbody_numero_doc'});

                 if( (modo == 'create' || modo == 'edit') && flagDS === true && (Valfol == '' || Valfol == null))
                 {
                     var getConsecutivo = guardarConsecutivo( currentRecord );
                     if( getConsecutivo.Error ) return false;
                 }

                 var CodigosFacturacion = getCodigoDistritoMunicipio(currentRecord, 'billaddresslist');
                 if(!CodigosFacturacion) return false;

                 currentRecord.setValue({fieldId:'custbody_nch_code_depto_fact_co', value:CodigosFacturacion.codigoDepartamento});
                 currentRecord.setValue({fieldId:'custbody_nch_code_municipio_fact_co', value:CodigosFacturacion.codigoMunicipio});

             }               

             return true;
             
         }catch(e){
             var options = {
                 title   : '¡Aviso!' ,
                 message : 'Ocurrió una excepción al realizar las validaciones de guardado del Cliente.'
             };
             console.log(e);
             dialog.alert(options);
             Message.hide();
             return false;
         }
       
     }

     function guardarConsecutivo( currentRecord ) 
     {
         try
         {
             var objRespuesta = {};
           
             var numsecuencia  = currentRecord.getValue({fieldId:'custbody_numero_doc'});
             var idSubsidiaria = currentRecord.getValue({fieldId:'subsidiary'});
             var idSerie       = currentRecord.getText({fieldId:'custbody_serie_doc_cxc'});
             var codDoc        = '05';

             if( !numsecuencia )
             {

                 var objSearchSecuencial = search.create({
                     type: 'customrecord_nch_num_consecutivo_latam',
                     filters: [
                             ['custrecord_transaction_id_latam','is', codDoc],
                             'and', ['custrecord_subsidiary_latam','is', idSubsidiaria],
                             'and', ['custrecord_serie_comprob_latam','is', idSerie]
                             ],
                     columns: [
                             {name: 'custrecord_number_latam'},
                             {name: 'custrecord_transaction_type_latam'},
                             {name: 'internalid'}]
                     });


                 var resultSet = objSearchSecuencial.run();
                 var objResultSecuencial = resultSet.getRange({start:0,end:1});


                 if( objResultSecuencial.length === 0 )
                     secuencial = 1;
                     
                 else
                 {
                     var anterior = objResultSecuencial[0].getValue({name:'custrecord_number_latam'});
                     var typeT    = objResultSecuencial[0].getText({name:'custrecord_transaction_type_latam'});
                     var idReg    = objResultSecuencial[0].getValue({name:'internalid'});
                     secuencial   = parseInt(anterior) + 1;
                     secuencial   = parseInt(secuencial, 10);
                     secuencial   = String(secuencial).split('.')[0];

                 }

                 if( parseInt(secuencial) > parseInt(anterior) )
                 {
                     var rectable = record.load({
                     type: 'customrecord_nch_num_consecutivo_latam',
                     id   : idReg
                     }); 

                     rectable.setValue({fieldId:'custrecord_number_latam', value: secuencial});
                     rectable.save();

                     currentRecord.setValue({fieldId:'custbody_numero_doc', value:secuencial});
                 } 

             }
             
             objRespuesta.Error = false;
         }
         catch(e)
         {
             console.log(e);
             Dialog('Ocurrió una excepción al obtener el número preimpreso.', 'Error!');
             objRespuesta.Error = true;
         }

         return objRespuesta;
     } 

     function getCodigoDistritoMunicipio( currentRecord, campo ) 
     {
         try
         {
             var objRespuesta = {};
             var idDireccion = currentRecord.getValue({ fieldId:campo });
             var idCliente   = currentRecord.getValue({ fieldId:'entity' });

             if( idDireccion != null && idDireccion != '' )
             {
                 var recordCliente = record.load({type:record.Type.VENDOR, id:idCliente, isDynamic:true});

                 var numeroLineaAddress = recordCliente.findSublistLineWithValue({sublistId:'addressbook', fieldId:'id', value:idDireccion});

                 var actualRecord         = recordCliente.selectLine({sublistId:'addressbook', line: numeroLineaAddress});
                 var subrecordAddressBook = actualRecord.getCurrentSublistSubrecord({sublistId:'addressbook', fieldId:'addressbookaddress'});
                 
                 var idDireccion = subrecordAddressBook.getValue({fieldId:'custrecord_nebula_ciudad_direcc'});
               
                 if(parseInt(idDireccion)>0)
                 {
                     //CARGA REGISTRO PERSONALIZADO Registro ciudades DE NBL
                     var RecordDireccion = record.load({type:'customrecord93', id:idDireccion});
                 
                     objRespuesta.codigoMunicipio    = RecordDireccion.getValue({fieldId:'custrecord_nb_cod_ciudad_dian'});
                     objRespuesta.codigoDepartamento = RecordDireccion.getValue({fieldId:'custrecord_nb_cod_dpto_dian'});
                 }
                 else
                 {
                     objRespuesta.codigoMunicipio    = '';
                     objRespuesta.codigoDepartamento = '';
                 }                   
                 
             }

             return objRespuesta;               

         }
         catch(error)
         {
             console.log(error)
             return false;
         }
     }       

     function Dialog(mensaje, titulo) 
     {
         titulo || (titulo = '¡Aviso!')
         
         if(String(mensaje).trim() == '')
             return;

         var options = {
             title   : titulo ,
             message : mensaje
         };
         dialog.alert(options);
     }

 return {
     //saveRecord    : onSaveRecord,
     //validateLine  : onValidateLine,
     pageInit      : onPageInit,
     fieldChanged  : fieldChanged
 };
});