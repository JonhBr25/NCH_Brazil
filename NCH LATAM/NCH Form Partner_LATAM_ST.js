/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Apr 2015     jonathanj
 *
 */

function RepPageInit(){
	
	//BORRADO DE VALORES EN CAMPOS ACUMULATIVOS PHASE I
    
    nlapiSetFieldValue('custentity_plan_acumul_may', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_jun', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_jul', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_ago', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_sep', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_oct', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_nov', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_dic', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_ene', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_feb', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_mar', '0.00');
    nlapiSetFieldValue('custentity_plan_acumul_abr', '0.00');
    return true; 
}

function repSaveRecord()
{
      
     //ACUMULACION DE QUOTAS AÑO FISCAL CORPORATIVO
     if (nlapiGetFieldValue('custentity_quota_mayo')=="" || nlapiGetFieldValue('custentity_quota_junio')=="" || nlapiGetFieldValue('custentity_quota_julio')=="" || nlapiGetFieldValue('custentity_quota_agosto')=="" || nlapiGetFieldValue('custentity_quota_septiembre')=="" || nlapiGetFieldValue('custentity_quota_octubre')=="" || nlapiGetFieldValue('custentity_quota_noviembre')=="" || nlapiGetFieldValue('custentity_quota_diciembre')=="" || nlapiGetFieldValue('custentity_quota_enero')=="" || nlapiGetFieldValue('custentity_quota_febrero')=="" || nlapiGetFieldValue('custentity_quota_marzo')=="" || nlapiGetFieldValue('custentity_quota_abril')=="")
    	 {
    	 nlapiSetFieldValue('custentity_plan_acumul_may', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_jun', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_jul', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_ago', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_sep', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_oct', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_nov', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_dic', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_ene', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_feb', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_mar', 0.00);
    	 nlapiSetFieldValue('custentity_plan_acumul_abr', 0.00);
    	 return true;
    	 }
     var Amayo  = parseInt(nlapiGetFieldValue('custentity_quota_mayo'));
     var Ajunio = Amayo + parseInt(nlapiGetFieldValue('custentity_quota_junio'));
     var Ajulio = Ajunio + parseInt(nlapiGetFieldValue('custentity_quota_julio'));
     var Aagost = Ajulio + parseInt(nlapiGetFieldValue('custentity_quota_agosto'));
     var Asepti = Aagost + parseInt(nlapiGetFieldValue('custentity_quota_septiembre'));
     var Aoctub = Asepti + parseInt(nlapiGetFieldValue('custentity_quota_octubre'));
     var Anovie = Aoctub + parseInt(nlapiGetFieldValue('custentity_quota_noviembre'));
     var Adicie = Anovie + parseInt(nlapiGetFieldValue('custentity_quota_diciembre'));
     var Aenero = Adicie + parseInt(nlapiGetFieldValue('custentity_quota_enero'));
     var Afebre = Aenero + parseInt(nlapiGetFieldValue('custentity_quota_febrero'));
     var Amarzo = Afebre + parseInt(nlapiGetFieldValue('custentity_quota_marzo'));
     var Aabril = Amarzo + parseInt(nlapiGetFieldValue('custentity_quota_abril'));
     
    nlapiSetFieldValue('custentity_plan_acumul_may', Amayo);
    nlapiSetFieldValue('custentity_plan_acumul_jun', Ajunio);
    nlapiSetFieldValue('custentity_plan_acumul_jul', Ajulio);
    nlapiSetFieldValue('custentity_plan_acumul_ago', Aagost);
    nlapiSetFieldValue('custentity_plan_acumul_sep', Asepti);
    nlapiSetFieldValue('custentity_plan_acumul_oct', Aoctub);
    nlapiSetFieldValue('custentity_plan_acumul_nov', Anovie);
    nlapiSetFieldValue('custentity_plan_acumul_dic', Adicie);
    nlapiSetFieldValue('custentity_plan_acumul_ene', Aenero);
    nlapiSetFieldValue('custentity_plan_acumul_feb', Afebre);
    nlapiSetFieldValue('custentity_plan_acumul_mar', Amarzo);
    nlapiSetFieldValue('custentity_plan_acumul_abr', Aabril);
        
	return true;
}

function repValidateField(type, name, linenum){
 
     return true;
}

function repFieldChanged(type, lblname){
 
	if(lblname=='firstname' || lblname=='lastname') {
		var esindividual = nlapiGetFieldValue('isperson');
		if( esindividual == 'T')
		{
			var nombreRep = nlapiGetFieldValue('firstname');
			var apellidoRep = nlapiGetFieldValue('lastname');
			var nombrecompletorep = nombreRep+' '+apellidoRep;
			nlapiSetFieldValue('companyname', nombrecompletorep.toUpperCase());
		}
		return true;
	}
	
	if(lblname=='vatregnumber'){
		var rfcvacio = nlapiGetFieldValue('vatregnumber');
		if(rfcvacio != "" && rfcvacio != null)
		{
         var espejorfc = rfcvacio;
           nlapiSetFieldValue('custentity_vatregnumberodbc', espejorfc .toUpperCase());
           nlapiSetFieldValue('custentity_nch_vatregnumber', espejorfc .toUpperCase());      
       }
	}
	return true;
}