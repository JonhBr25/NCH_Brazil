//Suitescript 1.0 JGO
//Coments Testing Chony

function EmployeeClientSaveRecord()
{
    var valemplo = 'Sales Rep Agente';
    var valempl2 = 'Sales Rep Empleado';
    var tipoemplo = nlapiGetFieldText('employeetype');
    var patarelac = nlapiGetFieldValue('custentitypartner_relacionado');
    var nchgerenc = nlapiGetFieldValue('cseg_nch_gerencia');
    var nchsubsid = nlapiGetFieldValue('subsidiary');
    
    if(tipoemplo == valemplo || tipoemplo == valempl2)
    {
        if(patarelac == '' || patarelac == null)
        {
            alert('El Registro es tipo SALESREP - COMPLETE EL CAMPO SALES REP RELACIONADO');
            return false;
        }

        /*if( (nchsubsid == 20 || nchsubsid == 3) && (nchgerenc == '' || nchgerenc == null) )
        {
            alert('El Registro es tipo SALESREP - COMPLETE EL CAMPO NCH GERENCIA');
            return false;
        }*/
    }
       
    return true;
}

function EmployeeClientValidateField(type, name, linenum) 
{
    // Obtiene el texto del campo
    /*if ( name == 'custentitypartner_relacionado' ) 
    {        
        var Partner = nlapiGetFieldValue('custentitypartner_relacionado');        
        var partnerrec = nlapiLoadRecord('partner', Partner);        
        var partnerid = partnerrec.getFieldValue('entityid');
                
        nlapiSetFieldValue('custentity_partner_relacionado_altname', partnerid );
    }*/

    return true;
}

function EmployeeClientFieldChanged(type, name, linenum)
{  
    if(name == 'socialsecuritynumber')
    {
        nlapiSetFieldValue('custentity_nch_vatregnumber', nlapiGetFieldValue('socialsecuritynumber'));      
    }

    return true;
}
