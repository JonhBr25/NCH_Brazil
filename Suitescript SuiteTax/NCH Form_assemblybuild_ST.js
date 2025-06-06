/**
 *@NApiVersion 2.0
 *@NScriptType ClientScript
 */
 define(['N/record', 'N/runtime', 'N/search'], 
    function(record, runtime, search) 
    {	
	
	function onPageInit(context) 
	{
		var currentRecord = context.currentRecord;
		var idFormulario = currentRecord.getValue({fieldId:'customform'});
		var initevent 	= context.mode;
		var idItem 	= currentRecord.getValue({fieldId:'item'});

		if (initevent == 'create' || initevent == 'copy') 
		{            
            var objItem = search.lookupFields({type:'item', id: idItem, columns:['custitem_brl_l_item_origin']});
            var val_origem = objItem.custitem_brl_l_item_origin[0].text;

            //alert('val_origem : ' +  val_origem.substring(0, 1));

            if( val_origem.length > 0 )
            {
                currentRecord.setValue({fieldId: 'custbody_brl_tran_t_origin_code', value: val_origem.substring(0, 1)});
                currentRecord.getField({fieldId: 'custbody_brl_tran_t_origin_code'}).isDisabled = true;
            }     
        }

		return true;
	}
	
    return {
        pageInit 	   : onPageInit
        /*saveRecord 	   : onSaveRecord,
        fieldChanged   : onFieldChange,
        postSourcing   : onPostSourcing,
        validateLine   : onValidateLine,
        validateDelete : onValidateDelete,
        validateField  : onValidateField,
        lineInit 	   : onLineInit*/
    };
});