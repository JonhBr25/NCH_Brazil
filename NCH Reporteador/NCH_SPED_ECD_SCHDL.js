/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 Abr 2025     Jonathan
 * File : NCH_SPED_ECD_SCHDL.js
 */
var objContext =  nlapiGetContext();
var LMRY_EMails = 'jonathan.jimenez@nch.com';

// Control de Memoria
var intMaxReg = 1000;
var intMinReg = 0;
// Cuerpo del archivo
var strBody = '';
var periodstartdate	= '';
var periodenddate	= '';
var periodname 		= '';
var anioperiodoend	= '';
var mesperiodo		= '';
var OutputF			= '';
/*** Schedule ***/

function scheduled_main(type) 
{
	var Ilogid 		= objContext.getSetting('SCRIPT', 'custscript_br_idrep_sped_ecd');
	var Subsid 		= objContext.getSetting('SCRIPT', 'custscript_br_subsi_sped_ecd');
	var Periodo_ini = objContext.getSetting('SCRIPT', 'custscript_br_perio_sped_ecdini');
	var Periodo_fin = objContext.getSetting('SCRIPT', 'custscript_br_perio_sped_ecfin');
		OutputF 	= 'txt';

	try 
	{
		
		var tex = '** Starting Script **';
		nlapiLogExecution('DEBUG', 'scheduled', tex);

		//LECTURA DE LOS PERIODOS CONTABLES FISCALES
		if (Periodo_ini!=null && Periodo_ini!='')
		{
		    var columnFrom_ini 	= nlapiLookupField('accountingperiod', Periodo_ini, ['startdate','enddate','periodname']);
		    periodstartdate_ini = columnFrom_ini.startdate;
		    periodenddate_ini 	= columnFrom_ini.enddate;
		    periodname_ini 		= columnFrom_ini.periodname;
		    anioperiodoend_ini  = periodenddate_ini.substr((periodenddate_ini.length - 4), periodenddate_ini.length);
		    mesperiodo_ini  	= periodenddate_ini.split('/')[1];
		}

		if (Periodo_fin!=null && Periodo_fin!='')
		{
		    var columnFrom_end 	= nlapiLookupField('accountingperiod', Periodo_fin, ['startdate','enddate','periodname']);
		    periodstartdate_end = columnFrom_end.startdate;
		    periodenddate_end 	= columnFrom_end.enddate;
		    periodname_end 		= columnFrom_end.periodname;
		    anioperiodoend_end  = periodenddate_end.substr((periodenddate_end.length - 4), periodenddate_end.length);
		    mesperiodo_end  	= periodenddate_end.split('/')[1];
		}

		//LOAD SUBSIDIARY FIELDS
		var subs_fields 		= ['legalname','custrecord_brl_subsd_t_fed_tx_reg','custrecord_brl_subsd_t_state_tx_reg','custrecord_brl_subsd_t_municip_tx_reg'];
  		var objsubsidiary 		= nlapiLookupField('subsidiary',Subsid,subs_fields);
  		var subsi_name	 		= objsubsidiary.legalname;
  		var subsi_taxid			= objsubsidiary.custrecord_brl_subsd_t_fed_tx_reg;
  		var subsi_subsc			= objsubsidiary.custrecord_brl_subsd_t_state_tx_reg;
  		var subsi_munic			= objsubsidiary.custrecord_brl_subsd_t_municip_tx_reg;

		nlapiLogExecution('DEBUG', 'periodstartdate_ini | periodenddate_end ', periodstartdate_ini + '| ' + periodenddate_end );
		
		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_rpt_generator_log', Ilogid, ['custrecord_nch_rg_name'], ['Procesando']);

		//****** REGISTRO 0000 **********************************************************************

		var reg0000_1 	= '0000';													
		var reg0000_2 	= 'LECD';													
		var reg0000_3 	= periodstartdate_ini.replace(/\/+/g,'');					
		var reg0000_4 	= '3112'+anioperiodoend_end; 
		var reg0000_5	= subsi_name;
		var reg0000_6 	= subsi_taxid.replace(/[./-]+/g,'');
		var reg0000_7 	= 'SP';
		var reg0000_8 	= subsi_subsc;
		var reg0000_9 	= '3552205';
		var reg0000_10 	= subsi_munic;
		var reg0000_11 	= '';													
		var reg0000_12 	= '0';													
		var reg0000_13 	= '1'; //SE MUDA A 0 PARA REPORTE DE 2024
        //var reg0000_13 = '0';					
		var reg0000_14 	= '0';
		var reg0000_15	= '';
		var reg0000_16 	= '0';
		var reg0000_17 	= '0';
		var reg0000_18 	= '';
		var reg0000_19 	= 'N';
		var reg0000_20 	= 'N';
		var reg0000_21 	= '0';
		var reg0000_22 	= '0';
		var reg0000_23 	= '1';


		strBody += '|' + reg0000_1 + '|' + reg0000_2 + '|' + reg0000_3 + '|' + reg0000_4 + '|' + reg0000_5 + '|' + reg0000_6 + '|' + reg0000_7 + '|' + reg0000_8 + '|';
		strBody += reg0000_9 + '|' + reg0000_10 + '|' + reg0000_11 + '|' + reg0000_12 + '|' + reg0000_13 + '|' + reg0000_14 + '|' + reg0000_15 + '|' + reg0000_16 + '|';
		strBody += reg0000_17 + '|' + reg0000_18 + '|' + reg0000_19 + '|' + reg0000_20 + '|' + reg0000_21 + '|' + reg0000_22 + '|' + reg0000_23 + '|';
		strBody += '\r\n';

		//****** REGISTRO 0001 **********************************************************************

		var reg0001_1 	= '0001';													
		var reg0001_2 	= '0';													
		
		strBody += '|' + reg0001_1 + '|' + reg0001_2 + '|';
		strBody += '\r\n';

		//****** REGISTRO 0007 **********************************************************************

		var reg0007_1 	= '0007';													
		var reg0007_2 	= '00';	
		var reg0007_3 	= '';

		strBody += '|' + reg0007_1 + '|' + reg0007_2 + '|' + reg0007_3 + '|';
		strBody += '\r\n';	

		//****** REGISTRO 0990 **********************************************************************

		var reg0990_1 	= '0990';													
		var reg0990_2 	= '00004';	

		strBody += '|' + reg0990_1 + '|' + reg0990_2 + '|';
		strBody += '\r\n';	

		//****** Bloco I: Lançamentos Contábeis  ****************************************************
		var Count_Regi = 0;
		//****** REGISTRO I001 **********************************************************************

		var regI001_1 	= 'I001';													
		var regI001_2 	= '0';
		var cont_regI001 = 	1;
			Count_Regi = Count_Regi + cont_regI001;

		strBody += '|' + regI001_1 + '|' + regI001_2 + '|';
		strBody += '\r\n';	

		//****** REGISTRO I010 **********************************************************************

		var regI010_1 	= 'I010';													
		var regI010_2 	= 'G';
		var regI010_3 	= '9.00';	
		var cont_regI010 = 	1;
			Count_Regi = Count_Regi + cont_regI010;

		strBody += '|' + regI010_1 + '|' + regI010_2 + '|' + regI010_3 + '|';
		strBody += '\r\n';	

		//****** REGISTRO I030 **********************************************************************

		var regI030_1 	= 'I030';													
		var regI030_2 	= 'TERMO DE ABERTURA';
		var regI030_3 	= '17';			//NUMERO CONSECUTIVO DE LIBRO A REPORTAR
		var regI030_4 	= 'LIVRO DIARIO GERAL';
		var regI030_5 	= '?????'; 		//CONTADOR TOTAL DE LINEAS EN FILE
		var regI030_6 	= subsi_name;
		var regI030_7 	= '35202612057';
		var regI030_8 	= subsi_taxid.replace(/[./-]+/g,'');
		var regI030_9 	= '14031974';	
		var regI030_10 	= '';
		var regI030_11	= 'SOROCABA';
		var regI030_12	= '3112'+anioperiodoend_end;
		var cont_regI030 = 	1;
			Count_Regi = Count_Regi + cont_regI030;


		strBody += '|' + regI030_1 + '|' + regI030_2 + '|' + regI030_3 + '|' + regI030_4 + '|' + regI030_5 + '|' + regI030_6 + '|' + regI030_7 + '|' + regI030_8 + '|';
		strBody += regI030_9 + '|' + regI030_10 + '|' + regI030_11 + '|' + regI030_12 + '|';
		strBody += '\r\n';	
				
		//GARGA BUSQUEDA GUARDADA -  NCH BR Plano de Contas Speed ECD (Script)		
		var savedSearch = nlapiLoadSearch(null,'customsearch_nch_plano_contas_br');	
		
		var columns   	= savedSearch.getColumns();
		var resultSet 	= savedSearch.runSearch();	
		var results 	= [];
		var slice	 	= [];
		var i 			= 0;
		var idtrans 	= 0;
		var cont_regI050= 0;
		var cont_regI051= 0;
		var cont_regI052= 0;

		do
		{
			slice = resultSet.getResults(i, i + 1000);
		    slice.forEach(function(result) 
		    {
		      var resultObj = {};
		      columns.forEach(function(column) 
		      {
		        resultObj[column.getName()] = result.getValue(column);
		      });
		      
		      results.push(resultObj);

	      		idtrans = result.getValue(columns[0]);//INTERNALID

	      		//****** REGISTRO I050 **********************************************************************

	      		var regI050_1 = result.getValue(columns[2]);//NUM REGISTRO I050
				var regI050_2 = result.getValue(columns[3]).replace(/\/+/g,'');;//DATA INICIO
				var regI050_3 = result.getValue(columns[4]);//NATURALEZA DA CONTA
				var regI050_4 = result.getValue(columns[5]);//SINTETICA|ANALITICA
				var regI050_5 = result.getValue(columns[7]);//NIVEL
				var regI050_6 = result.getValue(columns[6]);//NUMERO DE CUENTA LEGAL
				var regI050_7 = result.getValue(columns[9]);//CODIGO CUENTA SINTETICA CUENTA PAI
				var regI050_8 = result.getValue(columns[10]);//NOME DA CONTA
				var regI050_9 = result.getValue(columns[11]);//NUMERO CONTA SPED
				var reg_empty = '';
				
				strBody += '|' + regI050_1 + '|' + regI050_2 + '|' + regI050_3 + '|' + regI050_4 + '|' + regI050_5 + '|';
				strBody += regI050_6 + '|' + regI050_7 + '|' + regI050_8 + '|';
				strBody += '\r\n';

				cont_regI050 = cont_regI050 + 1;		

				//****** REGISTRO I051 **********************************************************************
				//****** REGISTRO I052 **********************************************************************
				if( regI050_4 == 'A')
				{
					strBody += '|' + 'I051' + '|' + reg_empty + '|' + regI050_9 + '|';
					strBody += '\r\n';	

					strBody += '|' + 'I052' + '|' + reg_empty + '|' + regI050_6 + '|';
					strBody += '\r\n';	

					cont_regI051 = cont_regI051 + 1;
					cont_regI052 = cont_regI052 + 1;
				}

				i++;
		    });
		} while (slice.length >= 1000);

		Count_Regi = Count_Regi + cont_regI050;
		Count_Regi = Count_Regi + cont_regI051;
		Count_Regi = Count_Regi + cont_regI052;

		  //****** REGISTRO I100 **********************************************************************
		  
		  //LOAD NCH BR Centros de Costos (Departamento)
		  var savedSearch_dept 	= nlapiLoadSearch(null,'customsearch_br_centro_costo_dept');
		      savedSearch_dept.addFilter(new nlobjSearchFilter('name', null, 'doesnotcontain', 'No-Departamento'));
		  var columns_dept   	= savedSearch_dept.getColumns();
		  var resultSet_dept	= savedSearch_dept.runSearch();
		  var results_dept 		= resultSet_dept.getResults(0, 20);
		  var cont_regI100		= 0;

		  	for(var j=0;j<results_dept.length;j++)
			{
			    var regI100_1 = 'I100';
			    var regI100_2 = '01012008';
			    var regI100_3 = results_dept[j].getValue(columns_dept[1]);//DEPARTAMENTO
			    var regI100_4 = regI100_3.substring(0, regI100_3.indexOf(" "));//CODIGO DEPARTAMENTO
			    var regI100_5 = regI100_3.substring(regI100_3.indexOf(" ")+1);//NOMBRE DEPARTAMENTO

			    strBody += '|' + regI100_1 + '|' + regI100_2 + '|' + regI100_4 + '|' + regI100_5 + '|';
				strBody += '\r\n';

				cont_regI100 = cont_regI100 + 1;
			    
			}

			Count_Regi = Count_Regi + cont_regI100;

			//GARGA NCH Cuentas Todas Brasil (script) | TODAS LAS CUENTAS DEL PLAN DE NETSUITE (DISCRIMINACION POR SCRIPT)
			var carga_conta_ana = nlapiLoadSearch(null,'customsearch_nch_cuentas_todas_brasil');
				
			var resultSet_carga = carga_conta_ana.runSearch();
			var objCuenta_carga = resultSet_carga.getResults(0, 1000);
		
			var a = 0;
			var concentra_cuentas = [];		
			
			while ( a < objCuenta_carga.length ) 
			{
				cols = objCuenta_carga[a].getAllColumns();			
				
				concentra_cuentas.push( objCuenta_carga[a].getValue(cols[1]) + '|' + objCuenta_carga[a].getText(cols[3]) + '|' + objCuenta_carga[a].getValue(cols[2]) );
				a++
			}		

			//****** Registro I150: Saldos Periódicos  **********************************************************************
			//****** PERIODO ENERO **********************************************************************

			var name_mon = '_Ene';
		  	var date_ini = '01/01/';
		  	var date_fin = '31/01/';

			strBody += '|' + 'I150' + '|' + date_ini.replace(/\/+/g,'')+anioperiodoend_end + '|' + date_fin.replace(/\/+/g,'')+anioperiodoend_end + '|';
			strBody += '\r\n';

			//****** REGISTRO I155 **********************************************************************

			//GARGA BUSQUEDA GUARDADA NCH Debe/Haber to SPED Brasil
			//CARGA ARRAY PARA IMPORTES DEBITO & CREDITO
			var DebeHaberSearch_ene = nlapiLoadSearch('transaction', 'customsearch_sped_debcred_br');
				DebeHaberSearch_ene.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', date_ini+anioperiodoend_end));
				DebeHaberSearch_ene.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', date_fin+anioperiodoend_end));	

			var DebeHaberResult_ene = DebeHaberSearch_ene.runSearch();
			var ResultDH_ene = DebeHaberResult_ene.getResults(0, 1000);
			var b_ene = 0;
			var ArrDebe_Haber_ene = [];

			while ( b_ene < ResultDH_ene.length ) 
			{
				cols_enero = ResultDH_ene[b_ene].getAllColumns();	

				ArrDebe_Haber_ene.push( ResultDH_ene[b_ene].getValue(cols_enero[0]) + '|' + ResultDH_ene[b_ene].getValue(cols_enero[3]) + '|' + ResultDH_ene[b_ene].getValue(cols_enero[4]) );

				b_ene++
			}

			//nlapiLogExecution('DEBUG', 'ArrDebe_Haber_ene', JSON.stringify(ArrDebe_Haber_ene));			

			//GARGA BUSQUEDA GUARDADA NCH Saldo Inicial to SPED Brasil
			var saldoIncialSearch_ene = nlapiLoadSearch('transaction', 'customsearch_sped_saldoini_br');
				saldoIncialSearch_ene.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'before', date_ini+anioperiodoend_end));
				
			var objResult_ene 	= saldoIncialSearch_ene.runSearch();
			var ResultSI_ene 	= objResult_ene.getResults(0, 1000);
			var c_ene 			= 0;
			var ArrSaldoi_ene 	= [];

			while ( c_ene < ResultSI_ene.length ) 
			{
				cols2_ene = ResultSI_ene[c_ene].getAllColumns();			
				
				ArrSaldoi_ene.push( ResultSI_ene[c_ene].getValue(cols2_ene[0]) + '|' + ResultSI_ene[c_ene].getValue(cols2_ene[4]) );

				c_ene++
			}		
			
			//nlapiLogExecution('DEBUG', 'ArrSaldoi_ene', ArrSaldoi_ene.length);

			//GARGA SALDO FINAL NCH Cuentas Analiticas to SPED Brasil
            //MUDA ID INTERNO DE BUSQUEDDA customsearch_sped_lista_cuentas_br
			var SF_savedSearch_ene = nlapiLoadSearch('transaction', 'customsearch_sped_lista_analitica_br');	
				SF_savedSearch_ene.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', date_fin+anioperiodoend_end));

			var resultSF_ene = SF_savedSearch_ene.runSearch();
			var obj_SF_ene 	 = resultSF_ene.getResults(0, 1000);
		
			var f_ene 	  		= 0;
			var ArrSaldof_ene 	= [];

			while ( f_ene < obj_SF_ene.length ) 
			{
				cols_sf = obj_SF_ene[f_ene].getAllColumns();	

				ArrSaldof_ene.push( obj_SF_ene[f_ene].getValue(cols_sf[0]) + '|' + obj_SF_ene[f_ene].getValue(cols_sf[5]) );		
				
				f_ene++
			}

			//nlapiLogExecution('DEBUG', 'ArrSaldof_ene', ArrSaldof_ene.length);

			var cont_regI150 = 1;
			var cont_regI155 = 0;

			// ++++++++++++++++++++++++++++++ START PROCESS ++++++++++++++++++++++++++++++++++  	

			for (var j = 0; j < concentra_cuentas.length; j++) 
			{
				var Arr_contas  = concentra_cuentas[j].split("|");
				var SaldoFin 	= 0;
				var SaldoIni 	= 0;
				var campoemp 	= '';
				var campo000 	= Arr_contas[1];//TIPO CUENTA
				var campo002 	= Arr_contas[0];//NUMERO CUENTA (nuevo paramtero de comparacion)
				var campo003 	= Arr_contas[2];//NOMBRE CUENTA	
				var campo004	= 0;//IMPORTE DEBE
				var campo005	= 0;//IMPORTE HABER	

				//nlapiLogExecution('DEBUG', 'concentra_cuentas ', JSON.stringify(concentra_cuentas[j]));	

				//BUCLE PARA RECORRER (SALDO INICIAL X CUENTA)
				for (var x = 0; x < ArrSaldoi_ene.length; x++) 
				{
					var idcuenta = ArrSaldoi_ene[x].split("|");

						idcuenta[0] = (idcuenta[0] == '') ? '0000' : idcuenta[0];
						idcuenta[1] = (idcuenta[1] == '') ? '0.00' : idcuenta[1];

						if ( campo002 == idcuenta[0] ) 
						{
							SaldoIni = parseFloat(idcuenta[1]);
							//nlapiLogExecution('DEBUG', 'idcuenta - ArrSaldoi', JSON.stringify(ArrSaldoi_ene[x]));
							//nlapiLogExecution('DEBUG', 'idcuenta - ArrSaldoi', SaldoIni);
							break;
						}
						
				}

				//LOOP PARA RECORRER DEBITO Y CREDITO
				for (var p = 0; p < ArrDebe_Haber_ene.length; p++) 
				{
					var id_debehaber = ArrDebe_Haber_ene[p].split("|");

						id_debehaber[0] = (id_debehaber[0] == '') ? '0000' : id_debehaber[0];
						id_debehaber[1] = (id_debehaber[1] == '') ? '0.00' : id_debehaber[1];
						id_debehaber[2] = (id_debehaber[2] == '') ? '0.00' : id_debehaber[2];

						if ( campo002 == id_debehaber[0] ) 
						{
							campo004 	= parseFloat(id_debehaber[1]);//IMPORTE DEBE
							campo005 	= parseFloat(id_debehaber[2]);//IMPORTE HABER				
							//nlapiLogExecution('DEBUG', 'ArrDebe_Haber_ene', JSON.stringify(ArrDebe_Haber_ene[p]));
							//nlapiLogExecution('DEBUG', 'Debe | Haber', campo004 + ' | ' + campo005);
							break;
						}
						
				}

				//BUCLE PARA RECORRER (SALDO FINAL X CUENTA)
				for (var w = 0; w < ArrSaldof_ene.length; w++) 
				{
					var idcuenta_F = ArrSaldof_ene[w].split("|");

						idcuenta_F[0] = (idcuenta_F[0] == '') ? '0000' : idcuenta_F[0];
						idcuenta_F[1] = (idcuenta_F[1] == '') ? '0.00' : idcuenta_F[1];

						if ( campo002 == idcuenta_F[0] ) 
						{
							SaldoFin = parseFloat(idcuenta_F[1]);
							//nlapiLogExecution('DEBUG', 'idcuenta_F - ArrSaldoF', JSON.stringify(ArrSaldof_ene[w]));
							//nlapiLogExecution('DEBUG', 'idcuenta_F - ArrSaldoF', SaldoFin);
							break;
						}
						
				}

				//EVALUACION SALDO INICIAL Y FINAL DEUDOR | CREDOR
				var flag_fin_DC 	= '';
				var flag_ini_DC 	= '';

				nlapiLogExecution('DEBUG', 'Tipo da Conta: CASE', campo000);

				switch (campo000) 
				{
				  //ACTIVO
				  case 'Banco':
				  case 'Ativo fixo':
				  case 'Custo de mercadorias vendidas':
				  case 'Custo dos bens vendidos':	
				  case 'Contas a receber':
				  case 'Despesa':
				  case 'Despesa diferida':
				  case 'Outro ativo':
				  case 'Outro ativo circulante':
				  case 'Outras despesas':
				  case 'Outra despesa':

				    flag_fin_DC		= (parseFloat(SaldoFin) > 0) ? 'D' : 'C';
				    flag_ini_DC		= (parseFloat(SaldoIni) > 0) ? 'D' : 'C';
				    break;

				  //PASIVO
				  case 'Outro passivo circulante':
				  case 'Contas a pagar':
				  case 'Receita':
				  case 'Outras receitas':
				  case 'Patrimônio líquido':
				  case 'Obrigação de longo prazo':

				    flag_fin_DC		= (parseFloat(SaldoFin) > 0) ? 'C' : 'D';
				    flag_ini_DC		= (parseFloat(SaldoIni) > 0) ? 'C' : 'D';
				    break;
				  
				}

				//nlapiLogExecution('DEBUG', 'Arrcuenta | SaldoFin | flag_fin_DC', ArrCuenta[j] + '|' + SaldoFin + '|' + flag_fin_DC);	

				SaldoIni = Math.abs(SaldoIni).toFixed(2);
				SaldoFin = Math.abs(SaldoFin).toFixed(2);
				campo004 = Math.abs(campo004).toFixed(2);
				campo005 = Math.abs(campo005).toFixed(2);
					

				if( parseFloat(SaldoIni) != 0 || parseFloat(SaldoFin) != 0 || parseFloat(campo004) != 0 || parseFloat(campo005) != 0 )
				{
					strBody += '|' + 'I155' + '|' + campo002 + '|' + campoemp + '|' + SaldoIni.replace('.',',') + '|' + flag_ini_DC + '|' + campo004.replace('.',',') + '|' + campo005.replace('.',',') + '|' + SaldoFin.replace('.',',') + '|' + flag_fin_DC + '|';
					strBody += '\r\n';

					cont_regI155 = cont_regI155 + 1;
				}	

			}
			
			//++++++++++++++++++++++++++++++ END PROCESS ENERO ++++++++++++++++++++++++++++++++++  

			//++++++++++++++++++++++++++++++ MASSIVE PROCESS TESTING BY MONTH++++++++++++++++++++++++++++++++++  
			for (var m = 2; m <= 12; m++) 
			{
				switch (m) 
				{
				  
			 	case 2:
				  	var name_mon = '_Feb';
				  	var date_ini = '01/02/';
				  	//var date_fin = '28/02/';
					var date_fin = '29/02/'; //2024 AÑO BISIESTO
				    break;

		   		case 3:
				  	var name_mon = '_Mar';
				  	var date_ini = '01/03/';
				  	var date_fin = '31/03/';	
				    break;

				case 4:
				  	var name_mon = '_Abr';
				  	var date_ini = '01/04/';
				  	var date_fin = '30/04/';	
				    break;

			    case 5:
				  	var name_mon = '_May';
				  	var date_ini = '01/05/';
				  	var date_fin = '31/05/';	
				    break;

			    case 6:
				  	var name_mon = '_Jun';
				  	var date_ini = '01/06/';
				  	var date_fin = '30/06/';	
				    break;

			    case 7:
				  	var name_mon = '_Jul';
				  	var date_ini = '01/07/';
				  	var date_fin = '31/07/';	
				    break;

			    case 8:
				  	var name_mon = '_Ago';
				  	var date_ini = '01/08/';
				  	var date_fin = '31/08/';	
				    break;

			    case 9:
				  	var name_mon = '_Sep';
				  	var date_ini = '01/09/';
				  	var date_fin = '30/09/';	
				    break;

			    case 10:
				  	var name_mon = '_Oct';
				  	var date_ini = '01/10/';
				  	var date_fin = '31/10/';	
				    break;

			    case 11:
				  	var name_mon = '_Nov';
				  	var date_ini = '01/11/';
				  	var date_fin = '30/11/';	
				    break;

			    case 12:
				  	var name_mon = '_Dic';
				  	var date_ini = '01/12/';
				  	var date_fin = '31/12/';	
				    break;
				  
				}

				//****** REGISTRO I150 **********************************************************************

				strBody += '|' + 'I150' + '|' + date_ini.replace(/\/+/g,'')+anioperiodoend_end + '|' + date_fin.replace(/\/+/g,'')+anioperiodoend_end + '|';
				strBody += '\r\n';

				cont_regI150 = cont_regI150 + 1;

				//****** REGISTRO I155 **********************************************************************

				var DebeHaberSearch = nlapiLoadSearch('transaction', 'customsearch_sped_debcred_br');
					DebeHaberSearch.addFilter(new nlobjSearchFilter('subsidiary', null, 'anyof', Subsid));	
					DebeHaberSearch.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', date_ini+anioperiodoend_end));
					DebeHaberSearch.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', date_fin+anioperiodoend_end));	

				var DebeHaberResult = DebeHaberSearch.runSearch();
				var ResultDH = DebeHaberResult.getResults(0, 1000);
				var b = 0;
				var ArrDebe_Haber = [];

				while ( b < ResultDH.length ) 
				{
					get_cols = ResultDH[b].getAllColumns();			
					
					ArrDebe_Haber.push( ResultDH[b].getValue(get_cols[0]) + '|' + ResultDH[b].getValue(get_cols[3]) + '|' + ResultDH[b].getValue(get_cols[4]) );

					b++
				}

				var saldoIncialSearch = nlapiLoadSearch('transaction', 'customsearch_sped_saldoini_br');
					saldoIncialSearch.addFilter(new nlobjSearchFilter('subsidiary', null, 'anyof', Subsid));	
					saldoIncialSearch.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'before', date_ini+anioperiodoend_end));
					
				var objResult 	= saldoIncialSearch.runSearch();
				var ResultSI 	= objResult.getResults(0, 1000);
				var c 			= 0;
				var ArrSaldoi 	= [];

				while ( c < ResultSI.length ) 
				{
					cols2 = ResultSI[c].getAllColumns();			
					
					ArrSaldoi.push( ResultSI[c].getValue(cols2[0]) + '|' + ResultSI[c].getValue(cols2[4]) );

					c++
				}		

				//nlapiLogExecution('DEBUG', '**Inicio Array**'+name_mon, ArrDebe_Haber.length);

				var SF_savedSearch = nlapiLoadSearch('transaction', 'customsearch_sped_lista_analitica_br');	
					SF_savedSearch.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', date_fin+anioperiodoend_end));

				var resultSF = SF_savedSearch.runSearch();
				var obj_SF 	 = resultSF.getResults(0, 1000);
			
				var f 	  		= 0;
				var ArrSaldof 	= [];

				while ( f < obj_SF.length ) 
				{
					cols_sf = obj_SF[f].getAllColumns();	

					ArrSaldof.push( obj_SF[f].getValue(cols_sf[0]) + '|' + obj_SF[f].getValue(cols_sf[5]) );		
					
					f++
				}

				//nlapiLogExecution('DEBUG', 'ArrSaldof', ArrSaldof.length);

				for (var j = 0; j < concentra_cuentas.length; j++) 
				{
					var Arr_contas  = concentra_cuentas[j].split("|");
					var SaldoFin 	= 0;
					var SaldoIni 	= 0;				
					var campoemp 	= '';
					var campo000 	= Arr_contas[1];//TIPO CUENTA
					var campo002 	= Arr_contas[0];//NUMERO CUENTA
					var campo003 	= Arr_contas[2];//NOMBRE CUENTA
					var campo004 	= 0;//IMPORTE DEBE
					var campo005 	= 0;//IMPORTE HABER	

					//nlapiLogExecution('DEBUG', 'ArrNumCue | ArrTipCue', ArrNumCue[j] + '|' + ArrTipCue[j]);	
					//nlapiLogExecution('DEBUG', 'ArrNumCue | SaldoIni ' ,  ArrNumCue[j] + '|' + SaldoIni );	

					//BUCLE PARA RECORRER (SALDO INICIAL X CUENTA)
					for (var x = 0; x < ArrSaldoi.length; x++) 
					{
						var idcuenta = ArrSaldoi[x].split("|");

							idcuenta[0] = (idcuenta[0] == '') ? '0000' : idcuenta[0];
							idcuenta[1] = (idcuenta[1] == '') ? '0.00' : idcuenta[1];

							if ( campo002 == idcuenta[0] ) 
							{
								SaldoIni = parseFloat(idcuenta[1]);
								//nlapiLogExecution('DEBUG', 'idcuenta - ArrSaldoi', JSON.stringify(ArrSaldoi_ene[x]));
								break;
							}
							
					}

					//LOOP PARA RECORRER DEBITO Y CREDITO
					for (var p = 0; p < ArrDebe_Haber.length; p++) 
					{
						var id_debehaber = ArrDebe_Haber[p].split("|");

							id_debehaber[0] = (id_debehaber[0] == '') ? '0000' : id_debehaber[0];
							id_debehaber[1] = (id_debehaber[1] == '') ? '0.00' : id_debehaber[1];
							id_debehaber[2] = (id_debehaber[2] == '') ? '0.00' : id_debehaber[2];

							if ( campo002 == id_debehaber[0] ) 
							{
								campo004 	= parseFloat(id_debehaber[1]);
								campo005 	= parseFloat(id_debehaber[2]);				
								//nlapiLogExecution('DEBUG', 'id_debehaber'+name_mon, JSON.stringify(ArrDebe_Haber[p]));
								break;
							}

					}

					//BUCLE PARA RECORRER (SALDO FINAL X CUENTA)
					for (var w = 0; w < ArrSaldof.length; w++) 
					{
						var idcuenta_F = ArrSaldof[w].split("|");

							idcuenta_F[0] = (idcuenta_F[0] == '') ? '0000' : idcuenta_F[0];
							idcuenta_F[1] = (idcuenta_F[1] == '') ? '0.00' : idcuenta_F[1];

							if ( campo002 == idcuenta_F[0] ) 
							{
								SaldoFin = parseFloat(idcuenta_F[1]);
								//nlapiLogExecution('DEBUG', 'idcuenta_F - ArrSaldoi', JSON.stringify(ArrSaldof[w]));
								break;
							}
							
					}

					//EVALUACION SALDO INICIAL Y FINAL DEUDOR | CREDOR
					var flag_fin_DC 	= '';
					var flag_ini_DC 	= '';
					switch (campo000) 
					{
					  	//ACTIVO
						case 'Banco':
						case 'Ativo fixo':
						case 'Custo de mercadorias vendidas':
						case 'Custo dos bens vendidos':	
						case 'Contas a receber':
						case 'Despesa':
						case 'Despesa diferida':
						case 'Outro ativo':
						case 'Outro ativo circulante':
						case 'Outras despesas':
						case 'Outra despesa':

					  	//SaldoFin = parseFloat(SaldoIni) + parseFloat(campo004) - parseFloat(campo005);
					    flag_fin_DC		= (parseFloat(SaldoFin) > 0) ? 'D' : 'C';
					    flag_ini_DC		= (parseFloat(SaldoIni) > 0) ? 'D' : 'C';
					    break;

					  	//PASIVO
						case 'Outro passivo circulante':
						case 'Contas a pagar':
						case 'Receita':
						case 'Outras receitas':
						case 'Patrimônio líquido':
						case 'Obrigação de longo prazo':

					  	//SaldoFin = parseFloat(SaldoIni) - parseFloat(campo004) + parseFloat(campo005);
					    flag_fin_DC		= (parseFloat(SaldoFin) > 0) ? 'C' : 'D';
					    flag_ini_DC		= (parseFloat(SaldoIni) > 0) ? 'C' : 'D';
					    break;
					  
					}

					//nlapiLogExecution('DEBUG', 'Arrcuenta | SaldoFin | flag_fin_DC', ArrCuenta[j] + '|' + SaldoFin + '|' + flag_fin_DC);

					SaldoIni = Math.abs(SaldoIni).toFixed(2);
					SaldoFin = Math.abs(SaldoFin).toFixed(2);
					campo004 = Math.abs(campo004).toFixed(2);
					campo005 = Math.abs(campo005).toFixed(2);						
						
					if( parseFloat(SaldoIni) != 0 || parseFloat(SaldoFin) != 0 || parseFloat(campo004) != 0 || parseFloat(campo005) != 0 )
					{
						strBody += '|' + 'I155' + '|' + campo002 + '|' + campoemp + '|' + SaldoIni.replace('.',',') + '|' + flag_ini_DC + '|' + campo004.replace('.',',') + '|' + campo005.replace('.',',') + '|' + SaldoFin.replace('.',',') + '|' + flag_fin_DC + '|';
						strBody += '\r\n';

						cont_regI155 = cont_regI155 + 1;
					}

				}
			}

			// ++++++++++++++++++++++++++++++ END MASSIVE PROCESS ++++++++++++++++++++++++++++++++++  

			Count_Regi = Count_Regi + cont_regI150;
			Count_Regi = Count_Regi + cont_regI155;

			nlapiLogExecution('DEBUG', 'cont_regI150 | cont_regI155 | Count_Regi ', cont_regI150 + ' | ' + cont_regI155 + ' | ' + Count_Regi);			

			// ****** REGISTRO I200 LANZAMENTO CONTABIL **********************************************************************
			// ****** REGISTRO I250 PARTIDAS DO LANZAMENTO **********************************************************************

            //FORZAR FECHAS POR QUE REBASAN LOS 4000 REGISTROS
            var forz_data_ini = '01/01/2024';
            var forz_data_fin = '15/01/2024';

			//GARGA NCH Lanzamentos Contabil (head)
			var search_lanza_H = nlapiLoadSearch('transaction','customsearch_br_lanzamento_head');
				search_lanza_H.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter',  periodstartdate_ini));
				search_lanza_H.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', periodenddate_end));
                //search_lanza_H.addFilter(new nlobjSearchFilter('trandate', null, 'onorafter', forz_data_ini));
			    //search_lanza_H.addFilter(new nlobjSearchFilter('trandate', null, 'onorbefore', forz_data_fin));		
				
			var columns   			= search_lanza_H.getColumns();
			var resultSet_lanzah 	= search_lanza_H.runSearch();
			var results 	= [];
			var slice	 	= [];
			var i 			= 0;
			var id_lanza	= [];
			var num_lanza	= [];
			var data_lanza	= [];
			var impo_lanza	= [];
			var ident_lanza	= [];
			
			do
			{
				slice = resultSet_lanzah.getResults(i, i + 1000);
			    slice.forEach(function(result) 
			    {
			      var resultObj = {};
			      columns.forEach(function(column) 
			      {
			        resultObj[column.getName()] = result.getValue(column);
			      });
			      
			      	results.push(resultObj);

		      		id_lanza.push( result.getValue(columns[0]) );//INTERNAL ID LANZAMENTO CONTABIL
		      		num_lanza.push( result.getValue(columns[2]) );//NUM LANZAMENTO CONTABIL
					data_lanza.push( result.getValue(columns[4]) );//DATA LANZAMENTO
					impo_lanza.push( result.getValue(columns[6]) );//VALOR LANZAMENTO
					ident_lanza.push( result.getValue(columns[10]) );//IDENTIFICADOR LANZAMENTO
				
					i++;
			    });
			} while (slice.length >= 1000);

			//nlapiLogExecution('DEBUG', 'conta_lanza Head', id_lanza.length);

			var cont_regI200 = 0;
			var cont_regI250 = 0;
			
			for (var j = 0; j < id_lanza.length; j++) 
			{
				var campoemp 	= '';
				var regI200_0 	= id_lanza[j];//ID INTERNO LANZAMENTO
				var regI200_1 	= num_lanza[j];//NUMERO LANZAMENTO
				var regI200_2 	= data_lanza[j];//DATA LANZAMENTO
				var regI200_3 	= (impo_lanza[j] == '') ? '0.00' : parseFloat(impo_lanza[j]);//VALOR LANZAMENTO
					regI200_3	= Math.abs(regI200_3).toFixed(2);
				var regI200_4 	= ident_lanza[j];//IDENTIFICADOR DE CIERRE

				//nlapiLogExecution('DEBUG', 'id_lanza | num_lanza | data_lanza | impo_lanza | ident_lanza ', regI200_0 + ' ' + regI200_1 + ' ' + regI200_2 + ' ' + regI200_3 + ' ' + regI200_4 );

				strBody += '|' + 'I200' + '|' + regI200_0 + '|' + regI200_2.replace(/\/+/g,'') + '|' + regI200_3.replace('.',',') + '|' + regI200_4 + '|' + campoemp + '|';
				strBody += '\r\n';

				cont_regI200 = cont_regI200 + 1;

				checkGovernance();

                    //LOOP PARA RECORRER DETALLE DE LANZAMENTOS - NCH Lanzamentos Contabil (detail)
                    var search_lanza_D = nlapiLoadSearch('transaction','customsearch_br_lanzamento_detail');
                        search_lanza_D.addFilter(new nlobjSearchFilter('internalid', null, 'is', regI200_0));

                    var columns_D   		= search_lanza_D.getColumns();
                    var resultSet_lanzad 	= search_lanza_D.runSearch();
                    var results_D 	= [];
                    var slice_D	 	= [];
                    var ii 			= 0;
                    var id_lanza_D	= [];
                    var cont_lanza_D	= [];
                    var Amount_lanza_D	= [];
                    var Adebit_lanza_D	= [];
                    var Acredit_lanza_D	= [];
                    var memo_lanza_D	= [];                
                    
                    do
                    {
                        slice_D = resultSet_lanzad.getResults(ii, ii + 1000);
                        slice_D.forEach(function(result) 
                        {
                            var resultObj_D = {};
                            columns_D.forEach(function(column) 
                            {
                            resultObj_D[column.getName()] = result.getValue(column);
                            });
                            
                                results_D.push(resultObj_D);
        
                                id_lanza_D.push( result.getValue(columns_D[0]) );//INTERNAL ID LANZAMENTO CONTABIL
                                cont_lanza_D.push( result.getValue(columns_D[4]) );//NUM CONTA CONTABIL
                                Amount_lanza_D.push( result.getValue(columns_D[6]) );//AMOUNT BY LINE
                                Adebit_lanza_D.push( result.getValue(columns_D[7]) );//DEBIT AMOUNT
                                Acredit_lanza_D.push( result.getValue(columns_D[8]) );//CREDIT AMOUNT
                                memo_lanza_D.push( result.getValue(columns_D[9]) );//MEMO ON LINE
                            
                                ii++;
                        });
                    } while (slice_D.length >= 1000);

                    for (var jj = 0; jj < id_lanza_D.length; jj++) 
                    {
                        var regI250_0 	= id_lanza_D[jj];//ID TRANSACTION
                        var regI250_1 	= cont_lanza_D[jj];//ACCOUNT NUMBER ON LINE
                        var regI250_2 	= (Amount_lanza_D[jj] == '') ? '0.00' : parseFloat(Amount_lanza_D[jj]);// AMOUNT BY LINE VALOR INVERTIDO
                        var regI250_3 = '';
                            
                        if( memo_lanza_D[jj] != '')
                        {
                            regI250_3 	= memo_lanza_D[jj];//MEMO ON LINE
                        }

                        var regI250_4 	= Adebit_lanza_D[jj];//DEBIT AMOUNT
                        var regI250_5 	= Acredit_lanza_D[jj];//CREDIT AMOUNT
                        var debeorhaber = 'D';

                        //if( regI250_5 != '') { debeorhaber = 'C'; }

                        if( regI250_2 < 0) { debeorhaber = 'C'; }

                            regI250_2	= Math.abs(regI250_2).toFixed(2);

                        //nlapiLogExecution('DEBUG', 'regI250_0 | desg_detail[1] | desg_detail[2] | desg_detail[3] | debeorhaber ', regI250_0 + '|' + regI250_1  + '|' + regI250_2  + '|' + regI250_3 + '|' + debeorhaber );
                        
                        strBody += '|' + 'I250' + '|' + regI250_1 + '|' + campoemp + '|' + regI250_2.replace('.',',') + '|' + debeorhaber + '|' + campoemp + '|' + campoemp + '|' + regI250_3.replace(/(\t|\n)/gm,'') + '|' + campoemp + '|';
                        strBody += '\r\n';

                        cont_regI250 = cont_regI250 + 1;
                    }
                				  
			}

			Count_Regi = Count_Regi + cont_regI200;
			Count_Regi = Count_Regi + cont_regI250;

			nlapiLogExecution('DEBUG', 'cont_regI200 | cont_regI250 | Count_Regi ', cont_regI200 + ' | ' + cont_regI250 + ' | ' + Count_Regi);

			//****** REGISTRO I350 Saldo das Contas de Resultado Antes do Encerramento **********************************************************************

			var cont_regI350 = 1;
			var cont_regI355 = 0;

				strBody += '|' + 'I350' + '|' + '3112'+anioperiodoend_end + '|';
				strBody += '\r\n'; 

			//****** REGISTRO I355 Detalhes dos Saldos das Contas de Resultado Antes do Encerramento  **********************************************************************

			//CARGA ARRAY DE CONTAS DE RESULTADO EN BUSQUEDA NCH BRHub Contas Resultado
			var CResultado_search = nlapiLoadSearch(null, 'customsearch_contas_resultado_br');

				var CResultadoResult = CResultado_search.runSearch();
				var Result_CResultado = CResultadoResult.getResults(0, 1000);
				var r = 0;
				var Arr_CResultado = [];

				while ( r < Result_CResultado.length ) 
				{
					var get_cols_CR = Result_CResultado[r].getAllColumns();			
					
					Arr_CResultado.push( Result_CResultado[r].getValue(get_cols_CR[6]) );

					r++
				}

				//nlapiLogExecution('DEBUG', 'Arr_CResultado', Arr_CResultado.length);

			//CARGA SALDO FINAL DE CONTAS DE RESULTADO EN BUSQUEDA NCH Cuentas Resultado | Saldo Final Brasil (sin lanzamentos de encerramento)
			var TResultado_search = nlapiLoadSearch(null, 'customsearch_cresultado_sfinal_br');
				TResultado_search.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', '01/01/'+anioperiodoend_end));
				TResultado_search.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', '31/12/'+anioperiodoend_end));


				var TResultadoResult = TResultado_search.runSearch();
				var Result_TResultado = TResultadoResult.getResults(0, 1000);
				var t = 0;
				var Arr_TResultado = [];

				while ( t < Result_TResultado.length ) 
				{
					var get_cols_TR = Result_TResultado[t].getAllColumns();			
					
					Arr_TResultado.push( Result_TResultado[t].getValue(get_cols_TR[0]) + '|' + Result_TResultado[t].getValue(get_cols_TR[4]) );

					t++
				}

				//nlapiLogExecution('DEBUG', 'Arr_TResultado', Arr_TResultado.length);

				for (var j = 0; j < Arr_CResultado.length; j++) 
				{
					var campoemp 	= '';
					var regI355_1 	= Arr_CResultado[j];//NUMERO DA CONTA RESULTADO

					//LOOP PARA RECORRER SALDOS FINALES X CUENTA
					for (var p = 0; p < Arr_TResultado.length; p++) 
					{
						var desg_tresul = Arr_TResultado[p].split("|");

							if ( Arr_CResultado[j] == desg_tresul[0] ) 
							{
								var regI355_2 	= (desg_tresul[1] == '') ? '0,00' : desg_tresul[1];//SALDO FINAL DA CONTA RESULTADO
								
								var debeorhaber = 'D';

								if( regI355_2 < 0)
								{
									debeorhaber = 'C';
								}

								regI355_2	= Math.abs(regI355_2).toFixed(2);

								//nlapiLogExecution('DEBUG', 'loop_TC', JSON.stringify(Arr_TResultado[p]));

								if( regI355_2 != 0 )
								{
									strBody += '|' + 'I355' + '|' + regI355_1 + '|' + campoemp + '|' + regI355_2.replace('.',',') + '|' + debeorhaber + '|';
									strBody += '\r\n';

									cont_regI355 = cont_regI355 + 1;
								}
							}

					}
					  
				}

				Count_Regi = Count_Regi + cont_regI350;
				Count_Regi = Count_Regi + cont_regI355;

				nlapiLogExecution('DEBUG', 'cont_regI350 | cont_regI355 | Count_Regi ', cont_regI350 + ' | ' + cont_regI355 + ' | ' + Count_Regi);				

				//****** REGISTRO I990 Encerramento do Bloco I  **********************************************************************
				//CONTADOR DE LINEAS PARA BLOQUE I
				
				var cont_regI990 = 1;

				Count_Regi = Count_Regi + cont_regI990;

				strBody += '|' + 'I990' + '|' + Count_Regi + '|';
				strBody += '\r\n';

			//****** Bloco J: Demonstrações Contábeis ************************************************************************
			//****** Registro J001: Abertura do Bloco J **********************************************************************

				var Count_Regj = 0;

				strBody += '|' + 'J001' + '|' + '0' + '|';
				strBody += '\r\n';

				var regj001 = 1;
				Count_Regj 	= Count_Regj + regj001;


			//****** Registro J005: Demonstrações Contábeis **********************************************************************
			
				strBody += '|' + 'J005' + '|' + '0101'+anioperiodoend_end + '|' + '3112'+anioperiodoend_end + '|' + '1' + '|' + '' + '|';
				strBody += '\r\n';

				var regj005 = 1;
				Count_Regj 	= Count_Regj + regj005;

			//****** Registro J100: Balanço Patrimonial **********************************************************************
			
			//CARGA NCH BRHub Balance Patrimonial PARA ARRAY DE ESTRUCTURA POR NUMERO
		    var buscaAgrupador = nlapiLoadSearch(null, 'customsearch_planocontas_patri_br');
		    var resultadosAgrupador = buscaAgrupador.runSearch();
		    var objAgrupador = resultadosAgrupador.getResults(0, 1000);
		    var a = 0;
		    var colAgrupador = [], nivelesArr = [];

		    while(a < objAgrupador.length)
		    {
		    	colAgrupador = objAgrupador[a].getAllColumns();
		    	nivelesArr.push(objAgrupador[a].getValue(colAgrupador[0]) + '|' + objAgrupador[a].getValue(colAgrupador[2]) + '|' +
		    					objAgrupador[a].getValue(colAgrupador[3]) + '|' + objAgrupador[a].getValue(colAgrupador[4]) + '|' +
		    					objAgrupador[a].getValue(colAgrupador[6]) + '|' + objAgrupador[a].getValue(colAgrupador[7]) + '|' +
		    					objAgrupador[a].getValue(colAgrupador[8]) + '|' + objAgrupador[a].getValue(colAgrupador[9]) + '|' + objAgrupador[a].getText(colAgrupador[13]));//tipo de cuenta

		    	a++;
		    }
		    

		    //GARGA SALDO INICIAL NCH Saldo Inicial to SPED Brasil
			var saldoIncialSearch = nlapiLoadSearch('transaction', 'customsearch_sped_saldoini_br');
				saldoIncialSearch.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'before', '01/01/'+anioperiodoend_end));
				
			var objResult = saldoIncialSearch.runSearch();
			var ResultSI = objResult.getResults(0, 1000);
			var c = 0;
			var ArrSaldoi = [];

			while ( c < ResultSI.length ) 
			{
				cols_si = ResultSI[c].getAllColumns();			
				
				ArrSaldoi.push( ResultSI[c].getValue(cols_si[1]) + '|' + ResultSI[c].getValue(cols_si[0]) + '|' + ResultSI[c].getValue(cols_si[4]));
				//0 = Cuenta completa, 1 =  Numero Cuenta, 2 = Saldo Inicial

				c++
			}

			//GARGA SALDO FINAL NCH Cuentas Analiticas to SPED Brasil
			var SF_savedSearch = nlapiLoadSearch('transaction', 'customsearch_sped_lista_analitica_br');	
				SF_savedSearch.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', '31/12/'+anioperiodoend_end));

			var resultSet_SF = SF_savedSearch.runSearch();
			var obj_SF	 	 = resultSet_SF.getResults(0, 1000);
		
			var b = 0;
			var ArrCuenta = [];
			var ArrNumCue = [];
			var ArrSaldof = [];
			
			while ( b < obj_SF.length ) 
			{
				cols_sf = obj_SF[b].getAllColumns();			
				
				ArrCuenta.push( obj_SF[b].getValue(cols_sf[2]));
				ArrNumCue.push( obj_SF[b].getValue(cols_sf[0]));
				ArrSaldof.push( obj_SF[b].getValue(cols_sf[5]));	

				b++
			}

			//CARGA ARRAY DE NIVEL 4
			var Array_N4	= [];

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var SaldoFin 	= 0;
				var SaldoIni 	= 0;
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL				
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI				

				//nlapiLogExecution('DEBUG', 'nivelesArr', JSON.stringify(nivelesArr[z]));	

				//LOOP (SALDO INICIAL X CUENTA)
				for (var x = 0; x < ArrSaldoi.length; x++) 
				{
					var idcuenta = ArrSaldoi[x].split("|");

						idcuenta[0] = idcuenta[0];//ID CUENTA LEGAL
						idcuenta[1] = idcuenta[1];//NUMERO CUENTA LEGAL
						idcuenta[2] = (idcuenta[2] == '') ? '0.00' : idcuenta[2];//MONTO SALDO INICIAL

						if ( j100_001 == idcuenta[1] ) 
						{
							SaldoIni = parseFloat(idcuenta[2]);
							//nlapiLogExecution('DEBUG', 'ArrSaldoi', JSON.stringify(ArrSaldoi[x]));							
							break;
						}
						
				}

				//LOOP (SALDO FINAL X CUENTA)
				for (var f = 0; f < ArrNumCue.length; f++) 
				{
					var num_cuenta = ArrNumCue[f];					

						if ( j100_001 == num_cuenta ) 
						{
							SaldoFin = (ArrSaldof[f] == '') ? '0.00' : ArrSaldof[f];
							//nlapiLogExecution('DEBUG', 'NIVEL 5', num_cuenta + ' | ' + SaldoIni + ' | ' + SaldoFin);
							Array_N4.push(j100_004 + '|' + j100_005 + '|' + SaldoIni + '|' + SaldoFin);//CARGA ARRAY DE NIVEL 4
							break;
						}
						
				}

			}

			//CARGA ARRAY DE NIVEL 3
			var Array_N3	= [];

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI
				var sum_n4_si 	= 0;
				var sum_n4_sf 	= 0;

				for (var n3 = 0; n3 < Array_N4.length; n3++) 
				{
					var nivel_4 	= Array_N4[n3].split("|");					

					nivel_4[0] = nivel_4[0];//ID CUENTA PAI
					nivel_4[1] = nivel_4[1];//NUMERO CUENTA PAI
					nivel_4[2] = (nivel_4[2] == '') ? '0.00' : nivel_4[2];//MONTO SALDO INICIAL
					nivel_4[3] = (nivel_4[3] == '') ? '0.00' : nivel_4[3];//MONTO SALDO FINAL

					if ( j100_001 == nivel_4[1] ) 
					{
						sum_n4_si = parseFloat(nivel_4[2]);
						sum_n4_sf = parseFloat(nivel_4[3]);

						//nlapiLogExecution('DEBUG', 'NIVEL 4', j100_001 + ' | ' + sum_n4_si + ' | ' + sum_n4_sf);
						Array_N3.push(j100_004 + '|' + j100_005 + '|' + sum_n4_si + '|' + sum_n4_sf);//CARGA ARRAY DE NIVEL 3						
					}
						
				}
			}

			//CARGA ARRAY DE NIVEL 2
			var Array_N2	= [];

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI
				var sum_n3_si 	= 0;
				var sum_n3_sf 	= 0;

				for (var n3 = 0; n3 < Array_N3.length; n3++) 
				{
					var nivel_3 	= Array_N3[n3].split("|");					

					nivel_3[0] = nivel_3[0];//ID CUENTA PAI
					nivel_3[1] = nivel_3[1];//NUMERO CUENTA PAI
					nivel_3[2] = (nivel_3[2] == '') ? '0.00' : nivel_3[2];//MONTO SALDO INICIAL
					nivel_3[3] = (nivel_3[3] == '') ? '0.00' : nivel_3[3];//MONTO SALDO FINAL

					if ( j100_001 == nivel_3[1] ) 
					{
						sum_n3_si = parseFloat(nivel_3[2]);
						sum_n3_sf = parseFloat(nivel_3[3]);

						//nlapiLogExecution('DEBUG', 'NIVEL 3', j100_001 + ' | ' + sum_n3_si + ' | ' + sum_n3_sf);
						Array_N2.push(j100_004 + '|' + j100_005 + '|' + sum_n3_si + '|' + sum_n3_sf);//CARGA ARRAY DE NIVEL 2						
					}
						
				}
			}

			//CARGA ARRAY DE NIVEL 1
			var Array_N1	= [];

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI
				var sum_n2_si 	= 0;
				var sum_n2_sf 	= 0;

				for (var n2 = 0; n2 < Array_N2.length; n2++) 
				{
					var nivel_2 	= Array_N2[n2].split("|");					

					nivel_2[0] = nivel_2[0];//ID CUENTA PAI
					nivel_2[1] = nivel_2[1];//NUMERO CUENTA PAI
					nivel_2[2] = (nivel_2[2] == '') ? '0.00' : nivel_2[2];//MONTO SALDO INICIAL
					nivel_2[3] = (nivel_2[3] == '') ? '0.00' : nivel_2[3];//MONTO SALDO FINAL

					if ( j100_001 == nivel_2[1] ) 
					{
						sum_n2_si = parseFloat(nivel_2[2]);
						sum_n2_sf = parseFloat(nivel_2[3]);

						//nlapiLogExecution('DEBUG', 'NIVEL 2', j100_001 + ' | ' + sum_n2_si + ' | ' + sum_n2_sf);
						Array_N1.push(j100_004 + '|' + j100_005 + '|' + sum_n2_si + '|' + sum_n2_sf);//CARGA ARRAY DE NIVEL 1						
					}
						
				}
			}

			//IMPRESION DE NIVELES
			var regj100 = 0;

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var SaldoFin 	= 0;
				var SaldoIni 	= 0;
				var campoemp 	= '';
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j100_002 	= niveles[2];//FLAG AGRUPACION O TRANSACCION (T | D)
				var j100_003 	= niveles[3];//NIVEL DA CONTA (COUNT LARGE)	
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI
				var j100_006 	= niveles[6];//INDICADOR DE GRUPO (A | P)
				var j100_007 	= niveles[7];//NOMBRE CUENTA PRINCIPAL
				var j100_013 	= niveles[8];//TIPO DE CUENTA PARA ANALISIS
				var flag_SI		= 'D';
				var flag_SF		= 'D';

				if( j100_003 == 1)
				{
					for (var r1 = 0; r1 < Array_N1.length; r1++) 
					{
						var a_niv1 	= Array_N1[r1].split("|");					

							a_niv1[0] = a_niv1[0];//ID CUENTA
							a_niv1[1] = a_niv1[1];//NUMERO CUENTA
							a_niv1[2] = (a_niv1[2] == '') ? '0.00' : a_niv1[2];//MONTO SALDO INICIAL
							a_niv1[3] = (a_niv1[3] == '') ? '0.00' : a_niv1[3];//MONTO SALDO FINAL

							if( j100_001 == a_niv1[1] )
							{
								SaldoIni += parseFloat(a_niv1[2]);
								SaldoFin += parseFloat(a_niv1[3]);
							}
							//nlapiLogExecution('DEBUG', 'to_print NIVEL 1', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin);
					}
				}

				if( j100_003 == 2)
				{
					for (var r2 = 0; r2 < Array_N2.length; r2++) 
					{
						var a_niv2 	= Array_N2[r2].split("|");					

							a_niv2[0] = a_niv2[0];//ID CUENTA
							a_niv2[1] = a_niv2[1];//NUMERO CUENTA
							a_niv2[2] = (a_niv2[2] == '') ? '0.00' : a_niv2[2];//MONTO SALDO INICIAL
							a_niv2[3] = (a_niv2[3] == '') ? '0.00' : a_niv2[3];//MONTO SALDO FINAL

							if( j100_001 == a_niv2[1] )
							{
								SaldoIni += parseFloat(a_niv2[2]);
								SaldoFin += parseFloat(a_niv2[3]);
							}
							//nlapiLogExecution('DEBUG', 'to_print NIVEL 1', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin);
					}
				}

				if( j100_003 == 3)
				{
					for (var r3 = 0; r3 < Array_N3.length; r3++) 
					{
						var a_niv3 	= Array_N3[r3].split("|");					

							a_niv3[0] = a_niv3[0];//ID CUENTA
							a_niv3[1] = a_niv3[1];//NUMERO CUENTA
							a_niv3[2] = (a_niv3[2] == '') ? '0.00' : a_niv3[2];//MONTO SALDO INICIAL
							a_niv3[3] = (a_niv3[3] == '') ? '0.00' : a_niv3[3];//MONTO SALDO FINAL

							if( j100_001 == a_niv3[1] )
							{
								SaldoIni += parseFloat(a_niv3[2]);
								SaldoFin += parseFloat(a_niv3[3]);
							}
							//nlapiLogExecution('DEBUG', 'to_print NIVEL 1', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin);
					}
				}

				if( j100_003 == 4)
				{

					for (var r4 = 0; r4 < Array_N4.length; r4++) 
					{
						var a_niv4 	= Array_N4[r4].split("|");					

							a_niv4[0] = a_niv4[0];//ID CUENTA
							a_niv4[1] = a_niv4[1];//NUMERO CUENTA
							a_niv4[2] = (a_niv4[2] == '') ? '0.00' : a_niv4[2];//MONTO SALDO INICIAL
							a_niv4[3] = (a_niv4[3] == '') ? '0.00' : a_niv4[3];//MONTO SALDO FINAL

							if( j100_001 == a_niv4[1] )
							{
								SaldoIni += parseFloat(a_niv4[2]);
								SaldoFin += parseFloat(a_niv4[3]);
							}							
					}

					//nlapiLogExecution('DEBUG', 'to_print NIVEL 4', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin);
				}

				if( j100_003 == 5)
				{

					//LOOP (SALDO INICIAL X CUENTA)
					for (var x = 0; x < ArrSaldoi.length; x++) 
					{
						var idcuenta = ArrSaldoi[x].split("|");

							idcuenta[0] = idcuenta[0];//ID CUENTA LEGAL
							idcuenta[1] = idcuenta[1];//NUMERO CUENTA LEGAL
							idcuenta[2] = (idcuenta[2] == '') ? '0.00' : idcuenta[2];//MONTO SALDO INICIAL

							if ( j100_001 == idcuenta[1] ) 
							{
								SaldoIni = parseFloat(idcuenta[2]);
								break;
							}
							
					}

					//LOOP (SALDO FINAL X CUENTA)
					for (var f = 0; f < ArrNumCue.length; f++) 
					{
						var num_cuenta = ArrNumCue[f];					

							if ( j100_001 == num_cuenta ) 
							{
								SaldoFin = (ArrSaldof[f] == '') ? '0.00' : ArrSaldof[f];
								//nlapiLogExecution('DEBUG', 'to_print NIVEL 5', num_cuenta + ' | ' + SaldoIni + ' | ' + SaldoFin);
								break;
							}
							
					}

				}

				//nlapiLogExecution('DEBUG', 'to_print Niveles', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin );Math.abs(SaldoFin).toFixed(2)

					//EVALUACION SALDO INICIAL Y FINAL POR NUMERO INICIAL
					var flag_SI		= '';
					var flag_SF		= '';
					var num_digI	= j100_001.substring(0,1);//DIGITO INICIAL
					var num_dig3	= j100_001.substring(0,3);//3 PRIMERO DIGITOS
					
					if( num_digI == '2' || num_dig3 == '411' || num_dig3 == '412' || num_dig3 == '421' )
					{
						flag_SF		= (parseFloat(SaldoFin) <= 0) ? 'D' : 'C';
					    flag_SI		= (parseFloat(SaldoIni) <= 0) ? 'D' : 'C';
					}
					else
					{
						flag_SF		= (parseFloat(SaldoFin) >= 0) ? 'D' : 'C';
					    flag_SI		= (parseFloat(SaldoIni) >= 0) ? 'D' : 'C';
					}	

					//nlapiLogExecution('DEBUG', 'Patrimonio', j100_001 + ' | ' + j100_002 + ' | ' + SaldoIni + '|' + flag_SI + '|' + SaldoFin + '|' + flag_SF);	
		   			

				SaldoIni 	= Math.abs(SaldoIni).toFixed(2);
				SaldoFin 	= Math.abs(SaldoFin).toFixed(2);

				strBody += '|' + 'J100' + '|' + j100_001 + '|' + j100_002 + '|' + j100_003 + '|' + j100_005 + '|' + j100_006 + '|' + j100_007 + '|';
				strBody += SaldoIni.replace('.',',') + '|' + flag_SI + '|' + SaldoFin.replace('.',',') + '|' + flag_SF + '|' + campoemp + '|';
				strBody += '\r\n';

				regj100 = regj100 + 1;
				

			}

			Count_Regj = Count_Regj + regj100;

			//****** Registro J150: CUENTAS DE RESULTADO **********************************************************************			
			//CARGA NCH Cuentas de Resultado Jeraquia J150
		    var buscaAgrupador = nlapiLoadSearch(null, 'customsearch_planocontas_result_br');
		    var resultadosAgrupador = buscaAgrupador.runSearch();
		    var objAgrupador = resultadosAgrupador.getResults(0, 1000);
		    var a = 0;
		    var colAgrupador = [], nivelesArr = [];

		    while(a < objAgrupador.length)
		    {
		    	colAgrupador = objAgrupador[a].getAllColumns();
		    	nivelesArr.push(objAgrupador[a].getValue(colAgrupador[0]) + '|' + objAgrupador[a].getValue(colAgrupador[2]) + '|' +
		    					objAgrupador[a].getValue(colAgrupador[3]) + '|' + objAgrupador[a].getValue(colAgrupador[4]) + '|' +
		    					objAgrupador[a].getValue(colAgrupador[6]) + '|' + objAgrupador[a].getValue(colAgrupador[7]) + '|' +
		    					objAgrupador[a].getValue(colAgrupador[8]) + '|' + objAgrupador[a].getValue(colAgrupador[9]));

		    	a++;
		    }

		    //GARGA SALDO INICIAL NCH Cuentas Resultado | Saldo Inicial Brasil (SIN ASIENTOS DE ENCERRAMENTO)
			var SI_Res_savedSearch = nlapiLoadSearch('transaction', 'customsearch_cresultado_sinicial_br');
				//SI_Res_savedSearch.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'before', '01/01/'+anioperiodoend_end));
				SI_Res_savedSearch.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', '01/01/2023'));
				SI_Res_savedSearch.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', '31/12/2023'));
				
			var resultSet_SI_Res = SI_Res_savedSearch.runSearch();
			var obj_SI_Res = resultSet_SI_Res.getResults(0, 1000);
			var c = 0;
			var ArrRes_Saldoi = [];

			while ( c < obj_SI_Res.length ) 
			{
				cols_si_res = obj_SI_Res[c].getAllColumns();			
				
				ArrRes_Saldoi.push( obj_SI_Res[c].getValue(cols_si_res[1]) + '|' + obj_SI_Res[c].getValue(cols_si_res[0]) + '|' + obj_SI_Res[c].getValue(cols_si_res[3]));
				//0 = Cuenta completa, 1 =  Numero Cuenta, 2 = Saldo Inicial

				c++
			}

			//GARGA SALDO FINAL NCH Cuentas Resultado | Saldo Final Brasil (SIN ASIENTOS DE ENCERRAMENTO)
			var SF_Res_savedSearch = nlapiLoadSearch('transaction', 'customsearch_cresultado_sfinal_br');	
				SF_Res_savedSearch.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', '01/01/'+anioperiodoend_end));
				SF_Res_savedSearch.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', '31/12/'+anioperiodoend_end));

			var resultSet_SF_Res = SF_Res_savedSearch.runSearch();
			var obj_SF_Res	 	 = resultSet_SF_Res.getResults(0, 1000);
		
			var b = 0;
			var ArrRes_NumCue = [];
			var ArrRes_Saldof = [];
			
			while ( b < obj_SF_Res.length ) 
			{
				cols_sf_res = obj_SF_Res[b].getAllColumns();			
				
				ArrRes_NumCue.push( obj_SF_Res[b].getValue(cols_sf_res[0]));
				ArrRes_Saldof.push( obj_SF_Res[b].getValue(cols_sf_res[4]));	

				b++
			}

		    //nlapiLogExecution('DEBUG', 'nivelesArr_J150', nivelesArr.length + ' | ' + JSON.stringify(nivelesArr));	
            //nlapiLogExecution('DEBUG', 'ArrRes_Saldoi', ArrRes_Saldoi.length + ' | ' + JSON.stringify(ArrRes_Saldoi));	
            //nlapiLogExecution('DEBUG', 'ArrRes_Saldof', ArrRes_Saldof.length + ' | ' + JSON.stringify(ArrRes_Saldof));	

			//CARGA ARRAY DE NIVEL 4
			var Array_N4	= [];

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var SaldoFin 	= 0;
				var SaldoIni 	= 0;
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL				
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI				

				//nlapiLogExecution('DEBUG', 'nivelesArr', JSON.stringify(nivelesArr[z]));	

				//LOOP (SALDO INICIAL X CUENTA)
				for (var x = 0; x < ArrRes_Saldoi.length; x++) 
				{
					var idcuenta = ArrRes_Saldoi[x].split("|");

						idcuenta[0] = idcuenta[0];//ID CUENTA LEGAL
						idcuenta[1] = idcuenta[1];//NUMERO CUENTA LEGAL
						idcuenta[2] = (idcuenta[2] == '') ? '0.00' : idcuenta[2];//MONTO SALDO INICIAL

						if ( j100_001 == idcuenta[1] ) 
						{
							SaldoIni = parseFloat(idcuenta[2]);
							//nlapiLogExecution('DEBUG', 'ArrRes_Saldoi', JSON.stringify(ArrRes_Saldoi[x]));							
							break;
						}
						
				}

				//LOOP (SALDO FINAL X CUENTA)
				for (var f = 0; f < ArrRes_NumCue.length; f++) 
				{
					var num_cuenta = ArrRes_NumCue[f];					

						if ( j100_001 == num_cuenta ) 
						{
							SaldoFin = (ArrRes_Saldof[f] == '') ? '0.00' : ArrRes_Saldof[f];
							//nlapiLogExecution('DEBUG', 'NIVEL 5', num_cuenta + ' | ' + SaldoIni + ' | ' + SaldoFin);
										
							break;
						}						
						
				}

				if( SaldoIni != 0 || SaldoFin != 0 )
				{
					Array_N4.push(j100_004 + '|' + j100_005 + '|' + SaldoIni + '|' + SaldoFin );//CARGA ARRAY DE NIVEL 4
				}

			}

			//CARGA ARRAY DE NIVEL 3
			var Array_N3	= [];

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI
				var sum_n4_si 	= 0;
				var sum_n4_sf 	= 0;

				for (var n3 = 0; n3 < Array_N4.length; n3++) 
				{
					var nivel_4 	= Array_N4[n3].split("|");					

					nivel_4[0] = nivel_4[0];//ID CUENTA PAI
					nivel_4[1] = nivel_4[1];//NUMERO CUENTA PAI
					nivel_4[2] = (nivel_4[2] == '') ? '0.00' : nivel_4[2];//MONTO SALDO INICIAL
					nivel_4[3] = (nivel_4[3] == '') ? '0.00' : nivel_4[3];//MONTO SALDO FINAL

					if ( j100_001 == nivel_4[1] ) 
					{
						sum_n4_si = parseFloat(nivel_4[2]);
						sum_n4_sf = parseFloat(nivel_4[3]);

						//nlapiLogExecution('DEBUG', 'NIVEL 4', j100_001 + ' | ' + sum_n4_si + ' | ' + sum_n4_sf);
						Array_N3.push(j100_004 + '|' + j100_005 + '|' + sum_n4_si + '|' + sum_n4_sf);//CARGA ARRAY DE NIVEL 3						
					}
						
				}
			}

			//CARGA ARRAY DE NIVEL 2
			var Array_N2	= [];

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI
				var sum_n3_si 	= 0;
				var sum_n3_sf 	= 0;

				for (var n3 = 0; n3 < Array_N3.length; n3++) 
				{
					var nivel_3 	= Array_N3[n3].split("|");					

					nivel_3[0] = nivel_3[0];//ID CUENTA PAI
					nivel_3[1] = nivel_3[1];//NUMERO CUENTA PAI
					nivel_3[2] = (nivel_3[2] == '') ? '0.00' : nivel_3[2];//MONTO SALDO INICIAL
					nivel_3[3] = (nivel_3[3] == '') ? '0.00' : nivel_3[3];//MONTO SALDO FINAL

					if ( j100_001 == nivel_3[1] ) 
					{
						sum_n3_si = parseFloat(nivel_3[2]);
						sum_n3_sf = parseFloat(nivel_3[3]);

						//nlapiLogExecution('DEBUG', 'NIVEL 3', j100_001 + ' | ' + sum_n3_si + ' | ' + sum_n3_sf);
						Array_N2.push(j100_004 + '|' + j100_005 + '|' + sum_n3_si + '|' + sum_n3_sf);//CARGA ARRAY DE NIVEL 2						
					}
						
				}
			}

			//CARGA ARRAY DE NIVEL 1
			var Array_N1	= [];

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI
				var sum_n2_si 	= 0;
				var sum_n2_sf 	= 0;

				for (var n2 = 0; n2 < Array_N2.length; n2++) 
				{
					var nivel_2 	= Array_N2[n2].split("|");					

					nivel_2[0] = nivel_2[0];//ID CUENTA PAI
					nivel_2[1] = nivel_2[1];//NUMERO CUENTA PAI
					nivel_2[2] = (nivel_2[2] == '') ? '0.00' : nivel_2[2];//MONTO SALDO INICIAL
					nivel_2[3] = (nivel_2[3] == '') ? '0.00' : nivel_2[3];//MONTO SALDO FINAL

					if ( j100_001 == nivel_2[1] ) 
					{
						sum_n2_si = parseFloat(nivel_2[2]);
						sum_n2_sf = parseFloat(nivel_2[3]);

						//nlapiLogExecution('DEBUG', 'NIVEL 2', j100_001 + ' | ' + sum_n2_si + ' | ' + sum_n2_sf);
						Array_N1.push(j100_004 + '|' + j100_005 + '|' + sum_n2_si + '|' + sum_n2_sf);//CARGA ARRAY DE NIVEL 1						
					}
						
				}
			}

			//IMPRESION DE NIVELES
			var cont_j150 = 0;
			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var SaldoFin 	= 0;
				var SaldoIni 	= 0;
				var campoemp 	= '';
				var j100_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j100_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j100_002 	= niveles[2];//FLAG AGRUPACION O TRANSACCION (T | D)
				var j100_003 	= niveles[3];//NIVEL DA CONTA (COUNT LARGE)	
				var j100_004 	= niveles[4];//ID INTERNO CONTA PAI
				var j100_005 	= niveles[5];//NUMERO CONTA PAI
				var j100_006 	= niveles[6];//NOMBRE CUENTA PRINCIPAL 
				var j100_007 	= niveles[7];//INDICADOR DRE (D | R)

				if( j100_003 == 1)
				{
					for (var r1 = 0; r1 < Array_N1.length; r1++) 
					{
						var a_niv1 	= Array_N1[r1].split("|");					

							a_niv1[0] = a_niv1[0];//ID CUENTA
							a_niv1[1] = a_niv1[1];//NUMERO CUENTA
							a_niv1[2] = (a_niv1[2] == '') ? '0.00' : a_niv1[2];//MONTO SALDO INICIAL
							a_niv1[3] = (a_niv1[3] == '') ? '0.00' : a_niv1[3];//MONTO SALDO FINAL

							if( j100_001 == a_niv1[1] )
							{
								SaldoIni += parseFloat(a_niv1[2]);
								SaldoFin += parseFloat(a_niv1[3]);
							}
							//nlapiLogExecution('DEBUG', 'to_print NIVEL 1', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin);
					}
				}

				if( j100_003 == 2)
				{
					for (var r2 = 0; r2 < Array_N2.length; r2++) 
					{
						var a_niv2 	= Array_N2[r2].split("|");					

							a_niv2[0] = a_niv2[0];//ID CUENTA
							a_niv2[1] = a_niv2[1];//NUMERO CUENTA
							a_niv2[2] = (a_niv2[2] == '') ? '0.00' : a_niv2[2];//MONTO SALDO INICIAL
							a_niv2[3] = (a_niv2[3] == '') ? '0.00' : a_niv2[3];//MONTO SALDO FINAL

							if( j100_001 == a_niv2[1] )
							{
								SaldoIni += parseFloat(a_niv2[2]);
								SaldoFin += parseFloat(a_niv2[3]);
							}
							//nlapiLogExecution('DEBUG', 'to_print NIVEL 1', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin);
					}
				}

				if( j100_003 == 3)
				{
					for (var r3 = 0; r3 < Array_N3.length; r3++) 
					{
						var a_niv3 	= Array_N3[r3].split("|");					

							a_niv3[0] = a_niv3[0];//ID CUENTA
							a_niv3[1] = a_niv3[1];//NUMERO CUENTA
							a_niv3[2] = (a_niv3[2] == '') ? '0.00' : a_niv3[2];//MONTO SALDO INICIAL
							a_niv3[3] = (a_niv3[3] == '') ? '0.00' : a_niv3[3];//MONTO SALDO FINAL

							if( j100_001 == a_niv3[1] )
							{
								SaldoIni += parseFloat(a_niv3[2]);
								SaldoFin += parseFloat(a_niv3[3]);
							}
							//nlapiLogExecution('DEBUG', 'to_print NIVEL 1', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin);
					}
				}

				if( j100_003 == 4)
				{

					for (var r4 = 0; r4 < Array_N4.length; r4++) 
					{
						var a_niv4 	= Array_N4[r4].split("|");					

							a_niv4[0] = a_niv4[0];//ID CUENTA
							a_niv4[1] = a_niv4[1];//NUMERO CUENTA
							a_niv4[2] = (a_niv4[2] == '') ? '0.00' : a_niv4[2];//MONTO SALDO INICIAL
							a_niv4[3] = (a_niv4[3] == '') ? '0.00' : a_niv4[3];//MONTO SALDO FINAL

							if( j100_001 == a_niv4[1] )
							{
								SaldoIni += parseFloat(a_niv4[2]);
								SaldoFin += parseFloat(a_niv4[3]);
							}							
					}

					//nlapiLogExecution('DEBUG', 'to_print NIVEL 4', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin);
				}

				if( j100_003 == 5)
				{

					//LOOP (SALDO INICIAL X CUENTA)
					for (var x = 0; x < ArrRes_Saldoi.length; x++) 
					{
						var idcuenta = ArrRes_Saldoi[x].split("|");

							idcuenta[0] = idcuenta[0];//ID CUENTA LEGAL
							idcuenta[1] = idcuenta[1];//NUMERO CUENTA LEGAL
							idcuenta[2] = (idcuenta[2] == '') ? '0.00' : idcuenta[2];//MONTO SALDO INICIAL

							if ( j100_001 == idcuenta[1] ) 
							{
								SaldoIni = parseFloat(idcuenta[2]);
								break;
							}
							
					}

					//LOOP (SALDO FINAL X CUENTA)
					for (var f = 0; f < ArrRes_NumCue.length; f++) 
					{
						var num_cuenta = ArrRes_NumCue[f];					

							if ( j100_001 == num_cuenta ) 
							{
								SaldoFin = (ArrRes_Saldof[f] == '') ? '0.00' : ArrRes_Saldof[f];
								//nlapiLogExecution('DEBUG', 'to_print NIVEL 5', num_cuenta + ' | ' + SaldoIni + ' | ' + SaldoFin);
								break;
							}
							
					}

				}

				//nlapiLogExecution('DEBUG', 'to_print Niveles', j100_001 + ' | ' + SaldoIni + ' | ' + SaldoFin );Math.abs(SaldoFin).toFixed(2)

				//EVALUACION SALDO INICIAL Y FINAL POR NUMERO INICIAL
					var flag_SI		= 'D';
					var flag_SF		= 'D';

				if( SaldoIni < 0 )
				{
					flag_SI = 'C';
				}

				if( SaldoFin < 0 )
				{
					flag_SF = 'C';
				}

				SaldoIni 	= Math.abs(SaldoIni).toFixed(2);
				SaldoFin 	= Math.abs(SaldoFin).toFixed(2);

				var niv_j150 = parseInt(j100_003) + 1;

				cont_j150 = cont_j150 + 1;

				strBody += '|' + 'J150' + '|' + ('00000' + cont_j150).slice(-5) + '|' + j100_001 + '|' + j100_002 + '|' + niv_j150 + '|' + j100_005 + '|' + j100_006 + '|';
				strBody += SaldoIni.replace('.',',') + '|' + flag_SI + '|' + SaldoFin.replace('.',',') + '|' + flag_SF + '|' + j100_007 + '|' + campoemp + '|';
				strBody += '\r\n';
				

			}

			//LINEA HARDCODED PARA CUENTA 99 EN SEGMENTO J150
			//CUENTA 243003000 CONTENEDORA DEL CIERRE DEL EJERCICIO
			var SF_Resultado = nlapiLoadSearch('transaction', 'customsearch_sped_lista_analitica_br');	
				SF_Resultado.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', '31/12/'+anioperiodoend_end));
				//SF_Resultado.addFilter(new nlobjSearchFilter('account', null, 'is', '12190'));// ID INTERNO DE CUENTA EN BRHUB
                SF_Resultado.addFilter(new nlobjSearchFilter('account', null, 'is', '1363'));
				
			var obj_Result = SF_Resultado.runSearch();
			var obt_sfr = obj_Result.getResults(0, 1);
			var r = 0;
			var data_final = [];

			while ( r < obt_sfr.length ) 
			{
				cols_re = obt_sfr[r].getAllColumns();			
				
				data_final.push( obt_sfr[r].getValue(cols_re[0]) + '|' + obt_sfr[r].getValue(cols_re[4]) );
				r++
			}

			//NO OLVIDAR COLOCAR SALDO INICIAL DE CUENTA - SALDO DE CIERRE EN ULTIMO SPEED ECD
			var SI_99_AA 	= 8956204.64; //SALDO ACUMULADO DE CUENTA 243003000 AÑO ANTERIOR
			var SI_99_Now	= parseFloat(16283156.97) * -1;//SALDO INICIAL DE CUENTA 243003000 (CONSIDERAR CALCULO DE SALDO INICIAL PARA PROXIMO SPEED)
			var Arr_final 	= data_final[0].split('|');
			var SF_final	= Arr_final[1];
			var Dif_99		= parseFloat(SF_final) - parseFloat(SI_99_Now);
				
			
			
				SI_99_AA 	= Math.abs(SI_99_AA).toFixed(2);
				Dif_99 		= Math.abs(Dif_99).toFixed(2);

			//nlapiLogExecution('DEBUG', 'data_final', JSON.stringify(data_final) + ' | ' + SF_final );	
			//nlapiLogExecution('DEBUG', 'SI_99_Now | SF_final ', SI_99_Now + ' | ' + SF_final );	
			//nlapiLogExecution('DEBUG', 'Dif_99', Dif_99 );	

			var linadi_j150 = cont_j150 + 1;
				strBody += '|J150|00' + linadi_j150 + '|99|T|1||Lucros/Prejuizos Acumulados|' + SI_99_AA.replace('.',',') + '|C|' + Dif_99.replace('.',',') + '|C|R||';
				strBody += '\r\n';

			cont_j150 	= cont_j150 + 1;
			Count_Regj 	= Count_Regj + cont_j150;

			//****** Registro J210: CUENTAS DE PATRIMONIO LIQUIDO **********************************************************************
			
			//CARGA NCH BRHub Cuentas Patrimonio Liquido
		    var buscaAgrupador = nlapiLoadSearch(null, 'customsearch_planocontas_patriliq_br');
		    var resultadosAgrupador = buscaAgrupador.runSearch();
		    var objAgrupador = resultadosAgrupador.getResults(0, 1000);
		    var a = 0;
		    var colAgrupador = [], nivelesArr = [];

		    while(a < objAgrupador.length)
		    {
		    	colAgrupador = objAgrupador[a].getAllColumns();
		    	nivelesArr.push(objAgrupador[a].getValue(colAgrupador[0]) + '|' + objAgrupador[a].getValue(colAgrupador[2]) + '|' +
		    					objAgrupador[a].getValue(colAgrupador[3]) );

		    	a++;
		    }

			var regj210 = 0;
			var regj215 = 0;

			for (var z = 0; z < nivelesArr.length; z++) 
			{
				var niveles 	= nivelesArr[z].split('|');
				var SaldoFin 	= 0;
				var SaldoIni 	= 0;
				var campoemp 	= '';
				var j210_000 	= niveles[0];//ID IINTERNO CUENTA PRINCIPAL
				var j210_001 	= niveles[1];//NUMERO CUENTA PRINCIPAL
				var j210_002 	= niveles[2];//NOMBRE CUENTA PRINCIPAL 
				var flag_SI		= 'C';
				var flag_SF		= 'C';
				var dif_acum	= 0;
				var flag_acu	= 'D';

				//LOOP (SALDO INICIAL X CUENTA)
				for (var x = 0; x < ArrSaldoi.length; x++) 
				{
					var idcuenta = ArrSaldoi[x].split("|");

						idcuenta[0] = idcuenta[0];//ID CUENTA LEGAL
						idcuenta[1] = idcuenta[1];//NUMERO CUENTA LEGAL
						idcuenta[2] = (idcuenta[2] == '') ? '0.00' : idcuenta[2];//MONTO SALDO INICIAL

						if ( j210_001 == idcuenta[1] ) 
						{
							SaldoIni = parseFloat(idcuenta[2]);
							break;
						}
						
				}

				//LOOP (SALDO FINAL X CUENTA)
				for (var f = 0; f < ArrNumCue.length; f++) 
				{
					var num_cuenta = ArrNumCue[f];					

						if ( j210_001 == num_cuenta ) 
						{
							SaldoFin = (ArrSaldof[f] == '') ? '0.00' : ArrSaldof[f];
							//nlapiLogExecution('DEBUG', 'to_print NIVEL 5', num_cuenta + ' | ' + SaldoIni + ' | ' + SaldoFin);
							break;
						}
						
				}

				//nlapiLogExecution('DEBUG', 'to_print Niveles', j210_001 + ' | ' + SaldoIni + ' | ' + SaldoFin );Math.abs(SaldoFin).toFixed(2)

				if( SaldoIni < 0 ) { flag_SI = 'D';	}

				if( SaldoFin < 0 ) { flag_SF = 'D'; }

				SaldoIni_J210 	= Math.abs(SaldoIni).toFixed(2);
				SaldoFin_J210 	= Math.abs(SaldoFin).toFixed(2);

				strBody += '|' + 'J210' + '|' + '1' + '|' + j210_001 + '|' + j210_002 + '|' + SaldoIni_J210.replace('.',',') + '|' + flag_SI + '|' + SaldoFin_J210.replace('.',',') + '|';
				strBody += flag_SF + '|' + campoemp + '|';
				strBody += '\r\n';

				regj210 = regj210 + 1;

				//****** Registro J215: DIFERENCIA DE ACUMULADOS SI & SF **********************************************************************
				//LA OPERACION DE SALDO FINAL MENOS SALDO INICIAL Y RESPETAR EL DEBIT O CREDIT POR SIGNO

				dif_acum = parseFloat(SaldoIni) - parseFloat(SaldoFin);

				if( dif_acum != 0)
				{
					//nlapiLogExecution('DEBUG', 'SaldoIni |  SaldoFin', SaldoIni + ' | ' + SaldoFin );
					//nlapiLogExecution('DEBUG', 'dif_acum ', dif_acum);				
					
					if( dif_acum < 0 ) { flag_acu = 'C'; }

					dif_acum 	= Math.abs(dif_acum).toFixed(2);

					strBody += '|' + 'J215' + '|' + '33' + '|' + 'Lucros/Prejuizos Acumulados - Dividendos' + '|' +  dif_acum.replace('.',',') + '|' + flag_acu + '|';
					strBody += '\r\n';

					regj215 = regj215 + 1;
				}
				

			}

				Count_Regj = Count_Regj + regj210;
				Count_Regj = Count_Regj + regj215;

				//****** Registro J900: Termo de Encerramento **********************************************************************

				
				strBody += '|' + 'J900' + '|' + 'TERMO DE ENCERRAMENTO' + '|' + '17' + '|' + 'LIVRO DIARIO GERAL' + '|' + subsi_name + '|' + '?????' + '|' + '0101'+anioperiodoend_end + '|' + '3112'+anioperiodoend_end + '|';
				strBody += '\r\n';

				//****** Registro J930: Signatários da Escrituração  **********************************************************************

				strBody += '|' + 'J930|PAULO CESAR URIAS|13465982827|CONTADOR|900|234874|PAULO.CESAR@NCH.COM|1532373934|SP|SP/2013/234871||N' + '|';
				strBody += '\r\n';

				strBody += '|' + 'J930|WAGNER POLLIS|09938384803|ADMINISTRADOR|205||WAGNER.POLLIS@NCH.COM|1533219200||||S' + '|';
				strBody += '\r\n';

				//****** Registro J990: Encerramento do Bloco J  **********************************************************************

				Count_Regj = Count_Regj + 4;

				strBody += '|' + 'J990' + '|' + Count_Regj + '|';
				strBody += '\r\n';

			//****** Bloco 9: Controle e Encerramento do Arquivo Digital  ************************************************************************
			//****** Registro 9001: Abertura do Bloco 9  **********************************************************************

			strBody += '|' + '9001' + '|' + '0' + '|';
			strBody += '\r\n';

			//****** Registro 9900: Registros do Arquivo  **********************************************************************

			strBody += '|' + '9900' + '|' + '0000' + '|' + '000001' + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + '0001' + '|' + '000001' + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + '0007' + '|' + '000001' + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + '0990' + '|' + '000001' + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I001' + '|' + '000001' + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I010' + '|' + '000001' + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I030' + '|' + '000001' + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I050' + '|' + ('000000' + cont_regI050).slice(-6) + '|' + '\r\n';		
			strBody += '|' + '9900' + '|' + 'I051' + '|' + ('000000' + cont_regI051).slice(-6) + '|' + '\r\n';		
			strBody += '|' + '9900' + '|' + 'I052' + '|' + ('000000' + cont_regI052).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I100' + '|' + ('000000' + cont_regI100).slice(-6) + '|' + '\r\n';		
			strBody += '|' + '9900' + '|' + 'I150' + '|' + ('000000' + cont_regI150).slice(-6) + '|' + '\r\n';	
			strBody += '|' + '9900' + '|' + 'I155' + '|' + ('000000' + cont_regI155).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I200' + '|' + ('000000' + cont_regI200).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I250' + '|' + ('000000' + cont_regI250).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I350' + '|' + ('000000' + cont_regI350).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I355' + '|' + ('000000' + cont_regI355).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'I990' + '|' + ('000000' + cont_regI990).slice(-6) + '|' + '\r\n';	
			strBody += '|' + '9900' + '|' + 'J001' + '|' + ('000000' + regj001).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'J005' + '|' + ('000000' + regj005).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'J100' + '|' + ('000000' + regj100).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'J150' + '|' + ('000000' + cont_j150).slice(-6) + '|' + '\r\n';	
			strBody += '|' + '9900' + '|' + 'J210' + '|' + ('000000' + regj210).slice(-6) + '|' + '\r\n';	
			strBody += '|' + '9900' + '|' + 'J215' + '|' + ('000000' + regj215).slice(-6) + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + 'J900' + '|' + '000001' + '|' + '\r\n';		
			strBody += '|' + '9900' + '|' + 'J930' + '|' + '000002' + '|' + '\r\n';	
			strBody += '|' + '9900' + '|' + 'J990' + '|' + '000001' + '|' + '\r\n';		
			strBody += '|' + '9900' + '|' + '9001' + '|' + '000001' + '|' + '\r\n';	
			strBody += '|' + '9900' + '|' + '9900' + '|' + '000031' + '|' + '\r\n';	
			strBody += '|' + '9900' + '|' + '9990' + '|' + '000001' + '|' + '\r\n';
			strBody += '|' + '9900' + '|' + '9999' + '|' + '000001' + '|' + '\r\n';							

			//****** Registro 9990: Encerramento do Bloco 9  **********************************************************************

			strBody += '|' + '9990' + '|' + '000034' + '|';							
			strBody += '\r\n';

			//****** Registro 9999: Encerramento do Arquivo Digital  **********************************************************************

			strBody += '|' + '9999' + '|' + '?????' + '|';							
			strBody += '\r\n';

			//CREATE & SAVE THE FILE
			savefile( Ilogid,Subsid,periodname_ini );

		var usage = nlapiGetContext().getRemainingUsage();
			nlapiLogExecution('DEBUG', 'Units Usage', usage);
			nlapiLogExecution('DEBUG', 'scheduled', '** End Script **');

	} catch(err) 
	{
		nlapiLogExecution('ERROR', 'Failed', err);
		
		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_rpt_generator_log', Ilogid, ['custrecord_nch_rg_name'], ['Try Catch Failed']);
	}
}

