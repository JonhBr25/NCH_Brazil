/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 ago 2013     PCR
 * File : LTR_NS_EBS2_Tier_SS.js
 */

var cantpagi = 0;
var periodo = '';
var periodname = '';
var totdebamount_saldoini = 0;
var totcreamount_saldoini = 0;
var totdebamount_mes = 0;
var totcreamount_mes = 0;
var totdebamount_saldofin = 0;
var totcreamount_saldofin = 0;
var totsaldoinid2 = 0;
var totsaldoinic2 = 0;
var totmovperd2 = 0;
var totmovperc2 = 0;
var totsaldofind2 = 0;
var totsaldofinc2 = 0;
var configpage = '';
var companyname = '';
var formlogo = '';
var timezone = '';
var periodstartdate = '';
var periodenddate = '';
var intMaxReg = 1000;
var intMinReg = 0;
var bolStop = false;


function scheduled(type) 
{
	
	try
	{
		nlapiLogExecution('DEBUG', 'INICIO','Iniciado');
		var objContext =  nlapiGetContext();
		var paramperiodo = objContext.getSetting('SCRIPT', 'custscript_param_periodo');
		var paramsubs = objContext.getSetting('SCRIPT', 'custscript_subs');

		// Nombre de la Subsidiaria , Periodo Contable y ID Interno de Carpeta creada en FileCabinet
		var namessubs = nlapiLookupField('subsidiary', paramsubs, 'legalname');
		var nameperio = nlapiLookupField('accountingperiod', paramperiodo, 'periodname');
		var filecabinet = nlapiLookupField('subsidiary', paramsubs, 'custrecord_nch_fcab_oracle');
		
		nlapiLogExecution('DEBUG', 'Subsidiaria','File Cabinet: '+filecabinet);
		nlapiLogExecution('DEBUG', 'Parametro','Periodo: '+paramperiodo+'-'+nameperio);
		nlapiLogExecution('DEBUG', 'Parametro','Subsidi: '+paramsubs+'-'+namessubs);

		//periodo = '83';
		periodo = paramperiodo;

		//Porcentaje de ejecucion
		var ctx = nlapiGetContext();
		ctx.setPercentComplete(0.00);
		
		//Trae nombre y logo de la empresa
		configpage = nlapiLoadConfiguration('companyinformation');
		companyname = configpage.getFieldValue('companyname');
		formlogo = configpage.getFieldValue('formlogo');
		timezone = configpage.getFieldValue('timezone');
		nlapiLogExecution('DEBUG', 'Configuration','Zona horaria: '+timezone);
		
		var fieldsFrom = ['startdate','enddate','periodname'];
		var columnFrom = nlapiLookupField('accountingperiod', periodo, fieldsFrom);
		periodstartdate = columnFrom.startdate;
		periodenddate = columnFrom.enddate;
		periodname = columnFrom.periodname;
		var anioperiodoend   = periodenddate.substr((periodenddate.length - 4), periodenddate.length);
		nlapiLogExecution('DEBUG', 'Periodo','Fecha Ini: '+periodstartdate);
		nlapiLogExecution('DEBUG', 'Periodo','Fecha Fin: '+periodenddate);
		nlapiLogExecution('DEBUG', 'Periodo','Anio Fecha Fin: '+anioperiodoend);
		
		//************************ INGRESANDO PARA OBTENER DATOS DEL COST CENTER EN TABLA OSS Cost Center Oracle Mapping
		
		var columnasCostCenter = new Array();//declaramos columnas
			columnasCostCenter[0] = new nlobjSearchColumn('custrecord_oss_class_ns');
			columnasCostCenter[1] = new nlobjSearchColumn('custrecord_oss_departments_ns');
			columnasCostCenter[2] = new nlobjSearchColumn('custrecord_cost_center_oracle_codigo');
		var searchresultCostCenter = nlapiSearchRecord('customrecord_oss_cost_center_oracle', null, null, columnasCostCenter);

		//OBTENIENDO DATOS DE LA BUSQUEDA OSS Interfase Oracle-Desarrollo (AQUI SE ALOJAN TODAS LAS TRANSACCIONES)
		var savedsearch = nlapiLoadSearch('transaction', 'customsearch_oss_transacciones_cta');
			savedsearch.addFilter(new nlobjSearchFilter('subsidiary', null, 'is', paramsubs));
			savedsearch.addFilter(new nlobjSearchFilter('postingperiod',null,'anyof', periodo));
		var objResultSet   = savedsearch.runSearch();
		var searchresult = objResultSet.getResults(0, 1000);

		//nlapiLogExecution('DEBUG', 'searchresult ', searchresult.length);

		var newStringCSV = 'Moneda|Company|Location|Cost Center|Account|Project|ICO|Future|Debe|Haber|Tipo de cambio|Fecha de conversion'+
			'|Tasa de cambio|Referencia 1|Source Detail Report|Referencia 2|Referencia 3|Internal Id|Cuenta|Debe soles|'+
			'haber soles|nro linea|';
		var newStringCSV1 = '';
		var newStringCSV2 = '';
		var newStringCSV3 = '';
		var newStringCSV4 = '';	
		var valorFilaAux = 0;
		
		var logErrores = '';
		
		while(!bolStop)
		{
			//return nlobjSearchResult
			nlapiLogExecution('DEBUG', 'Rango de filas','Desde '+intMinReg+ 'hasta '+intMaxReg);
			for( var cuenta = 0; cuenta < searchresult.length; cuenta ++)
			{
				var columns 	= searchresult[cuenta].getAllColumns();
				var columna0	= searchresult[cuenta].getValue(columns[0]);
				var columna1	= searchresult[cuenta].getValue(columns[1]);
				var columna2	= searchresult[cuenta].getValue(columns[2]);			
				var columna3	= searchresult[cuenta].getValue(columns[3]);//COST CENTER ORACLE
				var costCenterAsignado = false;

				if(columna3 == '' || columna3 == null)
				{
					//ENCONTRANDO COST CENTER GUARDADO EN ARRAY INICIAL
					for(var ccCostCenter=0; ccCostCenter < searchresultCostCenter.length; ccCostCenter++)
					{
						var valorFilaCostCenter = searchresultCostCenter[ccCostCenter];
						if(valorFilaCostCenter.getValue('custrecord_oss_class_ns')==searchresult[cuenta].getValue(columns[26])&& valorFilaCostCenter.getValue('custrecord_oss_departments_ns')==searchresult[cuenta].getValue(columns[24]))
						{
								columna3 = valorFilaCostCenter.getValue('custrecord_cost_center_oracle_codigo');
								costCenterAsignado = true;
						}
					}
				}else{
					columna3	= '000000';
					costCenterAsignado = true;
				}
				//CODIGO ORACLE CUENTA 
				var columna4	= searchresult[cuenta].getValue(columns[4]);
				var columna5	= searchresult[cuenta].getValue(columns[5]);
				var columna6	= searchresult[cuenta].getValue(columns[6]);
				var columna7	= searchresult[cuenta].getValue(columns[7]);
				var columna8	= searchresult[cuenta].getValue(columns[8]);
					
					if(columna8!=''&&columna8!=null)
					{
						columna8	= parseFloat(columna8);
						columna8	= columna8.toFixed(2);
					}
				var columna9	= searchresult[cuenta].getValue(columns[9]);
					if(columna9!=''&&columna9!=null)
					{
						columna9	= parseFloat(columna9);
						columna9	= columna9.toFixed(2);
					}
				var columna10	= searchresult[cuenta].getValue(columns[10]);
				var columna11	= searchresult[cuenta].getValue(columns[11]);
				var columna12	= searchresult[cuenta].getValue(columns[12]);
				var columna13	= searchresult[cuenta].getValue(columns[13]);
					columna13	= reemplazarCadena(columna13);
				var columna14	= searchresult[cuenta].getValue(columns[14]);
					columna14	= reemplazarCadena(columna14);
				var columna15	= searchresult[cuenta].getValue(columns[15]);
					columna15	= reemplazarCadena(columna15);
				var columna16	= searchresult[cuenta].getValue(columns[16]);
					columna16	= reemplazarCadena(columna16);
				var columna17	= searchresult[cuenta].getValue(columns[17]);
				var columna18	= searchresult[cuenta].getValue(columns[18]);
				var columna19	= searchresult[cuenta].getValue(columns[19]);
				var columna22	= searchresult[cuenta].getValue(columns[22]);
				var columna23	= searchresult[cuenta].getValue(columns[23]);
				//DEPARTAMENTO DESCRIPCION
				var columna24	= searchresult[cuenta].getValue(columns[24]);
				//CLASE DESCRIPCION
				var columna26	= searchresult[cuenta].getValue(columns[26]);
				//CODIGO ICO
				var columna30	= searchresult[cuenta].getValue(columns[30]);
				if(columna30==''||columna30==null){
					columna30	= '0000';
				}else{
					if(columna30.length>4){
						columna30 = columna30.substring(0, 4);
					}
				}
				newStringCSV += 
					'\n'+columna0+'|'+columna1+'|'+columna2+'|'+columna3+'|'+
						columna4+'|'+columna5+'|'+columna30+'|'+columna7+'|'+
						columna8+'|'+columna9+'|'+columna10+'|'+columna11+'|'+
						columna12+'|'+columna13+'|'+columna14+'|'+columna15+'|'+columna16+'|'+
						columna17+'|'+columna18+'|'+columna22+'|'+columna23+'|'+cuenta+'|';
				
				//LLENANDO LOG DE VALIDACIONES
				//Cuenta de Oracle no tenga valor, se debe hacer una validacion, indicando la cuenta NetSuite (numero y nombre).
				if(columna4==null){
					logErrores += '\nFila '+(valorFilaAux+2)+', Cuenta sin valor Oracle. '+columna18
								+ ' - '+columna19+ ', Referencia: '
								+ columna13;
				}
				//Cuando no hay combinacion de Departamento y Clase, indicando el departamento y la clase de NetSuite que no tiene combinacion.
				if(!costCenterAsignado){
					logErrores += '\nFila '+(valorFilaAux+2)+', Centro de Costo Oracle no asignado a combinacion. '
								+ 'Departamento: '+ columna24 + '; y Clase: '
								+ columna26 + '; para Cuenta Oracle: '
								+ columna4 + ', Referencia: '
								+ columna13;
				}else{
					
					if(columna4.substring(0,1)=='5'&&columna3.substring(0,1)!='8'){
						logErrores += '\nFila '+(valorFilaAux+2)+', Combinacion Cuenta / Cost Center no permitido: '
						+ 'Expense Account starting with 5 will use Cost Center Starting with 8. Cuenta Oracle: '
						+ columna4 + ', Referencia: '
						+ columna13;
					}
					if(columna4.substring(0,1)=='6'&&(columna3.substring(0,1)!='2'&&columna3.substring(0,1)!='1')){
						logErrores += '\nFila '+(valorFilaAux+2)+', Combinacion Cuenta / Cost Center no permitido: '
						+ 'Expense Account starting with 6 will use Cost Center Starting with 1 or 2. Cuenta Oracle: '
						+ columna4 + ', Referencia: '
						+ columna13;
					}
					if(columna4.substring(0,1)=='7'&&columna3.substring(0,1)!='9'){
						logErrores += '\nFila '+(valorFilaAux+2)+', Combinacion Cuenta / Cost Center no permitido: '
						+ 'Expense Account starting with 7 will use Cost Center Starting with 9. Cuenta Oracle: '
						+ columna4 + ', Referencia: '
						+ columna13;
					}
				}
				valorFilaAux++;
			}
			if(searchresult.length == 1000){
				intMaxReg = intMaxReg + 1000;
				intMinReg = intMinReg + 1000;
				searchresult = objResultSet.getResults(intMinReg, intMaxReg);
				//Guarda variable para generar mas de un archivo
				if(intMaxReg==20000)
				{
					newStringCSV1 = newStringCSV;
					newStringCSV='';
				}
				if(intMaxReg==40000)
				{
					newStringCSV2 = newStringCSV;
					newStringCSV='';
				}
				if(intMaxReg==60000)
				{
					newStringCSV3 = newStringCSV;
					newStringCSV='';
				}
				if(intMaxReg==80000)
				{
					newStringCSV4 = newStringCSV;
					newStringCSV='';
				}
			}else{
				bolStop = true;
			}
		}
		nlapiLogExecution('DEBUG', 'último rango leido',intMaxReg);
		var currentuser = nlapiGetUser();
		var emailUser   = nlapiLookupField('employee',currentuser,'email');
			
		/*----------------------------------------------------
		* Solo se genera archivos de 6000 registros 
		* Soportados por Excel
		*--------------------------------------------------*/
		var CSVFileP1 = '';
		var CSVFileP2 = '';
		var CSVFileP3 = '';
		var CSVFileP4 = '';
		if(newStringCSV1!='')
		{
			var FileNameP1 = namessubs + '_' + nameperio + '_' + 'NetsuiteOracle(PARTE1).csv';
			CSVFileP1 = nlapiCreateFile(FileNameP1, 'CSV', newStringCSV1);
			var CSVFileP1Size=CSVFileP1.getSize();
				nlapiLogExecution('DEBUG', 'CSV File Size(PARTE 1)','Bytes: '+CSVFileP1Size);
			CSVFileP1.setFolder(filecabinet);
			var CSVFileP1ID= nlapiSubmitFile(CSVFileP1);
			nlapiLogExecution('DEBUG', 'Submit File (PARTE 1)',CSVFileP1ID);
		}
		if(newStringCSV2!='')
		{
			var FileNameP2 = namessubs + '_' + nameperio + '_' + 'NetsuiteOracle(PARTE2).csv';
			CSVFileP2 = nlapiCreateFile(FileNameP2, 'CSV', newStringCSV2);
			var CSVFileP2Size=CSVFileP2.getSize();
				nlapiLogExecution('DEBUG', 'CSV File Size(PARTE 2)','Bytes: '+CSVFileP2Size);
			CSVFileP2.setFolder(filecabinet);
			var CSVFileP2ID= nlapiSubmitFile(CSVFileP2);
			nlapiLogExecution('DEBUG', 'Submit File (PARTE 2)',CSVFileP2ID);

		}
		if(newStringCSV3!='')
		{
			var FileNameP3 = namessubs + '_' + nameperio + '_' + 'NetsuiteOracle(PARTE3).csv';
			CSVFileP3 = nlapiCreateFile(FileNameP3, 'CSV', newStringCSV3);
			var CSVFileP3Size=CSVFileP3.getSize();
				nlapiLogExecution('DEBUG', 'CSV File Size(PARTE 3','Bytes: '+CSVFileP3Size);
			CSVFileP3.setFolder(filecabinet);
			var CSVFileP3ID= nlapiSubmitFile(CSVFileP3);
			nlapiLogExecution('DEBUG', 'Submit File (PARTE 3)',CSVFileP3ID);

		}
		if(newStringCSV4!='')
		{
			var FileNameP4 = namessubs + '_' + nameperio + '_' + 'NetsuiteOracle(PARTE4).csv';
			CSVFileP4 = nlapiCreateFile(FileNameP4, 'CSV', newStringCSV4);
			var CSVFileP4Size=CSVFileP4.getSize();
				nlapiLogExecution('DEBUG', 'CSV File Size(PARTE 4','Bytes: '+CSVFileP4Size);
			CSVFileP4.setFolder(filecabinet);
			var CSVFileP4ID= nlapiSubmitFile(CSVFileP4);
			nlapiLogExecution('DEBUG', 'Submit File (PARTE 4)',CSVFileP4ID);

		}
		var FileName = namessubs + '_' + nameperio + '_' + 'NetsuiteOracle.csv';
		var CSVFile = nlapiCreateFile(FileName, 'CSV', newStringCSV);
		var CSVFileSize=CSVFile.getSize();
		nlapiLogExecution('DEBUG', 'CSV File Size (PARTE FINAL)','Bytes: '+CSVFileSize);
		CSVFile.setFolder(filecabinet);
		var CSVFileID= nlapiSubmitFile(CSVFile);
		nlapiLogExecution('DEBUG', 'Submit File (PARTE FINAL)',CSVFileID);
		//var CSVFileURL=CSVFileID.getURL();
		
		var FileName2 = namessubs + '_' + nameperio + '_' + 'LogErrores.csv';
		var CSVFile2 = nlapiCreateFile(FileName2, 'CSV', logErrores);
		var CSVFile2Size=CSVFile2.getSize();
		nlapiLogExecution('DEBUG', 'CSV Log File Size','Bytes: '+CSVFile2Size);
		CSVFile2.setFolder(filecabinet);
		var CSVFile2ID= nlapiSubmitFile(CSVFile2);
		nlapiLogExecution('DEBUG', 'Submit File',CSVFile2ID);
		
		//var FileName3 = namessubs + '_' + nameperio + '_' + 'NetsuiteOracle.txt';
		//var TXTFile3 = nlapiCreateFile(FileName3, 'PLAINTEXT', newStringCSV);
		//TXTFile3.setFolder(filecabinet);
		//var TXTFile3ID= nlapiSubmitFile(TXTFile3);
		//nlapiLogExecution('DEBUG', 'Submit File','TXT File-Detalle');
		
		//var FileName4 = namessubs + '_' + nameperio + '_' + 'NetsuiteOracle.zip';
		//var ZIPFile4 = nlapiCreateFile(FileName4, 'ZIP', nlapiEncrypt(CSVFile, 'base64'));
		//var ZIPFile4Size=ZIPFile4.getSize();
		//nlapiLogExecution('DEBUG', 'ZIP File Size','Bytes: '+ZIPFile4Size);
		//ZIPFile4.setFolder(filecabinet);
		//var ZIPFile4ID= nlapiSubmitFile(ZIPFile4);
		//	nlapiLogExecution('DEBUG', 'Submit File','ZIP File');

		// Archivos atachados
		var arrayFile = new Array();
			//arrayFile[0]=xlsFile;
			arrayFile[0]=CSVFile;
			if(CSVFileP1!='')
			{arrayFile[1]=CSVFileP1;}
			if(CSVFileP2!='')
			{arrayFile[2]=CSVFileP2;}
			if(CSVFileP3!='')
			{arrayFile[3]=CSVFileP3;}
			if(CSVFileP4!='')
			{arrayFile[4]=CSVFileP4;}
			//arrayFile[1]=TXTFile3;
			//arrayFile[2]=ZIPFile4;
		var body = '';
			body += '<p>Estimado(a) :</p>';
			body += '<p>Se ha generado los archivos de Netsuite - Oracle.</p>';
			body += '<p>Nombre de la Empresa:</p>';
			body += '<strong>' + namessubs + '</strong>';
			body += '<p>Periodo Contable:</p>';
			body += '<strong>' + nameperio + '</strong>';
			//body += '<p>URL File Cabinet:</p>';
			//body += '<strong>' + CSVFileURL + '</strong>';
			body += '<br>';
			body += '<p>Atentamente,</p>';
			body += '<p>El personal de NCH.</p>';
			body += '<br>';
			body += '<p><strong>***NO RESPONDA A ESTE MENSAJE***</strong></p>';
		
			nlapiLogExecution('DEBUG', 'Sending Mail','Enviando a '+currentuser);
		//Mail de archivos con data	
		var newEmail = 
			nlapiSendEmail(currentuser, emailUser, 'Archivos Segmentacion Netsuite Oracle - ' + namessubs, 
							body, null, null, null, arrayFile);
		nlapiLogExecution('DEBUG', 'Email-Archivos CSV enviados',newEmail);
		//Mail con log de errores
		var newEmail2 = 
			nlapiSendEmail(currentuser, emailUser, 'Log de Errores del archivo Segmentacion Netsuite Oracle - ' + namessubs, 
							body, null, null, null, CSVFile2);
		nlapiLogExecution('DEBUG', 'Email-Log CSV enviado',newEmail2);

	} catch(err) 
	{
		nlapiLogExecution('DEBUG', 'Catch', err);	
	}
	
}

function reemplazarCadena(cadena){
	cadena	= cadena.replace(/á/gi,'a');
	cadena	= cadena.replace(/é/gi,'e');
	cadena	= cadena.replace(/í/gi,'i');
	cadena	= cadena.replace(/ó/gi,'o');
	cadena	= cadena.replace(/ú/gi,'u');
	cadena	= cadena.replace(/ñ/gi,'n');
	cadena	= cadena.replace(/\r\n|\n|\r/gi,'');
	cadena	= cadena.replace(/,/gi,'');
	cadena	= cadena.replace('Ñ','N');
	cadena	= cadena.replace('|',' ');
	return cadena;
}