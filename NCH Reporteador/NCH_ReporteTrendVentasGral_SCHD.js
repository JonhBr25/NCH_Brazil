/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.0        04 Aug 2020     jguzman
 * 1.1        14 Feb 2022     jguzman		   Se agregó nuevo campo NCH Seguimiento
 *
 */
var objContext =  nlapiGetContext();
var LMRY_script = 'NCH_Reporte_TrendVentasGral_SCHD';

// Control de Memoria
var intMaxReg = 1000;
var intMinReg = 0;
// Cuerpo del archivo
var strBodyXls = '';
var xmlStr = '';
/*** Schedule ***/

function scheduled(type) {
	var subsId = objContext.getSetting('SCRIPT', 'custscript_nch_subsidiaria_tvgral');
	var repoId = objContext.getSetting('SCRIPT', 'custscript_nch_idreporte_tvgral');
	var supeId = objContext.getSetting('SCRIPT', 'custscript_nch_supervisor_tvgral');
	supeId = (supeId == '' || supeId == null) ? '0' : supeId;
	var tex = '';

	try 
	{	
		//GARGA BUSQUEDA GUARDADA NCH Trend de Ventas Cliente/Articulo (Direcciones) Gral	
		var savedSearch = nlapiLoadSearch('transaction', 'customsearch_nch_rep_trendventasgral');
			savedSearch.addFilter(new nlobjSearchFilter('subsidiary', null, 'is', subsId));
			if (supeId != '0') 
			{
				savedSearch.addFilter(new nlobjSearchFilter('parent', 'partner', 'is', supeId));
			}
		//var searchresult = savedsearch.runSearch();

				var tex = ' this1|' + subsId + '|' + supeId + '|' + repoId;
				nlapiLogExecution('DEBUG', 'scheduled', tex);

		var columns = savedSearch.getColumns();
		//var objResult = searchresult.getResults(intMinReg, intMaxReg);
		var resultSet = savedSearch.runSearch();
	
		if (resultSet=='' || resultSet==null)
		{
			return true;
		}

		var results = [];
		var slice = [];
		var i = 0;
		var mes0 = 0, mes1 = 0, mes2 = 0, mes3 = 0, mes4 = 0, mes5 = 0, mes6 = 0, mes7 = 0, mes8 = 0;
		var mes9 = 0, mes10 = 0, mes11 = 0, mes12 = 0, mes13 = 0, mes14 = 0, mes15 = 0, mes16 = 0;
		var mes17 = 0, mes18 = 0, mes19 = 0, mes20 = 0, mes21 = 0, mes22 = 0, mes23 = 0, mes24 = 0;
		
		// XML contenido del archivo excel
//		xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
//		xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
//		xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
//	    xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
//	    xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
//	    xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">' +
//	    '<Styles>' +
//	    ' <Style ss:ID="Cabecera">' + 
//	    '  <Font ss:FontName="Arial" ss:Size="7" ss:Bold="1"/>' +
//	    '  <Alignment ss:Horizontal="Center"/>' +
//	    '  <Interior ss:Color="#D0D0D0" ss:Pattern="Solid"/>' +
//	    ' </Style>' +
//	    ' <Style ss:ID="Datos">' + 
//	    '  <Font ss:FontName="Arial" ss:Size="8"/>' +
//	    ' </Style>' + 
//	    '</Styles>';
//
//	    xmlStr += '<Worksheet ss:Name="Sheet1"><Table>';
//	    xmlStr += '<Row ss:StyleID="Cabecera">' +
//	    '<Cell><Data ss:Type="String">Subsidiaria</Data></Cell><Cell><Data ss:Type="String">Cliente</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Nombre Comercial</Data></Cell><Cell><Data ss:Type="String">Industria</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Sales Rep</Data></Cell><Cell><Data ss:Type="String">Salesrep Terminado</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Fecha de Terminación</Data></Cell><Cell><Data ss:Type="String">Dirección</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Distrito/Municipio</Data></Cell><Cell><Data ss:Type="String">Ciudad</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Sub Categoría NCH</Data></Cell><Cell><Data ss:Type="String">Artículo</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Clase</Data></Cell><Cell><Data ss:Type="String">Este mes</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace un mes</Data></Cell><Cell><Data ss:Type="String">Hace 2 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 3 meses</Data></Cell><Cell><Data ss:Type="String">Hace 4 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 5 meses</Data></Cell><Cell><Data ss:Type="String">Hace 6 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 7 meses</Data></Cell><Cell><Data ss:Type="String">Hace 8 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 9 meses</Data></Cell><Cell><Data ss:Type="String">Hace 10 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 11 meses</Data></Cell><Cell><Data ss:Type="String">Hace 12 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 13 meses</Data></Cell><Cell><Data ss:Type="String">Hace 14 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 15 meses</Data></Cell><Cell><Data ss:Type="String">Hace 16 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 17 meses</Data></Cell><Cell><Data ss:Type="String">Hace 18 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 19 meses</Data></Cell><Cell><Data ss:Type="String">Hace 20 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 21 meses</Data></Cell><Cell><Data ss:Type="String">Hace 22 meses</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">Hace 23 meses</Data></Cell><Cell><Data ss:Type="String">Hace 24 meses</Data></Cell>' +
//	    '</Row>';
		    
		do {
		    slice = resultSet.getResults(i, i + 1000);
		    slice.forEach(function(result) {
		      var resultObj = {};
		      columns.forEach(function(column) {
		        resultObj[column.getName()] = result.getValue(column);
		      });
		      results.push(resultObj);

				var campo001 = result.getValue(columns[0]);//Subsidiaria 
				var campo002 = result.getValue(columns[1]);//Cliente
				var campo003 = result.getValue(columns[2]);//Nombre Comercial
				var campo004 = result.getText(columns[3]);//NCH Seguimiento
				var campo005 = result.getValue(columns[4]);//Industria
				var campo006 = result.getValue(columns[5]);//Sales Rep
				var campo007 = result.getText(columns[6]);//Supervisor
				var campo008 = result.getValue(columns[7]);//Salesrep Terminado
				var campo009 = result.getValue(columns[8]);//Fecha de Terminación
				var campo010 = result.getValue(columns[9]);//Dirección
				var campo011 = result.getValue(columns[10]);//Distrito/Municipio
				var campo012 = result.getValue(columns[11]);//Ciudad
				var campo013 = result.getText(columns[12]);//Sub Categoría NCH
				var campo014 = result.getText(columns[13]);//Artículo
				var campo015 = result.getValue(columns[14]);//Clase
				var campo016 = result.getValue(columns[15]);//Este mes
				var campo017 = result.getValue(columns[16]);//Hace 1 mes
				var campo018 = result.getValue(columns[17]);//Hace 2 meses
				var campo019 = result.getValue(columns[18]);//Hace 3 meses
				var campo020 = result.getValue(columns[19]);//Hace 4 meses
				var campo021 = result.getValue(columns[20]);//Hace 5 meses
				var campo022 = result.getValue(columns[21]);//Hace 6 meses
				var campo023 = result.getValue(columns[22]);//Hace 7 meses
				var campo024 = result.getValue(columns[23]);//Hace 8 meses
				var campo025 = result.getValue(columns[24]);//Hace 9 meses
				var campo026 = result.getValue(columns[25]);//Hace 10 meses
				var campo027 = result.getValue(columns[26]);//Hace 11 meses
				var campo028 = result.getValue(columns[27]);//Hace 12 meses
				var campo029 = result.getValue(columns[28]);//Hace 13 meses
				var campo030 = result.getValue(columns[29]);//Hace 14 meses
				var campo031 = result.getValue(columns[30]);//Hace 15 meses
				var campo032 = result.getValue(columns[31]);//Hace 16 meses
				var campo033 = result.getValue(columns[32]);//Hace 17 meses
				var campo034 = result.getValue(columns[33]);//Hace 18 meses
				var campo035 = result.getValue(columns[34]);//Hace 19 meses
				var campo036 = result.getValue(columns[35]);//Hace 20 meses
				var campo037 = result.getValue(columns[36]);//Hace 21 meses
				var campo038 = result.getValue(columns[37]);//Hace 22 meses
				var campo039 = result.getValue(columns[38]);//Hace 23 meses
				var campo040 = result.getValue(columns[39]);//Hace 24 meses

				//Sustituyendo tabs por espacio
				campo002 = campo002.trim().replace(/\t+/g, ' ');
				campo003 = campo003.trim().replace(/\t+/g, ' ');
				campo005 = campo005.trim().replace(/\t+/g, ' ');
				campo006 = campo006.trim().replace(/\t+/g, ' ');
				campo007 = campo007.trim().replace(/\t+/g, ' ');
				campo010 = campo010.trim().replace(/\t+/g, ' ');
				campo011 = campo011.trim().replace(/\t+/g, ' ');
				campo012 = campo012.trim().replace(/\t+/g, ' ');
				campo014 = campo014.trim().replace(/\t+/g, ' ');

				//Pasando cero a campos vacíos/nulos
				campo016 = (campo016) ? campo016 : 0;
				campo017 = (campo017) ? campo017 : 0;
				campo018 = (campo018) ? campo018 : 0;
				campo019 = (campo019) ? campo019 : 0;
				campo020 = (campo020) ? campo020 : 0;
				campo021 = (campo021) ? campo021 : 0;
				campo022 = (campo022) ? campo022 : 0;
				campo023 = (campo023) ? campo023 : 0;
				campo024 = (campo024) ? campo024 : 0;
				campo025 = (campo025) ? campo025 : 0;
				campo026 = (campo026) ? campo026 : 0;
				campo027 = (campo027) ? campo027 : 0;
				campo028 = (campo028) ? campo028 : 0;
				campo029 = (campo029) ? campo029 : 0;
				campo030 = (campo030) ? campo030 : 0;
				campo031 = (campo031) ? campo031 : 0;
				campo032 = (campo032) ? campo032 : 0;
				campo033 = (campo033) ? campo033 : 0;
				campo034 = (campo034) ? campo034 : 0;
				campo035 = (campo035) ? campo035 : 0;
				campo036 = (campo036) ? campo036 : 0;
				campo037 = (campo037) ? campo037 : 0;
				campo038 = (campo038) ? campo038 : 0;
				campo039 = (campo039) ? campo039 : 0;
				campo040 = (campo040) ? campo040 : 0;
				
				//Sumatoria meses
				mes0 += parseFloat(campo016);
				mes1 += parseFloat(campo017);
				mes2 += parseFloat(campo018);
				mes3 += parseFloat(campo019);
				mes4 += parseFloat(campo020);
				mes5 += parseFloat(campo021);
				mes6 += parseFloat(campo022);
				mes7 += parseFloat(campo023);
				mes8 += parseFloat(campo024);
				mes9 += parseFloat(campo025);
				mes10 += parseFloat(campo026);
				mes11 += parseFloat(campo027);
				mes12 += parseFloat(campo028);
				mes13 += parseFloat(campo029);
				mes14 += parseFloat(campo030);
				mes15 += parseFloat(campo031);
				mes16 += parseFloat(campo032);
				mes17 += parseFloat(campo033);
				mes18 += parseFloat(campo034);
				mes19 += parseFloat(campo035);
				mes20 += parseFloat(campo036);
				mes21 += parseFloat(campo037);
				mes22 += parseFloat(campo038);
				mes23 += parseFloat(campo039);
				mes24 += parseFloat(campo040);

//			    xmlStr += '<Row ss:StyleID="Datos">' +
//			    '<Cell><Data ss:Type="String">' + campo001 + '</Data></Cell><Cell><Data ss:Type="String">' + campo002 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo003 + '</Data></Cell><Cell><Data ss:Type="String">' + campo004 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo004 + '</Data></Cell><Cell><Data ss:Type="String">' + campo006 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo007 + '</Data></Cell><Cell><Data ss:Type="String">' + campo008 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo009 + '</Data></Cell><Cell><Data ss:Type="String">' + campo010 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo011 + '</Data></Cell><Cell><Data ss:Type="String">' + campo012 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo013 + '</Data></Cell><Cell><Data ss:Type="String">' + campo014 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo015 + '</Data></Cell><Cell><Data ss:Type="String">' + campo016 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo017 + '</Data></Cell><Cell><Data ss:Type="String">' + campo018 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo019 + '</Data></Cell><Cell><Data ss:Type="String">' + campo020 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo021 + '</Data></Cell><Cell><Data ss:Type="String">' + campo022 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo023 + '</Data></Cell><Cell><Data ss:Type="String">' + campo024 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo025 + '</Data></Cell><Cell><Data ss:Type="String">' + campo026 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo027 + '</Data></Cell><Cell><Data ss:Type="String">' + campo028 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo029 + '</Data></Cell><Cell><Data ss:Type="String">' + campo030 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo031 + '</Data></Cell><Cell><Data ss:Type="String">' + campo032 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo033 + '</Data></Cell><Cell><Data ss:Type="String">' + campo034 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo035 + '</Data></Cell><Cell><Data ss:Type="String">' + campo036 + '</Data></Cell>' +
//			    '<Cell><Data ss:Type="String">' + campo037 + '</Data></Cell><Cell><Data ss:Type="String">' + campo038 + '</Data></Cell>' +
//			    '</Row>';

		//var tex = ' this5|' + slice + '|' + campo003 + '|' + '';
		//nlapiLogExecution('DEBUG', 'scheduled', tex);

				//******PARA XLS******
				strBodyXls += campo001 + '\t' + campo002 + '\t' + campo003 + '\t' + campo004 + '\t' + campo005 + '\t'; //Campos 1-5
				strBodyXls += campo006 + '\t' + campo007 + '\t' + campo008 + '\t' + campo009 + '\t' + campo010 + '\t'; //Campos 6-10
				strBodyXls += campo011 + '\t' + campo012 + '\t' + campo013 + '\t' + campo014 + '\t' + campo015 + '\t'; //Campos 11-15
				strBodyXls += campo016 + '\t' + campo017 + '\t' + campo018 + '\t' + campo019 + '\t' + campo020 + '\t'; //Campos 16-20
				strBodyXls += campo021 + '\t' + campo022 + '\t' + campo023 + '\t' + campo024 + '\t' + campo025 + '\t'; //Campos 21-25
				strBodyXls += campo026 + '\t' + campo027 + '\t' + campo028 + '\t' + campo029 + '\t' + campo030 + '\t'; //Campos 26-30
				strBodyXls += campo031 + '\t' + campo032 + '\t' + campo033 + '\t' + campo034 + '\t' + campo035 + '\t'; //Campos 31-35
				strBodyXls += campo036 + '\t' + campo037 + '\t' + campo038 + '\t' + campo039 + '\t' + campo040 + '\t'; //Campos 36-40
				strBodyXls += '\r\n';
				//******PARA XLS******
		      i++;
		    });
		  } while (slice.length >= 1000);

//	    xmlStr += '<Row>' +
//	    '<Cell><Data ss:Type="String">Total general</Data></Cell><Cell><Data ss:Type="String"></Data></Cell>' +
//	    '<Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>' +
//	    '<Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>' +
//	    '<Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>' +
//	    '<Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>' +
//	    '<Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String"></Data></Cell>' +
//	    '<Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="String">' + mes0.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes1.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes2.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes3.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes4.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes5.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes6.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes7.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes8.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes9.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes10.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes11.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes12.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes13.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes14.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes15.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes16.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes17.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes18.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes19.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes20.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes21.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes22.toFixed(2) + '</Data></Cell>' +
//	    '<Cell><Data ss:Type="String">' + mes23.toFixed(2) + '</Data></Cell><Cell><Data ss:Type="String">' + mes24.toFixed(2) + '</Data></Cell>' +
//	    '</Row>';
//
//	    xmlStr += '</Table></Worksheet></Workbook>';
		
		strBodyXls += 'Total General' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t'; //Campos 1-8
		strBodyXls += '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + mes0.toFixed(2) + '\t' + mes1.toFixed(2) + '\t'; //Campos 9-17
		strBodyXls += mes2.toFixed(2) + '\t' + mes3.toFixed(2) + '\t' + mes4.toFixed(2) + '\t' + mes5.toFixed(2) + '\t' + mes6.toFixed(2) + '\t'; //Campos 18-22
		strBodyXls += mes7.toFixed(2) + '\t' + mes8.toFixed(2) + '\t' + mes9.toFixed(2) + '\t' + mes10.toFixed(2) + '\t' + mes11.toFixed(2) + '\t'; //Campos 23-27
		strBodyXls += mes12.toFixed(2) + '\t' + mes13.toFixed(2) + '\t' + mes14.toFixed(2) + '\t' + mes15.toFixed(2) + '\t' + mes16.toFixed(2) + '\t'; //Campos 28-32
		strBodyXls += mes17.toFixed(2) + '\t' + mes18.toFixed(2) + '\t' + mes19.toFixed(2) + '\t' + mes20.toFixed(2) + '\t' + mes21.toFixed(2) + '\t'; //Campos 33-37
		strBodyXls += mes22.toFixed(2) + '\t' + mes23.toFixed(2) + '\t' + mes24.toFixed(2) + '\r\n'; //Campo 38-40

//		var tex = ' this3|' + results.length + '|' + uno + '|' + columns;
//		nlapiLogExecution('DEBUG', 'scheduled', tex);

		// Crea y graba el archivo
		savefile();
	} 
	catch(err) 
	{
		// Envio de mail si sucede error.
		//sendemail(err + tex);
		nlapiLogExecution('DEBUG', 'this0', err);
		nlapiSendEmail(20, 'jaciel.guzman@nch.com', 'Error en scheduled', err);
		
		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_log_rep_trendventagral', repoId, ['custrecord_nch_reporte_ar_vc_nombre'], ['Failed']);
	}
}

