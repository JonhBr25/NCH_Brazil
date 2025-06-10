/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/currentRecord', 'N/search'],
 function(record, currentRecord, search) 
 {
             
  function beforeSubmit(context) 
 {
     try
     {           
         var currentRecord = context.newRecord;
         var eventype = context.type;
         var numeroItems   = currentRecord.getLineCount({sublistId: 'expense'});

         log.error('eventype | numeroItems', eventype + ' | ' + numeroItems );

         if(eventype === 'create')
         { 
             for (var i = 0; i < numeroItems; i++) 
             {

                 var val_date = currentRecord.getSublistValue( {sublistId: 'expense', fieldId: 'expensedate', line: i} ) ;

                 log.error('val_date', val_date );

                 var n = val_date.getDay(); //Sunday is 0, Monday is 1, and so on
                  
                 log.error('getDay', n );

                 switch (n) 
                 {
                   case 0:
                     currentRecord.setSublistValue({
                     sublistId: 'expense',
                     fieldId: 'custcol_nch_namedia',
                     value: 'Domingo',
                     line: i,
                     ignoreFieldChange: true
                     });
                     break;
                   case 1:
                     currentRecord.setSublistValue({
                     sublistId: 'expense',
                     fieldId: 'custcol_nch_namedia',
                     value: 'Lunes',
                     line: i,
                     ignoreFieldChange: true
                     });
                     break;
                   case 2:
                     currentRecord.setSublistValue({
                     sublistId: 'expense',
                     fieldId: 'custcol_nch_namedia',
                     value: 'Martes',
                     line: i,
                     ignoreFieldChange: true
                     });
                     break;
                   case 3:
                     currentRecord.setSublistValue({
                     sublistId: 'expense',
                     fieldId: 'custcol_nch_namedia',
                     value: 'Miercoles',
                     line: i,
                     ignoreFieldChange: true
                     });
                     break;
                   case 4:
                     currentRecord.setSublistValue({
                     sublistId: 'expense',
                     fieldId: 'custcol_nch_namedia',
                     value: 'Jueves',
                     line: i,
                     ignoreFieldChange: true
                     });
                     break;
                   case 5:
                     currentRecord.setSublistValue({
                     sublistId: 'expense',
                     fieldId: 'custcol_nch_namedia',
                     value: 'Viernes',
                     line: i,
                     ignoreFieldChange: true
                     });
                     break;
                   case 6:
                     currentRecord.setSublistValue({
                     sublistId: 'expense',
                     fieldId: 'custcol_nch_namedia',
                     value: 'Sabado',
                     line: i,
                     ignoreFieldChange: true
                     });
                     break;
                   
                 }                  
                 
             }
         }

        return true; 
             
     }catch(e){
         log.error('error_trycatch', e );
         return false;
     }
   
 }

 return {
     beforeSubmit: beforeSubmit
 };
});