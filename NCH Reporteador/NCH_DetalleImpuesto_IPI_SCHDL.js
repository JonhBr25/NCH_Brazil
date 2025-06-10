/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Feb 2024     Jonathan
 * File : NCH_DetalleImpuesto_IPI_SCHDL.js
 */
var objContext =  nlapiGetContext();

// Control de Memoria
var intMaxReg = 1000;
var intMinReg = 0;
// Cuerpo del archivo
var strBody 		= '';
var xmlStr 			= '';
var extension 		= '.csv';
var periodstartdate	= '';
var periodenddate	= '';
var periodname 		= '';
var anioperiodoend	= '';
var mesperiodo		= '';
/*** Schedule ***/

function scheduled_main(type) 
{
	var logId = objContext.getSetting('SCRIPT', 'custscript_br_idrep_detalleimpuesto_ipi');
	var subsId = objContext.getSetting('SCRIPT', 'custscript_br_subsi_detalleimpuesto_ipi');
	var periodo = objContext.getSetting('SCRIPT', 'custscript_br_perio_detalleimpuesto_ipi');
	
	try 
    {

		var tex = '** Starting Script **';
		nlapiLogExecution('DEBUG', 'scheduled', tex);

        nlapiLogExecution('DEBUG', 'logId | periodo ', logId + ' | ' + periodo );
		
		//LECTURA DE LOS PERIODOS CONTABLES FISCALES
		if (periodo!=null && periodo!=''){
		    var columnFrom 	= nlapiLookupField('accountingperiod', periodo, ['startdate','enddate','periodname']);
		    periodstartdate = columnFrom.startdate;
		    periodenddate 	= columnFrom.enddate;
		    periodname 		= columnFrom.periodname;
		    anioperiodoend  = periodenddate.substr((periodenddate.length - 4), periodenddate.length);
		    mesperiodo  	= periodenddate.split('/')[1];
		}

		nlapiLogExecution('DEBUG', 'periodstartdate | periodenddate | periodname | anioperiodoend | mesperiodo', periodstartdate + '| ' + periodenddate + '| ' + periodname + '|' + anioperiodoend + '|' + mesperiodo);
		
		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_rpt_generator_log', logId, ['custrecord_nch_rg_name'], ['Procesando']);
		
		// XML contenido del archivo excel
	    strBody += '' + '\t' + 'NCH Brasil LTDA.' + '\r\n';
	    strBody += periodname + '\t' + 'Detalhe do impostos IPI' + '\r\n';
	    strBody += '\r\n';

		strBody += '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t';

		strBody += '\r\n';
        
        strBody += 'Id Interno' + '\t' + 'Transaction Date' + '\t' + 'Document Number' + '\t' + 'Entity Name' + '\t' + 'Net Amount' + '\t' + 'Tax Code' + '\t' + 
					'Tax Base' + '\t' + 'Tax Rate' + '\t' + 'Tax Amount' + '\t' + 'Id Regla do Imposto' + '\t' + 'Aliquota' + '\t' + 'Tipo Parametro' + '\t';

		strBody += '\r\n';
		
	    //GARGA BUSQUEDA GUARDADA NCH Detalhe de relatório genérico de imposto
		var buscaDatos = nlapiLoadSearch(null, 'customsearch2952');
			buscaDatos.addFilter(new nlobjSearchFilter('postingperiod', null, 'anyof', periodo));
            buscaDatos.addFilter(new nlobjSearchFilter('type', null, 'anyof', 'VendBill'));
            buscaDatos.addFilter(new nlobjSearchFilter('taxcode', 'taxdetail', 'anyof', '15')); // IPI_BR = 15

		var columnas = buscaDatos.getColumns();
		var resultados = buscaDatos.runSearch();        
		var h = 0;

		do {
		    parte = resultados.getResults(h, h + 1000);
			parte.forEach(function(result) 
			{
		      	var resultaObj = {};
		      	columnas.forEach(function(column) {
		        	resultaObj[column.getName()] = result.getValue(column);
		      	});

				var dato001 = result.getValue(columnas[0]);//ID INTERNO
				var dato002 = result.getValue(columnas[3]);//TRANSACTION DATE
				var dato003 = result.getValue(columnas[5]);//DOCUMENT NUMBER
				var dato004 = result.getText(columnas[6]);//ENTITY NAME
				var dato005 = result.getValue(columnas[7]);//NET AMOUNT
				var dato006 = result.getText(columnas[10]);//TAX CODE
				var dato007 = result.getValue(columnas[11]);//TAX BASE
                var dato008 = result.getValue(columnas[12]);//TAX RATE
                var dato009 = result.getValue(columnas[13]);//TAX AMOUNT
                var dato010 = result.getValue(columnas[16]);//ID RULE IMPOSTO

                //GARGA BUSQUEDA GUARDADA NCH Regras de impostos (Script)
                var saved_rules = nlapiLoadSearch(null, 'customsearch_nch_rules_impostos');	
                    saved_rules.addFilter(new nlobjSearchFilter('internalid', null, 'is', dato010));
                    saved_rules.addFilter(new nlobjSearchFilter('custrecord_fte_taxrate_l_taxcode', 'custrecord_fte_taxrate_l_taxrule', 'is', '15'));
                
                var resultSet_carga = saved_rules.runSearch();
                var objRules        = resultSet_carga.getResults(0, 10);                
                var a               = 0;
                var dato011         = '';
                var dato012         = '';	
                
                //nlapiLogExecution('DEBUG', 'objRules :', objRules.length);
                
                while ( a < objRules.length ) 
                {
                    cols    = objRules[a].getAllColumns();                    
                    dato011 = objRules[a].getValue(cols[12]);
                    dato012 = objRules[a].getValue(cols[13]);
                    a++
                }

				strBody += dato001 + '\t' + dato002 + '\t' + dato003 + '\t' + dato004 + '\t' + dato005 + '\t' + dato006 + '\t' + 
                        dato007 + '\t' + dato008 + '\t' + dato009 + '\t' + dato010 + '\t' + dato011 + '\t' + dato012.substring(0, 6) + '\t';
                
                strBody += '\r\n';

	    	h++;
			});
		} while (parte.length >= 1000);	
		
		// Crea y graba el archivo
		savefile();

		var usage = nlapiGetContext().getRemainingUsage();
			nlapiLogExecution('DEBUG', 'Units Remaining', usage);
			nlapiLogExecution('DEBUG', 'scheduled', '** End Script **')

	} catch(err) 
	{
		// Envio de mail si sucede error.
		//nlapiSendEmail(20, 'jonathan.jimenez@nch.com', 'Error scheduled_main', err + ' - ' + err.lineNumber);
		nlapiLogExecution('DEBUG', 'Error', err);
		
		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_rpt_generator_log', logId, ['custrecord_nch_rg_name'], ['Failed']);
	}
}