/* ------------------------------------------------------------------------------------------------------ 
 * RESET DE UNIDADES DE MEMORIA EN SCRIPT
 * --------------------------------------------------------------------------------------------------- */
function checkGovernance()
{
	var context = nlapiGetContext();
	 
	if( context.getRemainingUsage() < 50 )
	{
		var state = nlapiYieldScript();
		  
		if( state.status == 'FAILURE' )
		{
		   	nlapiLogExecution("ERROR","Failed to yield script, exiting: Reason = " + state.reason + " / Size = " + state.size);
		   	throw "Failed to yield script";
	  	} 
	 	else if ( state.status == 'RESUME' )
	  	{
	   		nlapiLogExecution("AUDIT", "Resuming script because of " + state.reason + ".  Size = " + state.size);
	  	}
	  	// state.status will never be SUCCESS because a success would imply a yield has occurred.  The equivalent response would be yield
 	}
}

/* ------------------------------------------------------------------------------------------------------ 
 * Nota: Graba el archivo en FileCabinet
 * --------------------------------------------------------------------------------------------------- */
function savefile( Ilogid,Subsid,periodname )
{
	// Ruta de la carpeta contenedora - SuiteFiles_NCH
	var FolderId 	= 5259;
	var Ilogid 		= Ilogid;
	var Subsid 		= Subsid;
	
	var NameFile = '';
		NameFile += 'ECD_BR_' + periodname;

	var NameFile_Show = '';
			
	// Crea el archivo TXT
	var File = nlapiCreateFile(NameFile + '.txt', 'PLAINTEXT', strBody);
	File.setEncoding('UTF-8');
	File.setFolder(FolderId);

	NameFile_Show = NameFile + '.txt';

	// Termina de grabar el archivo
	var idfile = nlapiSubmitFile(File);

	// Trae URL de archivo generado
	var idfile2 = nlapiLoadFile(idfile);

	var urlfile = '';
	var environment = objContext.getEnvironment();
	if (environment == 'SANDBOX') {
		urlfile = "https://3574893-sb2.app.netsuite.com/";
	}
	if (environment == 'PRODUCTION') {
		urlfile = "https://system.netsuite.com";
	}
	urlfile += idfile2.getURL();

	// Actualiza el log
	nlapiSubmitField('customrecord_nch_rpt_generator_log', Ilogid, ['custrecord_nch_rg_name', 'custrecord_nch_rg_url_file'], [NameFile_Show , urlfile]);
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