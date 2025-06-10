/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Ene 2022     jguzman
 *
 */

function onloadForm(type)
{
    if( nlapiGetFieldValue('custpage_subsidiary') == '') 
    {
        nlapiSetFieldDisplay('custpage_br_livrocontabil', false );
    }
}

function clientFieldChange(type, name, linenum)
{
    if (name == 'custpage_subsidiary') 
    {
        var subsidiaria = nlapiGetFieldValue('custpage_subsidiary');
        
        //EXCLUSION PARA BRASIL Mostrar/ocultar combo libro contable
        // NUEVA INSTANCIA BRASIL = 3
        if (subsidiaria == 3)
        {
            var reporte = 'Interfaz Segmentación Netsuite - Oracle';
            var filters = new Array();
                filters[0] = new nlobjSearchFilter('custrecord_nch_report_features', null, 'anyof', reporte);
                //filters[1] = new nlobjSearchFilter('internalid', null, 'is', 13);
                filters[1] = new nlobjSearchFilter('internalid', null, 'is', 1);
            var columns = new Array();
                columns[0] = new nlobjSearchColumn('custrecord_nch_id_filter');     
            
            var transacdata = nlapiSearchRecord('customrecord_nch_filter_report_generator', null, filters, columns);

            if ( transacdata != null && transacdata != '' ) 
            {
                for(var i = 0; i < transacdata.length; i++) 
                {
                    var idField = transacdata[i].getValue('custrecord_nch_id_filter');
                    // Obteniendo datos de etiqueta y campo de ingreso
                    if (idField != null && idField != '') 
                    {
                        nlapiSetFieldDisplay(idField, true );
                    }
                }
            }
        }
        else
        {
            nlapiSetFieldDisplay('custpage_br_livrocontabil', false );            
        }
    }
    return true;
}

function clientSaveRecord()
{
    var subsidiaria = nlapiGetFieldValue('custpage_subsidiary');
    var livroContabil = nlapiGetFieldValue('custpage_br_livrocontabil');

    if (subsidiaria == 23) 
    { 
        if (livroContabil == '' || livroContabil == null) 
        { 
            alert('Selecione um livro contábil') 
            return false;
        }
    }

    return true;
}