/* ------------------------------------------------------------------------------------------------------ 
 * Nota: Graba el archivo en FileCabinet
 * --------------------------------------------------------------------------------------------------- */
function savefile()
{
	try
	{
		// Ruta de la carpeta contenedora
		var folderId = objContext.getSetting('SCRIPT', 'custscript_file_cabinet_venticuatromeses');
		var repoId = objContext.getSetting('SCRIPT', 'custscript_nch_idreporte_tvgral');
		//var folderId = objContext.getSetting('SCRIPT', 'custscript_file_cabinet_ar');
		var subsId = objContext.getSetting('SCRIPT', 'custscript_nch_subsidiaria_tvgral');
		var preFix = '';
		    preFix = nlapiLookupField('subsidiary', subsId, 'tranprefix');
		
		// Genera el nombre del archivo
		var nameFile = 'TRENDVENTAS_';
			
		// Fecha del sistema
		var sysdate = new Date();
	    var prodate = nlapiDateToString(sysdate);
	
	    nameFile += preFix + '_' + Name_Date(prodate, 1);// + NuBatch;

		var urlAmbiente = '';
		var environment = objContext.getEnvironment();
		
		if (environment == 'SANDBOX') 
		{
			urlAmbiente = "https://system.sandbox.netsuite.com";
		}
		
		if (environment == 'PRODUCTION') 
		{
			urlAmbiente = "https://system.netsuite.com";
		}

    	var cabecera = 'Subsidiaria' + '\t' + 'Cliente' + '\t' + 'Nombre Comercial' + '\t' + 'NCH Seguimiento' + '\t'; //1-4
			cabecera += 'Industria' + '\t' + 'Sales Rep' + '\t' + 'Supervisor' + '\t' + 'Salesrep Terminado' + '\t'; //5-8
			cabecera += 'Fecha de Terminación' + '\t' + 'Dirección' + '\t' + 'Distrito/Municipio' + '\t' + 'Ciudad' + '\t'; //9-12
			cabecera += 'Sub Categoría NCH' + '\t' + 'Artículo' + '\t' + 'Clase' + '\t' + 'Este mes' + '\t' + 'Hace un mes' + '\t'; //13-17
			cabecera += 'Hace 2 meses' + '\t' + 'Hace 3 meses' + '\t' + 'Hace 4 meses' + '\t' + 'Hace 5 meses' + '\t'; //18-21
			cabecera += 'Hace 6 meses' + '\t' + 'Hace 7 meses' + '\t' + 'Hace 8 meses' + '\t' + 'Hace 9 meses' + '\t'; //22-25
			cabecera += 'Hace 10 meses' + '\t' + 'Hace 11 meses' + '\t' + 'Hace 12 meses' + '\t' + 'Hace 13 meses' + '\t'; //26-29
			cabecera += 'Hace 14 meses' + '\t' + 'Hace 15 meses' + '\t' + 'Hace 16 meses' + '\t' + 'Hace 17 meses' + '\t'; //30-33
			cabecera += 'Hace 18 meses' + '\t' + 'Hace 19 meses' + '\t' + 'Hace 20 meses' + '\t' + 'Hace 21 meses' + '\t'; //34-37
			cabecera += 'Hace 22 meses' + '\t' + 'Hace 23 meses' + '\t' + 'Hace 24 meses'; 
			cabecera += '\r\n';
		strBodyXls = cabecera + strBodyXls;							
				
		// Crea el archivo
		var fileExcel = nlapiCreateFile(nameFile + '.xls', 'EXCEL', nlapiEncrypt(strBodyXls, 'base64'));
			fileExcel.setEncoding('UTF-8');
			fileExcel.setFolder(folderId);
	
		// Termina de grabar el archivo
		var idFileExcel = nlapiSubmitFile(fileExcel);

		// Trae URL de archivo generado
		var idFileURLXls = nlapiLoadFile(idFileExcel);
		var urlFileXls = urlAmbiente + idFileURLXls.getURL();

		var tex = ' this2|' + repoId + '|' + subsId + '|' + urlFileXls;
		nlapiLogExecution('DEBUG', 'savefile', tex);
			
		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_log_rep_trendventagral', repoId, 
					['custrecord_nch_reporte_tvgral_nombre', 'custrecord_nch_reporte_tvgral_urlarchivo'], [nameFile , urlFileXls]);
	} 
	catch(err) 
	{
		// Envio de mail si sucede error.
		//sendemail(err + tex);
		nlapiLogExecution('DEBUG', 'this0', err);
		nlapiSendEmail(20, 'jaciel.guzman@nch.com', 'Error en saveFile()', err);

		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_log_rep_trendventagral', repoId, ['custrecord_nch_reporte_ar_vc_nombre'], ['Failed']);
	}
}

