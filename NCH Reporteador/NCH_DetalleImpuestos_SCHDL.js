/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Feb 2022     Jaciel
 * File : NCH_DetalleImpuestos_SCHDL.js
 */
var objContext = nlapiGetContext();

// Control de Memoria
var intMaxReg = 1000;
var intMinReg = 0;
// Cuerpo del archivo
var strBody = '';
var xmlStr = '';
var extension = '.csv';
var periodstartdate = '';
var periodenddate = '';
var periodname = '';
var anioperiodoend = '';
var mesperiodo = '';
/*** Schedule ***/

function scheduled_main(type) {
	var logId = objContext.getSetting('SCRIPT', 'custscript_br_idrep_detalleimpuestos');
	var subsId = objContext.getSetting('SCRIPT', 'custscript_br_subsi_detalleimpuestos');
	var periodo = objContext.getSetting('SCRIPT', 'custscript_br_perio_detalleimpuestos');

	try {

		var tex = '** Starting Script **';
		nlapiLogExecution('DEBUG', 'scheduled', tex);

		//LECTURA DE LOS PERIODOS CONTABLES FISCALES
		if (periodo != null && periodo != '') {
			var columnFrom = nlapiLookupField('accountingperiod', periodo, ['startdate', 'enddate', 'periodname']);
			periodstartdate = columnFrom.startdate;
			periodenddate = columnFrom.enddate;
			periodname = columnFrom.periodname;
			anioperiodoend = periodenddate.substr((periodenddate.length - 4), periodenddate.length);
			mesperiodo = periodenddate.split('/')[1];
		}

		nlapiLogExecution('DEBUG', 'periodstartdate | periodenddate | periodname | anioperiodoend | mesperiodo', periodstartdate + '| ' + periodenddate + '| ' + periodname + '|' + anioperiodoend + '|' + mesperiodo);

		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_rpt_generator_log', logId, ['custrecord_nch_rg_name'], ['Procesando']);

		var hoy = nlapiDateToString(new Date(), 'date')
		var hora = nlapiDateToString(new Date(), 'timeofday')

		// XML contenido del archivo excel
		xmlStr = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>';
		xmlStr += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
		xmlStr += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
		xmlStr += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
		xmlStr += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
		xmlStr += 'xmlns:html="http://www.w3.org/TR/REC-html40">' +
			'<Styles>' +
			' <Style ss:ID="DatosCabecera">' +
			'  <Font ss:FontName="Calibri" ss:Size="8" ss:Bold="1"/>' +
			'  <Alignment ss:Horizontal="Center"/>' +
			' </Style>' +
			' <Style ss:ID="Cabecera">' +
			'  <Borders>' +
			'  <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>' +
			'  <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>' +
			'  <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>' +
			'  <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>' +
			'  </Borders>' +
			'  <Font ss:FontName="Calibri" ss:Size="8" ss:Bold="1"/>' +
			'  <Alignment ss:Horizontal="Center" ss:WrapText="1"/>' +
			' </Style>' +
			' <Style ss:ID="Datos">' +
			'  <Font ss:FontName="Calibri" ss:Size="8"/><ss:NumberFormat ss:Format="#,##0.00"/>' +
			' </Style>' +
			' <Style ss:ID="TotalNumero">' +
			'  <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1"/><ss:NumberFormat ss:Format="#,##0.00"/>' +
			'  <Alignment ss:Horizontal="Right"/>' +
			' </Style>' +
			'</Styles>';
		xmlStr += '<Worksheet ss:Name="Impostos"><Table>'; //+
		//'<Column ss:Index="2" ss:Width="260"/>';
		xmlStr += '<Row ss:StyleID="DatosCabecera">' +
			'<Cell><Data ss:Type="String"></Data></Cell><Cell ss:MergeAcross="1"><Data ss:Type="String">NCH Brasil LTDA.</Data></Cell>' +
			'</Row>' +
			'<Row ss:StyleID="DatosCabecera">' +
			'<Cell><Data ss:Type="String">Mês: ' + periodname + '</Data></Cell><Cell ss:MergeAcross="1"><Data ss:Type="String">Detalhes dos impostos</Data></Cell>' +
			'</Row>' +
			'<Row><Cell><Data ss:Type="String"></Data></Cell></Row>' +
			'<Row><Cell><Data ss:Type="String"></Data></Cell></Row>';

		strBody += '' + '\t' + 'NCH Brasil LTDA.' + '\r\n';
		strBody += 'Mês: ' + periodname + '\t' + 'Detalhes dos impostos' + '\r\n';
		strBody += '\r\n';
		strBody += '\r\n';

		//Trae listado de impuestos
		var idImposto = [];
		var nombreImposto = [];
		var filters = new Array();
		filters[0] = new nlobjSearchFilter('country', null, 'anyof', 'BR');
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('internalid');
		columns[1] = new nlobjSearchColumn('description');
		columns[2] = new nlobjSearchColumn('name');
		var buscaImpuestos = nlapiSearchRecord('salestaxitem', null, filters, columns);

		if (buscaImpuestos != null) {
			for (var i = 0; i < buscaImpuestos.length; i++) {
				var internalId = buscaImpuestos[i].getValue('internalid');
				var nombre = buscaImpuestos[i].getValue('name');
				idImposto.push(internalId);
				nombreImposto.push(nombre);
			}
		}

		xmlStr += '<Row>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>' +
			'<Cell><Data ss:Type="String"></Data></Cell>';

		strBody += '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' + '\t' + '' +
			'\t' + '' + '\t' + '' + '\t';

		if (buscaImpuestos != null) {
			for (var i = 0; i < nombreImposto.length; i++) {
				xmlStr += '<Cell><Data ss:Type="String">Base Calculo</Data></Cell>' +
					'<Cell><Data ss:Type="String">Aliquota</Data></Cell>' +
					'<Cell><Data ss:Type="String">Valor del Impuesto</Data></Cell>';

				strBody += 'Base Calculo' + '\t' + 'Aliquota' + '\t' + 'Valor del Impuesto' + '\t';
			}
		}
		else {
			xmlStr += '<Cell><Data ss:Type="String">--nombreError--</Data></Cell>' +
				'<Cell><Data ss:Type="String">--nombreError--</Data></Cell>' +
				'<Cell><Data ss:Type="String">--nombreError--</Data></Cell>';

			strBody += '--nombreError--' + '\t' + '--nombreError--' + '\t' + '--nombreError--' + '\t';
		}
		//strBody += '\r\n';

		xmlStr += '</Row>';
		xmlStr += '<Row ss:StyleID="Cabecera">' +
			'<Cell><Data ss:Type="String">Tipo</Data></Cell>' +
			'<Cell><Data ss:Type="String">CFOP</Data></Cell>' +
			'<Cell><Data ss:Type="String">Município</Data></Cell>' +
			'<Cell><Data ss:Type="String">Estado</Data></Cell>' +
			'<Cell><Data ss:Type="String">Categoría</Data></Cell>' +
			'<Cell><Data ss:Type="String">Referencia</Data></Cell>' +
			'<Cell><Data ss:Type="String">Data</Data></Cell>' +
			'<Cell><Data ss:Type="String">Fornecedor</Data></Cell>' +
			'<Cell><Data ss:Type="String">Item</Data></Cell>' +
			'<Cell><Data ss:Type="String">Descricao</Data></Cell>' +
			'<Cell><Data ss:Type="String">Cuenta Inv/Despesa</Data></Cell>' +
			'<Cell><Data ss:Type="String">Valor</Data></Cell>';

		strBody += '\r\n' + 'Tipo' + '\t' + 'CFOP' + '\t' + 'Município' + '\t' + 'Estado' + '\t' + 'Categoría' + '\t' + 'Referencia' + '\t' +
			'Data' + '\t' + 'Fornecedor' + '\t' + 'Item' + '\t' + 'Descricao' + '\t' + 'Cuenta Inv/Despesa' + '\t' + 'Valor' + '\t';

		if (buscaImpuestos != null) {
			for (var i = 0; i < nombreImposto.length; i++) {
				var celda = '<Cell><Data ss:Type="String">' + nombreImposto[i] + '</Data></Cell>';
				xmlStr += celda + celda + celda;

				var celdacsv = nombreImposto[i];
				strBody += celdacsv + '\t' + celdacsv + '\t' + celdacsv + '\t';
			}
		}
		else {
			xmlStr += '<Cell><Data ss:Type="String">--impostoError--</Data></Cell>' +
				'<Cell><Data ss:Type="String">--impostoError--</Data></Cell>' +
				'<Cell><Data ss:Type="String">--impostoError--</Data></Cell>';

			strBody += '--impostoError--' + '\t' + '--impostoError--' + '\t' + '--impostoError--' + '\t';
		}
		strBody += '\r\n';

		xmlStr += '</Row>';

		//GARGA BUSQUEDA GUARDADA NCH Detalhes Impostos (script)
		var savedSearch = nlapiLoadSearch(null, 'customsearch_nch_detalhes_impostos');
		savedSearch.addFilter(new nlobjSearchFilter('postingperiod', null, 'anyof', periodo));
		//savedSearch.addFilter(new nlobjSearchFilter('internalid', null, 'is', 3086));

		var columns = savedSearch.getColumns();
		var resultSet = savedSearch.runSearch();

		if (resultSet == '' || resultSet == null) {
			return true;
		}

		//Busca resultados en búsqueda NCH Cobranca Detalhes Impostos (script)
		/*var filtros = new Array();
			filtros[0] = new nlobjSearchFilter('postingperiod', null, 'anyof', periodo);
			//filtros[1] = new nlobjSearchFilter('internalid', 'custrecord_o2s_det_imp_l_transaction', 'anyof', '16976463');
		var columnas = new Array();
			columnas[0] = new nlobjSearchColumn('memo', null, 'group');
			columnas[1] = new nlobjSearchColumn('customscript', null, 'group');
			columnas[2] = new nlobjSearchColumn('amount', null, 'group'); 
			columnas[3] = new nlobjSearchColumn('account', null, 'group'); 
			//columnas[4] = new nlobjSearchColumn('number', 'custrecord_o2s_det_imp_l_transaction', 'group'); 
			columnas[4] = new nlobjSearchColumn('internalid', null, 'group'); 
			columnas[5] = new nlobjSearchColumn('mainname', null, 'group'); 
			columnas[6] = new nlobjSearchColumn('custcol_o2s_t_transac_item_line_ref', null, 'group'); 
			columnas[7] = new nlobjSearchColumn('item', null, 'group');

			for (var i = 0; i < buscaDatos.length; i++) 
			{
				var	memo = buscaDatos[i].getValue('memo', null, 'group'); 
				var script = buscaDatos[i].getValue('customscript', null, 'group'); 
				var amount = parseFloat(buscaDatos[i].getValue('amount', null, 'group')); 
				var account = buscaDatos[i].getText('account', null, 'group'); 
				//var numero = buscaDatos[i].getValue('number', 'custrecord_o2s_det_imp_l_transaction', 'group');
				var idInterno = buscaDatos[i].getValue('internalid', null, 'group'); 
				var nombre = buscaDatos[i].getText('mainname', null, 'group'); 
				var linea = buscaDatos[i].getValue('custcol_o2s_t_transac_item_line_ref', null, 'group'); 
				var articulo = buscaDatos[i].getValue('item', null, 'group');
			}*/

		//GARGA BUSQUEDA GUARDADA NCH Cobranca Detalhes Impostos (script)
		var buscaDatos = nlapiLoadSearch(null, 'customsearch_nch_cobranca_detalle_imp_br');
		buscaDatos.addFilter(new nlobjSearchFilter('postingperiod', null, 'anyof', periodo))
		//buscaDatos.addFilter(new nlobjSearchFilter('internalid', null, 'is', 3086));

		var columnas = buscaDatos.getColumns();
		var resultados = buscaDatos.runSearch();

		var cabeceraDatos = [];
		var h = 0;

		do {
			parte = resultados.getResults(h, h + 1000);
			parte.forEach(function (result) {
				var resultaObj = {};
				columnas.forEach(function (column) {
					resultaObj[column.getName()] = result.getValue(column);
				});

				var dato001 = result.getValue(columnas[0]);//IdInterno
				var dato002 = result.getText(columnas[3]);//Nome da Linha Principal
				var dato003 = result.getValue(columnas[4]);//Memorando
				var dato004 = result.getValue(columnas[5]);//Script Personalizado
				var dato005 = result.getValue(columnas[6]);//Valor
				var dato006 = result.getText(columnas[7]);//Conta
				var dato007 = result.getValue(columnas[8]);//Id da Linha (item)
				var dato008 = result.getValue(columnas[9]);//Item
				var dato009 = result.getText(columnas[11]);//Tipo
				var dato010 = result.getText(columnas[12]);//CFOP
				var dato011 = result.getText(columnas[13]);//Município (proveedor)
				var dato012 = result.getValue(columnas[16]);//Estado (proveedor)
				var dato013 = result.getText(columnas[15]);//Categoría

				//Script Personalizado
				if (dato004 == '- None -') {
					//Despesas			
					if (dato008 == '- None -' || dato008 == '' || dato008 == null) {
						cabeceraDatos.push(dato001 + '|' + dato002 + '|' + dato003 + '|' + dato006 + '|' + Math.abs(dato005).toFixed(2) + '|' +
							dato007 + '|' + 'd' + '|' + dato009 + '|' + dato010 + '|' + dato011 + '|' + dato012 + '|' + dato013);
					}
					else	//Itens
					{
						cabeceraDatos.push(dato001 + '|' + dato002 + '|' + dato003 + '|' + dato006 + '|' + Math.abs(dato005).toFixed(2) + '|' +
							dato007 + '|' + 'i' + '|' + dato009 + '|' + dato010 + '|' + dato011 + '|' + dato012 + '|' + dato013);
					}
				}

				if (dato001 == 3086 || dato001 == 24092) {
					// nlapiLogExecution('DEBUG', 'this4', parte.length + '|' + dato001 + '|' + dato008 + '|' + cabeceraDatos);
				}

				h++;
			});
		} while (parte.length >= 1000);

		var i = 0, cobranca = 0, lineaImpuesto = 0, cobrancaOriginal = 0;
		var datoNulo = '<Cell><Data ss:Type="Number">' + '0' + '</Data></Cell>';
		var cobrancaValores = [], cobrancaDatos = [];
		var cobLin = '', documento = '';
		var valoresJuntos = '', datosJuntos = '';
		var valoresImprime = [];
		var imprime = false;
		var cuenta = 1;

		do {
			slice = resultSet.getResults(i, i + 1000);
			slice.forEach(function (result) {
				var resultObj = {};
				columns.forEach(function (column) {
					resultObj[column.getName()] = result.getValue(column);
				});

				var campo000 = '';//Vacío
				var campo001 = result.getValue(columns[0]);//Identificador único transação
				var campo002 = result.getValue(columns[1]);//Transação : ID interno
				var campo003 = result.getValue(columns[2]);//Transação : Número do documento
				var campo004 = result.getValue(columns[3]);//Transação : Data
				var campo005 = result.getValue(columns[4]);//Número da Linha do item
				var campo006 = result.getText(columns[5]);//Item
				var campo007 = result.getValue(columns[6]);//Valor Líquido
				var campo008 = result.getValue(columns[7]);//Código do Imposto
				var campo009 = result.getValue(columns[8]);//Base Cálculo
				var campo010 = result.getValue(columns[9]);//Alíquota
				var campo011 = result.getValue(columns[10]);//Valor Imposto

				cobLin = campo002.toString() + campo005;
				//cuenta = 1;

				if (cobranca == 0) {
					datosJuntos = campo003 + '|' + campo004 + '|' + campo006;
					valoresJuntos = campo008 + '|' + campo009 + '|' + campo010 + '|' + campo011;
					cobrancaDatos.push(datosJuntos);
					cobrancaValores.push(valoresJuntos);

					cobranca = campo002.toString() + campo005;
					cobrancaOriginal = campo002;
					lineaImpuesto = campo005;
					documento = campo003;
				}
				else {
					//Si la cobranca es otra la asignamos
					if (cobranca != cobLin) {
						var datos = cobrancaDatos[0].split("|");

						//Formato datos
						//datos[2] = (datos[2] == '- None -') ? 'None' : datos[2];

						for (var y = 0; y < cabeceraDatos.length; y++) {
							var cabecera = cabeceraDatos[y].split("|");
							var tipoItem = '', cfop = '', municipio = '', estado = '', categoria = '';
							var nombreCampo = '', descripcionCampo = '', cuentaCampo = '';
							var montoCampo = 0, linhaImposto = '', tipo = '';

							//if (cobrancaOriginal == cabecera[0]) //&& lineaImpuesto == cuenta) 
							if (cobrancaOriginal == cabecera[0] && lineaImpuesto == cabecera[5]) {
								nombreCampo = cabecera[1];
								descripcionCampo = cabecera[2];
								cuentaCampo = cabecera[3];
								montoCampo = cabecera[4];
								linhaImposto = cabecera[5];
								tipo = cabecera[6];
								tipoItem = cabecera[7];
								cfop = cabecera[8];
								municipio = cabecera[9];
								estado = cabecera[10];
								categoria = cabecera[11];

								if (cabecera[0] == 3086) {
									// nlapiLogExecution('DEBUG', 'this1', cabeceraDatos.length + '|linha_' + cabecera[5] + '|' + cabecera[2] + '|' + cabecera[3] + '|' + cabecera[8] + '|' + y);
									// nlapiLogExecution('DEBUG', 'this3', cabeceraDatos.length + '|linhaC_' + cabecera[5] + '|linhaD_' + lineaImpuesto + '|' + cabecera[6]);
								}

								cabeceraDatos.splice(y, 1);

								//Formato datos
								tipoItem = (tipoItem == '- None -') ? 'None' : tipoItem;
								//cfop = (cfop == '- None -') ? 'None' : cfop;
								//estado = (estado == '- None -') ? 'None' : estado;

								break;
							}
						}

						//Cuando no tienen impuestos entra aquí para traer los datos de cabecera
						if (nombreCampo == '') {
							for (var y = 0; y < cabeceraDatos.length; y++) {
								var cabecera = cabeceraDatos[y].split("|");
								var tipoItem = '', cfop = '', municipio = '', estado = '', categoria = '';
								var nombreCampo = '', descripcionCampo = '', cuentaCampo = '';
								var montoCampo = 0, linhaImposto = '', tipo = '';

								if (cobrancaOriginal == cabecera[0]) { //&& lineaImpuesto == cuenta) 
									// if (cobrancaOriginal == cabecera[0] && lineaImpuesto == cabecera[5]) {
									nombreCampo = cabecera[1];
									descripcionCampo = cabecera[2];
									cuentaCampo = cabecera[3];
									montoCampo = cabecera[4];
									linhaImposto = cabecera[5];
									tipo = cabecera[6];
									tipoItem = cabecera[7];
									cfop = cabecera[8];
									municipio = cabecera[9];
									estado = cabecera[10];
									categoria = cabecera[11];

									if (cabecera[0] == 3086) {
										// nlapiLogExecution('DEBUG', 'this1', cabeceraDatos.length + '|linha_' + cabecera[5] + '|' + cabecera[2] + '|' + cabecera[3] + '|' + cabecera[8] + '|' + y);
										// nlapiLogExecution('DEBUG', 'this3', cabeceraDatos.length + '|linhaC_' + cabecera[5] + '|linhaD_' + lineaImpuesto + '|' + cabecera[6]);
									}

									cabeceraDatos.splice(y, 1);

									//Formato datos
									tipoItem = (tipoItem == '- None -') ? 'None' : tipoItem;
									//cfop = (cfop == '- None -') ? 'None' : cfop;
									//estado = (estado == '- None -') ? 'None' : estado;

									break;
								}
							}
						}

						//Cuando no tienen impuestos entra aquí para traer los datos de cabecera
						/* if (nombreCampo == '') {
							nombreCampo = cabecera[1];
							descripcionCampo = cabecera[2];
							cuentaCampo = cabecera[3];
							montoCampo = cabecera[4];
							linhaImposto = cabecera[5];
							tipo = cabecera[6];
							tipoItem = cabecera[7];
							cfop = cabecera[8];
							municipio = cabecera[9];
							estado = cabecera[10];
							categoria = cabecera[11];

							cabeceraDatos.splice(y, 1);

							//Formato datos
							tipoItem = (tipoItem == '- None -') ? 'None' : tipoItem;
						} */

						if (extension == '.csv') {
							var buscaExpReg = /\,/g;
							nombreCampo = nombreCampo.replace(buscaExpReg, '_');
							datos[2] = datos[2].replace(buscaExpReg, '_');
							datos[2] = datos[2].replace(/\;/g, '_');
							descripcionCampo = descripcionCampo.replace(buscaExpReg, '_');
							descripcionCampo = descripcionCampo.replace(/\n/g, ' ');
							cuentaCampo = cuentaCampo.replace(buscaExpReg, '_');
						}

						xmlStr += '<Row ss:StyleID="Datos">' +
							//xmlStr += '<Row>' +
							'<Cell><Data ss:Type="String">' + tipoItem + '</Data></Cell><Cell><Data ss:Type="String">' + cfop + '</Data></Cell>' +
							'<Cell><Data ss:Type="String">' + municipio + '</Data></Cell><Cell><Data ss:Type="String">' + estado + '</Data></Cell>' +
							'<Cell><Data ss:Type="String">' + categoria + '</Data></Cell><Cell><Data ss:Type="String">' + datos[0] + '</Data></Cell>' +
							'<Cell><Data ss:Type="String">' + datos[1] + '</Data></Cell><Cell><Data ss:Type="String">' + nombreCampo + '</Data></Cell>' +
							'<Cell><Data ss:Type="String">' + datos[2] + '</Data></Cell><Cell><Data ss:Type="String">' + descripcionCampo + '</Data></Cell>' +
							'<Cell><Data ss:Type="String">' + cuentaCampo + '</Data></Cell><Cell><Data ss:Type="Number">' + montoCampo + '</Data></Cell>';

						strBody += tipoItem + '\t' + cfop + '\t' + municipio + '\t' + estado + '\t' + categoria + '\t' + datos[0] + '\t' +
							datos[1] + '\t' + nombreCampo + '\t' + datos[2] + '\t' + descripcionCampo + '\t' + cuentaCampo + '\t' +
							montoCampo + '\t';

						// var uno = tipoItem + '\t' + cfop + '\t' + municipio + '\t' + estado + '\t' + categoria + '\t' + datos[0] + '\t' + 
						// datos[1] + '\t' + nombreCampo + '\t' + datos[2] + '\t' + descripcionCampo + '\t' + cuentaCampo + '\t' + 
						// montoCampo + '\t';
						if (cabecera[0] == 3086) {
							// nlapiLogExecution('DEBUG', 'this2', cabeceraDatos.length + '|linha_' + lineaImpuesto + '|' + descripcionCampo + '|' + cfop + '|' + datos[2] + '|' + i);
						}

						//Ciclo para colocar los valores en los códigos de impuestos relacionados					    
						for (var j = 0; j < idImposto.length; j++) {
							for (var x = 0; x < cobrancaValores.length; x++) {
								var valores = cobrancaValores[x].split("|");
								valoresImprime.push(valores);
								//var imprime = () ? true : false;
								if (idImposto[j] == valores[0]) {
									imprime = true;
									break;
								}
								else {
									imprime = false;
								}
							}

							xmlStr += (imprime == true) ? '<Cell><Data ss:Type="Number">' + parseFloat(valores[1]).toFixed(2) + '</Data></Cell>' +
								'<Cell><Data ss:Type="Number">' + parseFloat(valores[2]).toFixed(2) + '</Data></Cell>' +
								'<Cell><Data ss:Type="Number">' + parseFloat(valores[3]).toFixed(2) + '</Data></Cell>'
								: datoNulo + datoNulo + datoNulo;

							strBody += (imprime == true) ? parseFloat(valores[1]).toFixed(2) + '\t' + parseFloat(valores[2]).toFixed(2) + '\t' +
								parseFloat(valores[3]).toFixed(2) + '\t'
								: '0' + '\t' + '0' + '\t' + '0' + '\t';
						}

						xmlStr += '</Row>';
						strBody += '\r\n';

						cobrancaDatos = [];
						cobrancaValores = [];
						valoresImprime = [];

						cobranca = campo002.toString() + campo005;
						cobrancaOriginal = campo002;
						lineaImpuesto = campo005;
						documento = campo003;
						cuenta = (lineaImpuesto == 1) ? 1 : (cuenta + 1);
						datosJuntos = campo003 + '|' + campo004 + '|' + campo006;
						cobrancaDatos.push(datosJuntos);
					}

					valoresJuntos = campo008 + '|' + campo009 + '|' + campo010 + '|' + campo011;
					cobrancaValores.push(valoresJuntos);
				}

				i++;
			});
		} while (slice.length >= 1000);

		xmlStr += '</Table></Worksheet></Workbook>';

		// Crea y graba el archivo
		savefile();

		var usage = nlapiGetContext().getRemainingUsage();
		nlapiLogExecution('DEBUG', 'Units Remaining', usage);
		nlapiLogExecution('DEBUG', 'scheduled', '** End Script **')

	} catch (err) {
		// Envio de mail si sucede error.
		nlapiSendEmail(20, 'jaciel.guzman@nch.com', 'Error scheduled_main', err + ' - ' + err.lineNumber);
		nlapiLogExecution('DEBUG', 'Error', err);

		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_rpt_generator_log', logId, ['custrecord_nch_rg_name'], ['Failed']);
	}
}

