/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
 define(['N/ui/dialog','N/record', 'N/currentRecord', 'N/search'],
 function(dialog, record, currentRecord, search) 
 {
     
     function pageInit(context) 
     {
           
         var rec = context.currentRecord;
         var loadsubsi = rec.getValue({fieldId: 'subsidiary'});

         //CONTROL DE APROBACIONES TO ECUADOR & PANAMA & PERU & BRASIL & CHILE & COLOMBIA & ARGENTINA & COSTA RICA
         //if( loadsubsi == 21 || loadsubsi == 10 || loadsubsi == 3 || loadsubsi == 4 || loadsubsi == 23 || loadsubsi == 19 || loadsubsi == 20 || loadsubsi == 22 || loadsubsi == 11 )
         //NUEVA INSTANCIA
         if( loadsubsi == 3 )
         {
             var apruSup = rec.getValue({fieldId: 'supervisorapproval'});
             rec.getField({fieldId : 'supervisorapproval'}).isDisabled = true;
                 
             if(apruSup == false)
             {
             var field = rec.getField({fieldId : 'accountingapproval'});
                 field.isDisabled = true; 
             }
         }           
         
         return true;
     }

     function onSaveRecord(context) 
     {
         try
         {
            
             var rec = context.currentRecord;
             var loadsubsi = rec.getValue({fieldId: 'subsidiary'});
             var RecordType    = rec.type;
             var idSubsidiaria = rec.getValue({fieldId:'subsidiary'});
             var objSubsidiaria = search.lookupFields({type:search.Type.SUBSIDIARY, id:idSubsidiaria, columns:['country']});
             var pais = objSubsidiaria.country[0].value;


             //VALIDACIONES TO ECUADOR
             /*if( loadsubsi == 21 )
             {

                 var importeBaseExcenta          = 0 ;
                 var importeBaseIVADiferenteCero = 0 ;
                 var importeBaseIVATasaCero      = 0 ;
                 var importeBaseNoIVA            = 0 ;

                 var currentRecord = context.currentRecord;
                 var numeroItems   = currentRecord.getLineCount({sublistId: 'expense'});


                 for (var i = 0; i < numeroItems; i++) {

                     var importeLinea       = currentRecord.getSublistValue( {sublistId: 'expense', fieldId: 'amount', line: i} ) ;
                     var claveImpuestoLinea = String( currentRecord.getSublistText( {sublistId: 'expense', fieldId: 'taxcode', line: i} ) ).split(':') ;
                     
                     switch( claveImpuestoLinea[1] ){
                         case 'E-EC':
                             importeBaseExcenta += parseFloat( importeLinea );
                         break;

                         case 'SS-EC':
                         case 'S-EC':
                         case 'I-EC':
                         case '12% S-EC':
                         case '12% SS-EC':
                         case '12% I-EC':
                         case '15% S-EC':
                         case '15% SS-EC':
                         case '15% I-EC':
                             importeBaseIVADiferenteCero += parseFloat( importeLinea );
                         break;

                         case 'ZNos-EC':
                         case 'ZI-EC':
                             importeBaseIVATasaCero += parseFloat( importeLinea );
                         break;

                         case 'ZNoc-EC':
                             importeBaseNoIVA += parseFloat( importeLinea );
                         break;

                         default:
                         break;
                     }
                 };
               
                 currentRecord.setValue({fieldId: 'custbody_nch_ec_base_excenta' , value: importeBaseExcenta          });
                 currentRecord.setValue({fieldId: 'custbody_nch_ec_base_iva'     , value: importeBaseIVADiferenteCero });
                 currentRecord.setValue({fieldId: 'custbody_nch_ec_base_0iva'    , value: importeBaseIVATasaCero      });
                 currentRecord.setValue({fieldId: 'custbody_nch_ec_base_noiva'   , value: importeBaseNoIVA            });
                 
                 var imporete =  '';
                 var impwtax = currentRecord.getValue({fieldId:'custpage_4601_witaxamount'});
                 
                 if(impwtax != '' && impwtax != null)
                     {
                     imporete = impwtax; 
                     currentRecord.setValue({fieldId: 'custbody_nch_ec_aplica_wht', value: true});
                     }
                 
                 return true;
             }

             //VALIDACIONES TO MEXICO
             if( pais == 'MX')
             {                
                 var numgasto = rec.getLineCount({sublistId: 'expense'}); 
                 var fiscal;
                     
                 for (var i = 0; i < numgasto; i++) 
                 {
                     fiscal = rec.getSublistValue({sublistId: 'expense', fieldId: 'custcol_lmry_foliofiscal', line: i});
                         
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
            }*/

            return true; 
                 
         }catch(e){
             var options = {
                 title   : '¡Aviso!' ,
                 message : 'Ocurrió una excepción al relizar los cálculos de los importes base de impuestos.'
             };
             console.log(e);
             dialog.alert(options);
             return false;
         }
       
     }
     
     function onChangeField(context, fieldId, name)
     { 
         var rec = context.currentRecord;         

         if( context.fieldId == 'expensedate' )
         {
             var d = rec.getCurrentSublistValue({
                 sublistId: 'expense',
                 fieldId: 'expensedate'
                 });

             
             var n = d.getDay(); //Sunday is 0, Monday is 1, and so on
              //alert('day of week' + n);

             switch (n) 
             {
               case 0:
                 rec.setCurrentSublistValue({
                 sublistId: 'expense',
                 fieldId: 'custcol_nch_namedia',
                 value: 'Domingo',
                 ignoreFieldChange: true
                 });
                 break;
               case 1:
                 rec.setCurrentSublistValue({
                 sublistId: 'expense',
                 fieldId: 'custcol_nch_namedia',
                 value: 'Lunes',
                 ignoreFieldChange: true
                 });
                 break;
               case 2:
                 rec.setCurrentSublistValue({
                 sublistId: 'expense',
                 fieldId: 'custcol_nch_namedia',
                 value: 'Martes',
                 ignoreFieldChange: true
                 });
                 break;
               case 3:
                 rec.setCurrentSublistValue({
                 sublistId: 'expense',
                 fieldId: 'custcol_nch_namedia',
                 value: 'Miercoles',
                 ignoreFieldChange: true
                 });
                 break;
               case 4:
                 rec.setCurrentSublistValue({
                 sublistId: 'expense',
                 fieldId: 'custcol_nch_namedia',
                 value: 'Jueves',
                 ignoreFieldChange: true
                 });
                 break;
               case 5:
                 rec.setCurrentSublistValue({
                 sublistId: 'expense',
                 fieldId: 'custcol_nch_namedia',
                 value: 'Viernes',
                 ignoreFieldChange: true
                 });
                 break;
               case 6:
                 rec.setCurrentSublistValue({
                 sublistId: 'expense',
                 fieldId: 'custcol_nch_namedia',
                 value: 'Sabado',
                 ignoreFieldChange: true
                 });
                 break;
               
             }
            
         }

         //FLUJO DE APROBACION DE EXPENSES            
         if( context.fieldId == 'custbody_nch_req_aprove_sup' )
         { 
             var flagapp = rec.getValue({fieldId: 'custbody_nch_req_aprove_sup'});
             if ( flagapp == 2 ) { rec.setValue({fieldId: 'supervisorapproval', value: true}); }
             else{ rec.setValue({fieldId: 'supervisorapproval', value: false}); }
         }
         
         //LOGICA PARA EXTRACCION DE DATA FROM FUNCIONARIO PARA PAGAMENTO CNAB
         //OBTIENE VALORES DE PREFERENCIAS DE PAGAMENTO EN FUUNCIONARIO
         
         if( context.fieldId == 'entity' )
         {
            var loadsubsi = rec.getValue({fieldId: 'subsidiary'});

            if(loadsubsi == 3)
            { 
                var val_fun  = rec.getValue({fieldId: 'entity'});
                var ObjFun   = search.lookupFields({type:search.Type.EMPLOYEE, 
                                id:val_fun, 
                                columns:['custentity_brl_entity_l_def_pay_method', 
                                        'custentity_nch_empl_type_payment_br', 
                                        'custentity_nch_empl_type_service_br']});

                var met_pay  = ObjFun.custentity_brl_entity_l_def_pay_method[0].value;
                var tip_pay  = ObjFun.custentity_nch_empl_type_payment_br[0].value;
                var tip_ser  = ObjFun.custentity_nch_empl_type_service_br[0].value;           

                //alert('met_pay | id_bank | tip_pay | tip_ser :' + met_pay + ' | ' + id_bank + ' | ' + tip_pay + ' | ' + tip_ser);

                rec.setValue({fieldId: 'custbody_brl_tran_l_payment_method', value: met_pay});
                rec.setValue({fieldId: 'custbody_brl_tran_l_type_of_service', value: tip_ser});
                rec.setValue({fieldId: 'custbody_brl_tran_l_cent_clear_house', value: 1});
            }
            
         }
         
         if( context.fieldId == 'custbody_nch_tipo_informe_gasto' )
         {
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

            rec.setValue({fieldId: 'custbody_brl_tran_l_subs_bank_info', value: id_bank});
            
            var tran_tippay = rec.getValue({fieldId: 'custbody_brl_tran_l_payment_method'});

            if(tran_tippay.length > 0)
            {
                //alert(tran_tippay);
                rec.setValue({fieldId: 'custbody_brl_tran_l_type_of_payment', value: 1, ignoreFieldChange: true});
            }            
            
         }

         return true;

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
     pageInit: pageInit,
     //saveRecord: onSaveRecord,
     fieldChanged: onChangeField
     //validateLine  : onValidateLine
 };
});