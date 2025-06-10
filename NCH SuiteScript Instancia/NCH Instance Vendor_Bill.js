/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

 define(['N/search', 'N/record', 'N/format', 'N/runtime', 'N/currentRecord'],
 function(search, record, format, runtime, Record_after) 
 {
 
function beforeSubmit(context)
{
    var currentRecord   = context.newRecord;      	
    var val_tranid       = currentRecord.getValue({fieldId: 'tranid'});
    var val_fornec       = currentRecord.getValue({fieldId: 'entity'});
    var val_subsid       = currentRecord.getValue({fieldId: 'subsidiary'});

    var objSearchOC = search.create({
        type: search.Type.VENDOR_BILL,
        columns: [
            'internalid'
        ],
        filters: [
            ['subsidiary', 'is', val_subsid],
            'and', ['tranid', 'equalto', val_tranid],
            'and', ['entity', 'is', val_fornec]
        ]
    });

    var resultSetOC   = objSearchOC.run();
    var arrayResultOC = resultSetOC.getRange({start:0, end:10});        

   alert(arrayResultOC.length);
   return false;
}
    
function afterSubmit(context) 
 {
     try
     {        	
         var currentRecord   = context.newRecord;      	
         var eventype        = context.type;
         var cont_exe        = runtime.executionContext; // USERINTERFACE
         var trantype        = currentRecord.type;
         //var val_prazo     = currentRecord.getText({fieldId: 'terms'});
         var val_prazo       = currentRecord.getValue({fieldId: 'terms'});
         var flag_script     = currentRecord.getValue({fieldId: 'custbody_nch_ejecute_script'});

         var objPrazo        = search.lookupFields({type: search.Type.TERM, id: val_prazo, columns:['name','daysuntilnetdue'] });
         var tex_prazo       = objPrazo.name;
         var day_prazo       = objPrazo.daysuntilnetdue;

         log.error('RecordType | eventype | cont_exe | flag_script', trantype + ' | ' + eventype + ' | ' + cont_exe + ' | ' + flag_script );
         log.error('val_prazo | tex_prazo | day_prazo', val_prazo + ' - ' + tex_prazo + ' - ' + day_prazo );
         
        var Arr_Prazo = [];
        
        if ( tex_prazo.indexOf('-') > 0 )
        {
             var prazosSeparados = tex_prazo.split("-");
             var prazo = 0;             
 
             for (var i = 0; i < prazosSeparados.length; i++) 
             {
                 var element = prazosSeparados[i];
                 prazo = element.substring(0, 2);    //Considerando que solo hay días con 2 dígitos
 
                 Arr_Prazo.push( prazo );
             } 
        } 
        else
        {
            Arr_Prazo.push( day_prazo ); 
        }
        
        log.error('Arr_Prazo', Arr_Prazo.length + ' - ' + JSON.stringify(Arr_Prazo) );  
             
        if( cont_exe === 'USERINTERFACE' )
        {
            if( flag_script == false)
            {
                PrazosToData_UI(Arr_Prazo, currentRecord); 
            }   
        }
        else
        {
            if( flag_script == false)
            {
                PrazosToData_Dinamic(Arr_Prazo, currentRecord); 
            }
            else
            {
                UpdateToData_Dinamic(currentRecord);
            }    
        }
                                                      
           return true;

     }catch(e){
         log.error({
             title: 'Wrong on Try Catch VendorBill Instance Script.',
             details: e
             });
         
         return false;
     }        
 }

 //SOLO CALCULO DE LOGICA EN PRAZOS
 function PrazosToData_UI(Arr_Prazo, currentRecord) 
 {
     var data_flag         = '';
     var fechaInicial      = currentRecord.getValue({fieldId: 'trandate'});
     var data_autoriza     = currentRecord.getValue({fieldId: 'custpage_brl_tran_d_cert_date'});//SE CONSIDERA DATA DE AUTORIZACION
     
     var val_subsituye     = currentRecord.getValue({fieldId: 'overrideinstallments'});
     var tran_ID           = currentRecord.id;

     var InvoiceRecord = record.load({
         type: record.Type.VENDOR_BILL,
         id: tran_ID,
         isDynamic: true,
         });

     var linea             = InvoiceRecord.getLineCount('installment');

     log.error('val_subsituye - tran_ID', val_subsituye + ' - ' + tran_ID);        

     if( data_autoriza )
     {
         data_flag = data_autoriza;

         var dia     = data_flag.substring(0, 2);
         var mes     = data_flag.substring(3, 5);
         var ano     = data_flag.substring(6, 10);

         //log.error('dia - mes - ano ', dia + ' - ' + mes + ' - ' + ano );

     }
     else
     {
         data_flag = fechaInicial;
     } 
     
     log.error('data_flag is:',data_flag);
     
     var val_catdoc = currentRecord.getValue({fieldId: 'custpage_brl_tran_l_def_edoc_category'});

     log.error('val_catdoc is:',val_catdoc);
             
     for(var j = 0; j < linea; j++ )
     {
         for(var x = 0; x < Arr_Prazo.length; x++)
         {
             if( j === x )
             {
                 var num_prazo = Arr_Prazo[x];

                 var tranDate = ( data_flag.length > 0 ) ? new Date(ano, (mes)-1, dia) : new Date(data_flag);
                  
                        tranDate.setDate(tranDate.getDate() + parseInt(num_prazo, 10));
                   var fechaFinal = format.parse({value: tranDate, type: format.Type.DATE});

                   InvoiceRecord.selectLine({
                     sublistId : 'installment',
                     line : j
                 });
                 
                   InvoiceRecord.setCurrentSublistValue({
                     sublistId: 'installment', 
                     fieldId: 'duedate', 
                     value: fechaFinal
                 });

                //EXCLUSION PARA TRANSACCIONES WHERE CATEGORIA DO DOCUMENTO = Electronic Bill of Lading -> 301
                //SE BLANQUE COLUMNA INFORMAÇÕES BANCÁRIAS DA SUBSIDIÁRIA
                if( val_catdoc == 301 )
                {                                            
                    InvoiceRecord.setCurrentSublistValue({
                    sublistId: 'installment',
                    fieldId: 'custrecord_brl_inst_l_subs_bank_info',                        
                    value: ''
                     });
                    
                }

                   InvoiceRecord.commitLine({sublistId: 'installment'});
                                                             
                 log.error('Prazo | fechaFinal ', num_prazo + ' | ' + fechaFinal );
             }               
         }             
         
     }

     InvoiceRecord.save();

     return true;
 }

 //CALCULO DE LOGICA EN PRAZOS DE INSTALLMENT
 //ACTUALIZA INFORMACION DO PAGAMENTO
 function PrazosToData_Dinamic(Arr_Prazo, currentRecord) 
 {
     var data_flag         = '';
     var fechaInicial      = currentRecord.getValue({fieldId: 'trandate'});
     var data_autoriza     = currentRecord.getValue({fieldId: 'custpage_brl_tran_d_cert_date'});//SE CONSIDERA DATA DE AUTORIZACION
     var val_catdoc        = currentRecord.getValue({fieldId: 'custbody_brl_tran_l_def_edoc_category'});//CATEGORIA DO DOCUMENTO ELECTRONICO
     
     var val_subsituye     = currentRecord.getValue({fieldId: 'overrideinstallments'});
     var tran_ID           = currentRecord.id;

     var InvoiceRecord = record.load({
         type: record.Type.VENDOR_BILL,
         id: tran_ID,
         isDynamic: true,
         });

     var linea             = InvoiceRecord.getLineCount('installment');

     log.error('val_subsituye - tran_ID', val_subsituye + ' - ' + tran_ID);        

     if( data_autoriza )
     {
         data_flag = data_autoriza;

         var dia     = data_flag.substring(0, 2);
         var mes     = data_flag.substring(3, 5);
         var ano     = data_flag.substring(6, 10);

         //log.error('dia - mes - ano ', dia + ' - ' + mes + ' - ' + ano );

     }
     else
     {
         data_flag = fechaInicial;
     } 
     
     log.error('data_flag is:',data_flag);

     

     log.error('val_catdoc CSV is : ',val_catdoc);

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

             var cam_cen_cnab = arrResult[i].getValue({
                name: 'custrecord_nch_br_cam_cent_cnab'
            });
                 
         } 
     }

     //OBTIENE VALORES EN TABLA INFORMACOES BANCARIAS MARCADA COMO DEFAULT (NCH Informações bancárias BR)
     //EXCLUSION PARA TRANSACCIONES WHERE CATEGORIA DO DOCUMENTO = Electronic Bill of Lading -> 301
     //NO SE EJECUTA LA CARGA DE DATA PARA COLUMNA INFORMAÇÕES BANCÁRIAS DA SUBSIDIÁRIA
     var id_bank = '';
     if( val_catdoc != 301 )
    {
        var objInfBank   = search.load({ id: 'customsearch_nch_list_inf_bank_subsi' });

        var filterBank = [];
            filterBank.push(['custrecord_nch_br_pref_bank','is', true]);

            objInfBank.filterExpression = filterBank;
                
        var arrResult_2 = objInfBank.run().getRange({ start: 0, end: 1 });
                
        for (var i = 0; i < arrResult_2.length; i++) 
        {
                id_bank = arrResult_2[i].getValue({
                name: 'internalid'
            });
            
            var nome_bank = arrResult_2[i].getText({
                name: 'custrecord_brl_bnkginf_l_bank'
            });
                
            /*var cam_centr = arrResult_2[i].getValue({
                name: 'custrecord_nch_br_camara_central_cnab'
            });*/
                
        }
    } 

     //log.error('tip_pag_cnab - tip_serv_cnab ',tip_pag_cnab + ' - ' + tip_serv_cnab);
     //log.error('id_bank - cam_centr ',id_bank + ' - ' + cam_centr);
             
     for(var j = 0; j < linea; j++ )
     {
         for(var x = 0; x < Arr_Prazo.length; x++)
         {
             if( j === x )
             {
                 var num_prazo = Arr_Prazo[x];

                 var tranDate = ( data_flag.length > 0 ) ? new Date(ano, (mes)-1, dia) : new Date(data_flag);
                  
                        tranDate.setDate(tranDate.getDate() + parseInt(num_prazo, 10));
                 var fechaFinal = format.parse({value: tranDate, type: format.Type.DATE});

                   InvoiceRecord.selectLine({
                     sublistId : 'installment',
                     line : j
                     });
                 
                   InvoiceRecord.setCurrentSublistValue({
                     sublistId: 'installment', 
                     fieldId: 'duedate', 
                     value: fechaFinal
                     });

                     if( arrResult.length > 0 )
                     {
                         InvoiceRecord.setCurrentSublistValue({
                             sublistId: 'installment',
                             fieldId: 'custrecord_brl_inst_l_type_payment',                        
                             value: tip_pag_cnab
                         });

                         InvoiceRecord.setCurrentSublistValue({
                             sublistId: 'installment',
                             fieldId: 'custrecord_brl_inst_l_type_service',                        
                             value: tip_serv_cnab
                         });

                         InvoiceRecord.setCurrentSublistValue({
                             sublistId: 'installment',
                             fieldId: 'custrecord_brl_inst_l_ted_purpose',                        
                             value: fin_ted_cnab
                         });
                     } 
                     
                     InvoiceRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_cent_clear_house',                        
                         value: cam_cen_cnab
                     }); 
                     
                     InvoiceRecord.setCurrentSublistValue({
                         sublistId: 'installment',
                         fieldId: 'custrecord_brl_inst_l_subs_bank_info',                        
                         value: id_bank
                     });

                   InvoiceRecord.commitLine({sublistId: 'installment'});
                                                             
                log.error('Prazo | fechaFinal ', num_prazo + ' | ' + fechaFinal );
                 
             }               
         }             
         
     }

     InvoiceRecord.save();

     return true;
 }

 //SOLO ACTUALIZA INFORMACION DO PAGAMENTO
 function UpdateToData_Dinamic(currentRecord) 
 {     
     var val_subsituye     = currentRecord.getValue({fieldId: 'overrideinstallments'});
     var tran_ID           = currentRecord.id;

     var InvoiceRecord = record.load({
         type: record.Type.VENDOR_BILL,
         id: tran_ID,
         isDynamic: true,
         });

     var linea             = InvoiceRecord.getLineCount('installment');

     log.error('val_subsituye - tran_ID', val_subsituye + ' - ' + tran_ID);        

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
             
         /*var cam_centr = arrResult_2[i].getValue({
             name: 'custrecord_nch_br_camara_central_cnab'
         });*/
             
     } 

     //log.error('tip_pag_cnab - tip_serv_cnab ',tip_pag_cnab + ' - ' + tip_serv_cnab);
     //log.error('id_bank - cam_centr ',id_bank + ' - ' + cam_centr);
             
     for(var j = 0; j < linea; j++ )
     {
            InvoiceRecord.selectLine({
            sublistId : 'installment',
            line : j
            });
                 
            if( arrResult.length > 0 )
            {
                InvoiceRecord.setCurrentSublistValue({
                sublistId: 'installment',
                fieldId: 'custrecord_brl_inst_l_type_payment',                        
                value: tip_pag_cnab
                });

                InvoiceRecord.setCurrentSublistValue({
                sublistId: 'installment',
                fieldId: 'custrecord_brl_inst_l_type_service',                        
                value: tip_serv_cnab
                });

                InvoiceRecord.setCurrentSublistValue({
                sublistId: 'installment',
                fieldId: 'custrecord_brl_inst_l_ted_purpose',                        
                value: fin_ted_cnab
                });
            } 
                     
                InvoiceRecord.setCurrentSublistValue({
                sublistId: 'installment',
                fieldId: 'custrecord_brl_inst_l_cent_clear_house',                        
                value: cam_cent_cnab
                }); 
                     
                InvoiceRecord.setCurrentSublistValue({
                sublistId: 'installment',
                fieldId: 'custrecord_brl_inst_l_subs_bank_info',                        
                value: id_bank
                });

                InvoiceRecord.commitLine({sublistId: 'installment'});
                                                             
                //log.error('Prazo | fechaFinal ', num_prazo + ' | ' + fechaFinal );
         
     }

     InvoiceRecord.save();

     return true;
 }

 return {
     //beforeLoad : beforeLoad,
    // beforeSubmit: beforeSubmit,
     afterSubmit : afterSubmit
              
  };
});