/* ------------------------------------------------------------------------------------------------------ 
 * Nota: Graba el archivo en FileCabinet
 * --------------------------------------------------------------------------------------------------- */
function savefile() {
	// Ruta de la carpeta contenedora: SuiteFiles_NCH > Files Generator_BR
	var folderId = 5259;
	var subsId = objContext.getSetting('SCRIPT', 'custscript_br_subsi_detalleimpuestos');
	var logId = objContext.getSetting('SCRIPT', 'custscript_br_idrep_detalleimpuestos');

	// RUC SUBSIDIARY
	var featuresubs = objContext.getFeature('SUBSIDIARIES');

	// Genera el nombre del archivo
	var nameFile = '';
	nameFile += mesperiodo + '-' + anioperiodoend.substr(2) + ' DetalhesImpostos';

	//Excel con formato
	//strBody = xmlStr;
	var nameFile_Show = '';

	nlapiLogExecution('DEBUG', 'Nombre Archivo', nameFile);

	//var extension = '.xls';

	//Crea el file XLS
	var file = (extension == '.xls')
		? nlapiCreateFile(nameFile + extension, 'EXCEL', nlapiEncrypt(strBody, 'base64'))
		: nlapiCreateFile(nameFile + extension, 'CSV', strBody);
	//var file = nlapiCreateFile(nameFile + extension, 'EXCEL', nlapiEncrypt(strBody, 'base64'));	//funciona, imprime carácteres extraños
	//var file = nlapiCreateFile(nameFile + extension, 'EXCEL', strBody); //failed
	//var file = nlapiCreateFile(nameFile + extension, 'CSV', strBody);	//sale todo junto
	//var file = nlapiCreateFile(nameFile + extension, 'PLAINTEXT', strBody);	//sale todo junto
	file.setEncoding('windows-1252');
	var fileSize = file.getSize();

	// nlapiLogExecution('DEBUG', 'this0', nameFile + '|' + folderId + '|' + fileSize);

	file.setFolder(folderId);

	nameFile_Show = nameFile + extension;

	// Termina de grabar el archivo
	var idfile = nlapiSubmitFile(file);

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
	nlapiSubmitField('customrecord_nch_rpt_generator_log', logId, ['custrecord_nch_rg_name', 'custrecord_nch_rg_url_file'], [nameFile_Show, urlfile]);
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
		if (myDate.substr(i, 1) == '.' || myDate.substr(i, 1) == '/') {
			tramo++;
		} else {
			if (tramo == 1) {
				DateDD = DateDD + myDate.substr(i, 1);
			}
			if (tramo == 2) {
				DateMM = DateMM + myDate.substr(i, 1);
			}
		}
	}
	if (opt == 1) {
		var NameDate = DateYY + DateMM.substr(DateMM.length - 2) + DateDD.substr(DateDD.length - 2);
	} else {
		var NameDate = DateDD.substr(DateDD.length - 2) + '/' + DateMM.substr(DateMM.length - 2) + '/' + DateYY;
	}

	// Return File Name as a string
	return NameDate;
}