/* ------------------------------------------------------------------------------------------------------ 
 * Nota: Formato de fecha YYYYMMDD o DD/MM/YYYY
 * --------------------------------------------------------------------------------------------------- */
function Name_Date(myDate, opt) 
{
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

	if (opt==1)
	{
		var NameDate = DateYY + DateMM.substr(DateMM.length-2) + DateDD.substr(DateDD.length-2);
	}
	else 
	{
		var NameDate = DateDD.substr(DateDD.length-2) + '/' + DateMM.substr(DateMM.length-2) + '/' + DateYY;
	}
	 
	// Return File Name as a string
	return NameDate;
}

function getResultsLength(results)
{
        var length = 0;
        var count = 0, pageSize = 100;
        var currentIndex = 0;
        
        do{
                count = results.getResults(currentIndex, currentIndex + pageSize).length;
                currentIndex += pageSize;
                length += count;
        }
        while(count == pageSize);
        
        return length;
}

function getSearchResults() {
	var subsId = objContext.getSetting('SCRIPT', 'custscript_nch_subsidiaria_tvgral');
	var search = nlapiLoadSearch('transaction', 'customsearch_nch_rep_trendventasgral');
		search.addFilter(new nlobjSearchFilter('subsidiary', null, 'is', subsId));
	var columns = search.getColumns();
	var resultSet = search.runSearch();

	var results = [];
	var slice = [];
	var i = 0;

	do {
	    slice = resultSet.getResults(i, i + 1000);
	    slice.forEach(function(result) {
	      var resultObj = {};
	      columns.forEach(function(column) {
	        resultObj[column.getName()] = result.getValue(column);

			var tex = ' this4|' + results.length + '|' + column.getName() + '|' + result.getValue(column);
			nlapiLogExecution('DEBUG', 'scheduled', tex);

	      });
	      results.push(resultObj);
	      i++;
	    });
	  } while (slice.length >= 1000);

	  return results;
	}