/* ------------------------------------------------------------------------------------------------------ 
 * Nota: Graba el archivo en FileCabinet
 * --------------------------------------------------------------------------------------------------- */
function savefile()
{
	// Ruta de la carpeta contenedora: SuiteFiles_NCH > Files Generator_BR
	var folderId = 5259;
	var logId = objContext.getSetting('SCRIPT', 'custscript_br_idrep_detalleimpuesto_ipi');
	
	// Genera el nombre del archivo
	var nameFile = '';
		nameFile += mesperiodo + '-' + anioperiodoend.substr(2) + ' DetalheImposto_IPI';

		//Excel con formato
		//strBody = xmlStr;
	var nameFile_Show = '';
		
	nlapiLogExecution('DEBUG', 'Nombre Archivo', nameFile);

	var extension = '.xls';
	
	//Crea el file XLS
	var File = nlapiCreateFile(nameFile + '.xls', 'EXCEL', nlapiEncrypt(strBody, 'base64'));
		File.setEncoding('UTF-8');
		File.setFolder(folderId);

        File.setFolder(folderId);

	nameFile_Show = nameFile + extension;

	// Termina de grabar el archivo
	var idfile = nlapiSubmitFile(File);

	// Trae URL de archivo generado
	var idfile2 = nlapiLoadFile(idfile);

	var urlfile = '';
	var environment = objContext.getEnvironment();
	
	if (environment == 'SANDBOX') {
		urlfile = "https://system.sandbox.netsuite.com";
	}
	if (environment == 'PRODUCTION') {
		urlfile = "https://system.netsuite.com";
	}
	urlfile += idfile2.getURL();

	// Actualiza el log para informar que se inicio el proceso
	nlapiSubmitField('customrecord_nch_rpt_generator_log', logId, ['custrecord_nch_rg_name', 'custrecord_nch_rg_url_file'], [nameFile_Show , urlfile]);
}

/* ------------------------------------------------------------------------------------------------------ 
 * Nota: Formato de fecha YYYYMMDD o DD/MM/YYYY
 * --------------------------------------------------------------------------------------------------- */
function Name_Date(myDate, opt) {
    var DateYY = myDate.substr((myDate.length - 4), myDate.length);
    var DateDD = '00';
	var DateMM = '00';

	var tramo = 1; //indica el tramo entre cada punto de la fecha
	for (var i = 0; i < myDate.length; i++) {
		if(myDate.substr(i,1)=='.'||myDate.substr(i,1)=='/'){
			tramo++;
		}else{
			if(tramo == 1){
				DateDD = DateDD + myDate.substr(i,1);
			}
			if (tramo == 2) {
				DateMM = DateMM + myDate.substr(i,1);
			}
		}			
	}
	if (opt==1){
		var NameDate = DateYY + DateMM.substr(DateMM.length-2) + DateDD.substr(DateDD.length-2);
	}else {
		var NameDate = DateDD.substr(DateDD.length-2) + '/' + DateMM.substr(DateMM.length-2) + '/' + DateYY;
	}
	 
	// Return File Name as a string
	return NameDate;
}