/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.0.0      20 Feb 2025      João Tadeu
 * File : NCH_FCI_SCHDL.js
 */
var objContext =  nlapiGetContext();

// Control de Memoria
var intMaxReg = 1000;
var intMinReg = 0;
// Cuerpo del archivo
var strBody 		= '';
var xmlStr 			= '';
var periodstartdate	= '';
var periodenddate	= '';
var periodname 		= '';
var anioperiodoend	= '';
var mesperiodo		= '';

var item_cod        = '';
var item_descr      = '';
var item_NCM        = '';
var id_Prod_Envase  = 0;

function scheduled_main(type) 
{
	var logId = objContext.getSetting('SCRIPT', 'custscript_br_idrep_fci');
	var subsId = objContext.getSetting('SCRIPT', 'custscript_br_subsi_fci');
	var periodo = objContext.getSetting('SCRIPT', 'custscript_br_perio_fci');
	
	try 
    {

		var tex = '** Starting Script **';
		nlapiLogExecution('DEBUG', 'scheduled', tex);
		
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
         
        //LOAD SUBSIDIARY FIELDS
		var subs_fields 		= ['legalname','custrecord_brl_subsd_t_fed_tx_reg','custrecord_brl_subsd_t_state_tx_reg'];
        var objsubsidiary 		= nlapiLookupField('subsidiary',subsId,subs_fields);
        var subsi_name	 		= objsubsidiary.legalname;
        var subsi_taxid			= objsubsidiary.custrecord_brl_subsd_t_fed_tx_reg;
        var subsi_subsc			= objsubsidiary.custrecord_brl_subsd_t_state_tx_reg;
         
        var reg0000_1 	= '0000';													
        var reg0000_2 	= subsi_taxid.replace(/[./-]+/g,'');													
        var reg0000_3 	= subsi_name;					
        var reg0000_4 	= '1.0'; 
        var reg0000_5	= '0001';
        var reg0000_6 	= "Texto em caracteres UTF-8: (dígrafo BR)'ção',(dígrafo espanhol-enhe)'ñ',(trema)'Ü',(ordinais)'ªº',(ligamento s+z alemão)'ß'.";
        var reg0000_7 	= '0010';
        var reg0000_8 	= subsi_subsc;
        var reg0000_9 	= 'Av. Darci Carvalho Dafferner,200|18085850|Sorocaba|SP';
        var reg0000_10 	= '0990';
        var reg0000_11 	= '4';
        var reg0000_12 	= '5001';

        var cont_reg5020 = 0;
        var cont_reg9999 = 0;

        strBody +=  reg0000_1 + '|' + reg0000_2 + '|' + reg0000_3 + '|' + reg0000_4;
        strBody += '\r\n';
        strBody += reg0000_5 + '|' + reg0000_6;
        strBody += '\r\n';
        strBody += reg0000_7 + '|' + reg0000_2 + '|' + reg0000_3 + '|' + reg0000_8 + '|' + reg0000_9;
        strBody += '\r\n';
        strBody += reg0000_10 + '|' + reg0000_11;
        strBody += '\r\n';
        strBody += reg0000_12;
        strBody += '\r\n'; 

        //****** REGISTRO 5020 **********************************************************************

        //LOAD NCH Construcciones Detalle | OBTENEMOS MAESTRO DE ITEMS EN UN ARRAY DEL PERIODO SELECCIONADO
        //SE AGREGA FILTRO PARA TRAER SOLO LAS OP DE GENERICOS

			var carga_items = nlapiLoadSearch('transaction','customsearch_nch_detalle_op_br');
				carga_items.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', periodstartdate));
				carga_items.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', periodenddate));	
                carga_items.addFilter(new nlobjSearchFilter('custbody_nch_es_op_jugo', null, 'is', 'T')); //FIELD NCH OP Generico?	
				
			var resultSet_carga = carga_items.runSearch();
			var objCuenta_carga = resultSet_carga.getResults(0, 1000);
        		//nlapiLogExecution('DEBUG', 'scheduled', "Encontrou registros:"+objCuenta_carga.length);

			var a = 0;
			var Arr_Item  = [];	
            var Arr_NumOP = [];	
			
			while ( a < objCuenta_carga.length ) 
			{
				cols = objCuenta_carga[a].getAllColumns();		
                
                if(objCuenta_carga[a].getValue(cols[3]) == 'Articulo Construido')
                {
                    Arr_Item.push( objCuenta_carga[a].getValue(cols[3]) + '|' + objCuenta_carga[a].getValue(cols[4]) + '|' + objCuenta_carga[a].getValue(cols[5]) + '|' + objCuenta_carga[a].getValue(cols[6]) + '|' + objCuenta_carga[a].getValue(cols[7]) + '|' + objCuenta_carga[a].getValue(cols[9]) );
                    Arr_NumOP.push( objCuenta_carga[a].getValue(cols[0]) + '|' + objCuenta_carga[a].getValue(cols[4]) + '|' + objCuenta_carga[a].getValue(cols[5]) );
                }			
				
				a++
			}

            //FUNCION PARA QUITAR DUPLICADOS EN ARRAY
            function arrayUnique(array) 
            { 
                var ar = array;

                for( var i=0; i < ar.length; ++i ) 
                { 
                    for( var j=i+1; j < ar.length; ++j ) 
                    { 
                        if( ar[i] === ar[j] )
                            ar.splice(j--, 1); 
                    } 
                } 

                return ar; 
            } 

            var concentra_items = arrayUnique(Arr_Item); //ITEM TYPE | ID ITEM | ITEM NAME
            var concentra_ops   = arrayUnique(Arr_NumOP); //INTERNAL ID OP | ID ITEM | ITEM NAME

			nlapiLogExecution('DEBUG', 'concentra_items', concentra_items.length);
			nlapiLogExecution('DEBUG', ' concentra_items ', JSON.stringify(concentra_items));
            nlapiLogExecution('DEBUG', 'concentra_ops', concentra_ops.length);
			nlapiLogExecution('DEBUG', ' concentra_ops ', JSON.stringify(concentra_ops));
            //throw 'pararou aqui';



        for (var j = 0; j < concentra_items.length; j++) 
        {
            var Arr_contas  = concentra_items[j].split("|");
            var campo013 	= Arr_contas[0];//TIPO ITEM GENERICO
            var campo014 	= Arr_contas[1];//ID INTERNO ITEM GENERICO
            var campo015 	= Arr_contas[2];//Nome ITEM GENERICO
            var campo016 	= Arr_contas[3];//NCM ITEM GENERICO
                campo016    = campo016.replace(/[./-]+/g,''); 	
            var campo017 	= Arr_contas[4];//ITEM GENERICO code
            var campo018 	= Arr_contas[5];//origem ITEM GENERICO
            var campo019    = ''; // Gtin revisar
            var Q_Producida         = 0;//SALVA TOTAL QUANTIDAD PRODUCIDA X OP
            var Cont_OP             = 0;//SALVA TOTAL DE NUMERO DE PRODUCAOS
            var val_importado       = 0;//SALVA CALCULO DE VALOR IMPORTADO EN ORIGENES 1,2,3,8

            for (var k = 0; k < concentra_ops.length; k++) 
            {
                var Arr_nop     = concentra_ops[k].split("|");
                var id_op 	    = Arr_nop[0];//INTERNAL ID OP
                var id_item 	= Arr_nop[1];//INTERNAL ID ITEM GENERICO

                if( campo014 == id_item )
                {
                   // nlapiLogExecution('DEBUG', ' NUM_OP ', id_op);

                    //LOAD NCH Construcciones Detalle | LOGICA PARA RECORRER COMPONENTES (STEP 1)
                    var buscaAgrupador      = nlapiLoadSearch('transaction', 'customsearch_nch_detalle_op_br');
                        buscaAgrupador.addFilter(new nlobjSearchFilter('internalid', null, 'is', id_op));
                    var colAgrupador        = buscaAgrupador.getColumns();
                    var resultadosAgrupador = buscaAgrupador.runSearch();
                    var a                   = 0;
                    var results 	        = [];
                    var slice	 	        = [];

                    do
                    {
                        slice = resultadosAgrupador.getResults(a, a + 1000);
                        slice.forEach(function(result) 
                        {
                        var resultObj = {};
                        colAgrupador.forEach(function(column) 
                        {
                            resultObj[column.getName()] = result.getValue(column);
                        });
                        
                        results.push(resultObj);

                        if( result.getValue(colAgrupador[3]) === 'Articulo Construido' )
                        {
                            Q_Producida     += parseInt(result.getValue(colAgrupador[12]));
                            Cont_OP          = Cont_OP + 1;
                           
                        }
                                
                        if( result.getValue(colAgrupador[3]) === 'Componente' )
                        {                 
                            var nome_compone    = result.getText(colAgrupador[4]);//Nome Componente
                            var num_lote_ori    = result.getValue(colAgrupador[10]);//INTERNA ID LOTE USADO
                            var origen_compo    = 0;//result.getValue(colAgrupador[9]);//VALOR ORIGEN DE COMPONENTE
                            var Q_consum        = 0;
                            var quaxvalun       = 0;

                           // nlapiLogExecution('DEBUG', ' nome_compone | num_lote_ori | origen_Produto ',nome_compone +' | ' + num_lote_ori + ' | ' + campo018 );

                            //LOAD BUSQUEDA NCH Detalhe do estoque | PARA TRAER VALOR UNITARIO DE LOTE Y CALCULAR PRIMER PORCENTUAL SIN ENVASE
                            var carga_lote = nlapiLoadSearch( null,'customsearch_nch_detalle_stoque_br');
                                carga_lote.addFilter(new nlobjSearchFilter('internalid', 'inventorynumber', 'is', num_lote_ori));// ID INTERNO DE LOTE A BUSCAR
                            
                            var resultSet_lote = carga_lote.runSearch();
                            var objCuenta_lote = resultSet_lote.getResults(0, 10);
                        
                            var c = 0;
                            
                            while ( c < objCuenta_lote.length ) 
                            {
                                cols = objCuenta_lote[c].getAllColumns();		
                                
                                var origen_compo_lote = objCuenta_lote[c].getValue(cols[2]);
                                origen_compo          = objCuenta_lote[c].getValue(cols[9]);
                               // nlapiLogExecution('DEBUG', 'num_lote_ori | origen_compo_lote | origen_compo', num_lote_ori + ' | '+ origen_compo_lote   + "|" + origen_compo);

                                if( origen_compo === '1' || origen_compo === '2'|| origen_compo === '3'|| origen_compo === '8')
                                {
                                    var id_unitario     = objCuenta_lote[c].getValue(cols[0]);
                                    var valor_unitario  = objCuenta_lote[c].getValue(cols[8]);

                                    Q_consum        = parseFloat(result.getValue(colAgrupador[4]));                                
                                    quaxvalun       = parseFloat(result.getValue(colAgrupador[4])) * parseFloat(valor_unitario);
                                }
                                c++
                            }

                            
                            val_importado   += parseFloat(quaxvalun); 
                        
                        }  
                                            
                            
                            a++;
                        });
                    } while (slice.length >= 1000);

                   //throw 'paro';

                }
                
            }

            var media_ponderada_quantidade = Q_Producida/Cont_OP;
            var media_ponderada_valor_importado =  val_importado/Cont_OP;
            var valor_produto_importado =media_ponderada_valor_importado/media_ponderada_quantidade;

           //nlapiLogExecution('DEBUG', ' Q_Producida | Cont_OP| media_ponderada_quantidade ',Q_Producida +' | ' + Cont_OP + ' | ' + media_ponderada_quantidade );
           //nlapiLogExecution('DEBUG', ' media_ponderada_valor_importado | val_importado| valor_produto_importado',media_ponderada_valor_importado +' | ' + val_importado + ' | ' + valor_produto_importado);

           // nlapiLogExecution('DEBUG', ' ID do Produt', campo014);
            
            //Caso o Valor importado seja ZERO, não continuar o calculo
            if(val_importado > 0)
            {
                //LOAD NCH Construcciones Detalle | OBTENEMOS MAESTRO DE ITEMS EN UN ARRAY DEL PERIODO SELECCIONADO
                //SE AGREGA FILTRO PARA TRAER SOLO LAS OP DE Envase
                var carga_items_envase = nlapiLoadSearch('transaction','customsearch_nch_detalle_op_br');
                    carga_items_envase.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', periodstartdate));
                    carga_items_envase.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', periodenddate));	
                    carga_items_envase.addFilter(new nlobjSearchFilter('custbody_nch_op_jugo', null, 'is', campo014)); //FIELD NCH OP Generico?	
                // carga_items_envase.addFilter(new nlobjSearchFilter('item', 'custbody_nch_op_jugo', 'is', campo014)); //FIELD NCH OP Generico?	
                    
                var resultSet_carga_envase = carga_items_envase.runSearch();
                var objCuenta_carga_envase = resultSet_carga_envase.getResults(0, 1000);


                var a = 0;
                var Arr_Item  = [];	
                var Arr_NumOP = [];	
                var Q_Producida_envase        = 0;//SALVA TOTAL QUANTIDAD PRODUCIDA X OP
                var Cont_OP_envase            = 0;//SALVA TOTAL DE NUMERO DE PRODUCAOS
               // var valor_OP_envase           = 0;
                var valorTotalImportadoEnvase = 0; 
               // var item_descr                = "";
                var valor_Unitario_Envasado_Importado = 0;

               // nlapiLogExecution('DEBUG', ' length',objCuenta_carga_envase.length);

                /*

                    No momento do calculo dos produtos de Envasse (Que sair na nota), será necessário checar todas as embalagens

                */

                if(objCuenta_carga_envase.length > 0)
                {
                    //nlapiLogExecution('DEBUG', ' campo014 | colAgrupador | valor_produto_importado', campo014 + '|'+colAgrupador + '|'+valor_produto_importado);

                    valor_Unitario_Envasado_Importado = CalculoNotaFornecedor(objCuenta_carga_envase,campo014,colAgrupador,valor_produto_importado);
                    campo015    = item_descr;
                    campo017    = item_cod;
                    campo016    = item_NCM;

                }
                else
                {

                    var filters = new Array();
                    filters[0] = new nlobjSearchFilter( 'type', null, 'anyof', 'Build');
                    filters[1] = new nlobjSearchFilter( 'custbody_nch_op_jugo', null, 'anyof', campo014);
                    filters[2] = new nlobjSearchFilter( 'trandate', null, 'before',  periodstartdate );

                    // Define return columns
                    var columns = new Array();
                    columns[0] = new nlobjSearchColumn( 'internalid', null, 'GROUP');
                    columns[1] = new nlobjSearchColumn( 'trandate', null, 'MAX');

                    var searchresults = nlapiSearchRecord( 'assemblybuild', null, filters, columns );

                    if(searchresults)
                    {

                        var data_ultima =  new Date(nlapiStringToDate(searchresults[0].getValue(columns[1])).getFullYear(),  (nlapiStringToDate(searchresults[0].getValue(columns[1])).getMonth()), 1, 0, 0, 0);// "01/" + (nlapiStringToDate(searchresults[0].getValue(columns[1])).getMonth()+1)+ "/" + nlapiStringToDate(searchresults[0].getValue(columns[1])).getFullYear();
                        
                        var data_inicio = data_ultima;// searchresults[0].getValue(columns[1]);
                        var data_final =  new Date(nlapiStringToDate(searchresults[0].getValue(columns[1])).getFullYear(),  (nlapiStringToDate(searchresults[0].getValue(columns[1])).getMonth()), 1, 0, 0, 0);// "01/" + (nlapiStringToDate(searchresults[0].getValue(columns[1])).getMonth()+1)+ "/" + nlapiStringToDate(searchresults[0].getValue(columns[1])).getFullYear();

                        data_final.setMonth(data_final.getMonth() +1);
                        data_final.setMinutes(-1);

                        data_inicio = data_inicio.getDate() + "/" + (data_inicio.getMonth() +1) + "/" + data_inicio.getFullYear();
                        data_final = data_final.getDate() + "/" + (data_final.getMonth() +1) + "/" + data_final.getFullYear();

                        //nlapiLogExecution('DEBUG', 'Log_Jonh', searchresults.length);
                        //nlapiLogExecution('DEBUG', 'data | data_ultima | data_inicio| data_final', searchresults[0].getValue(columns[1]) + "|" + data_ultima + "|" + data_inicio+ "|" + data_final );

                        //LOAD NCH Construcciones Detalle | OBTENEMOS MAESTRO DE ITEMS EN UN ARRAY DEL PERIODO SELECCIONADO
                        //SE AGREGA FILTRO PARA TRAER SOLO LAS OP DE Envase
                        var carga_items_envase = nlapiLoadSearch('transaction','customsearch_nch_detalle_op_br');
                        carga_items_envase.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', data_inicio ));
                        carga_items_envase.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', data_final));	
                        carga_items_envase.addFilter(new nlobjSearchFilter('custbody_nch_op_jugo', null, 'is', campo014)); //FIELD NCH OP Generico?	
                        // carga_items_envase.addFilter(new nlobjSearchFilter('item', 'custbody_nch_op_jugo', 'is', campo014)); //FIELD NCH OP Generico?	
                    
                        var resultSet_carga_envase = carga_items_envase.runSearch();
                        var objCuenta_carga_envase = resultSet_carga_envase.getResults(0, 1000);

                        if(objCuenta_carga_envase.length > 0)
                        {
                            valor_Unitario_Envasado_Importado = CalculoNotaFornecedor(objCuenta_carga_envase,campo014,colAgrupador,valor_produto_importado);
                            campo015    = item_descr;
                            campo017    = item_cod;
                            campo016    = item_NCM;
                            // throw 'pararou aqui';

                           // nlapiLogExecution('DEBUG', ' valor_Unitario_Envasado_Importado ',  valor_Unitario_Envasado_Importado + "|" +item_descr + "|" + item_cod + "|" + item_NCM);
                        }

                    }
 
                }

                var Quant_NF_Saida     = 0;
                var Valor_NF_Saida     = 0;
                var valor_media_ponde_NF_Saida = 0;
                var contRegistros      = 0;
                var numNFAnterior      = 0;
                //Caso o valor de Importado seja maior que ZERO procusa a saida



                if(valor_Unitario_Envasado_Importado > 0)
                {

                    //LOAD NCH Construcciones Detalle | OBTENEMOS Notas de Saidas
                    var carga_NF_Saidas = nlapiLoadSearch('transaction','customsearch_nch_fci_venda');
                        carga_NF_Saidas.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', periodstartdate));
                        carga_NF_Saidas.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', periodenddate));
                        carga_NF_Saidas.addFilter(new nlobjSearchFilter('item', null, 'is', id_Prod_Envase ));// Produto Embalagem BUSCAR	
                    
                        // Adiciona a ordenação por data (exemplo: 'trandate' em ordem crescente)
                        //carga_NF_Saidas.addFilter(new nlobjSearchColumn('trandate', null, 'MAX'));//, null, false); // false para crescente, true para decrescente
	
                        
                    var resultSet_carga_NF = carga_NF_Saidas.runSearch();
                    var objCuenta_carga_NF = resultSet_carga_NF.getResults(0, 1000);

                    a=0;

                    //  nlapiLogExecution('DEBUG', ' id_Prod_Envase',  id_Prod_Envase);
                    //PrecioBase(id_Prod_Envase) ;
                    // nlapiLogExecution('DEBUG', ' campo014',  campo014);



                    if(objCuenta_carga_NF.length > 0)
                    {
                        // Utiliza para o calculo as notas do periodo informado
                        while ( a < objCuenta_carga_NF.length ) 
                        {
                            cols = objCuenta_carga_NF[a].getAllColumns();		
                            if(numNFAnterior != parseInt( objCuenta_carga_NF[a].getValue(cols[0])))
                            {
                                numNFAnterior  = parseInt( objCuenta_carga_NF[a].getValue(cols[0]));
                                contRegistros = contRegistros +1;
                            }    

                            Quant_NF_Saida = Quant_NF_Saida + parseFloat(objCuenta_carga_NF[a].getValue(cols[5]));
                            Valor_NF_Saida = Valor_NF_Saida + parseFloat(objCuenta_carga_NF[a].getValue(cols[6]));
                            a++

                            //nlapiLogExecution('DEBUG', 'Log_Jonh| Quant_NF_Saida|Valor_NF_Saida', objCuenta_carga_NF.length+"|"+Quant_NF_Saida+"|"+Valor_NF_Saida);
                        }
                    }
                    else
                    {
                        /* 
                            Utilizar a ultima saida antes do Periodo informado acima
                            Exemplo: Data acima Incio 01/01/2025 Final: 31/01/2025 não existe entrada Pegar o periodo da ultima entrada
                                    Data Ultima entrada 16/08/2024, utilizar o periodo de incio: 01/08/2024 Final: 31/08/2025

                            Falta fazer este trecho
                        */
                        var data_ultima = periodstartdate;


                        var partes =  periodstartdate.split('/');
                        var dia_1 = parseInt(partes[0], 10);
                        var mes_1 = parseInt(partes[1], 10) -1;
                        var ano_1 = parseInt(partes[2], 10);


                        var data_inicio = new Date(ano_1,mes_1, 1, 0, 0, 0);

                        data_inicio.setMonth(data_inicio.getMonth() - 12);

                        data_inicio =  "01/" + (data_inicio.getMonth() +1) + "/" + data_inicio.getFullYear();

                       // nlapiLogExecution('DEBUG', ' Nota Saida | Quant | Valor', data_inicio );
                       // data_final = data_final.getDate() + "/" + (data_final.getMonth() +1) + "/" + data_final.getFullYear();

                        //LOAD NCH Construcciones Detalle | OBTENEMOS Notas de Saidas de periodo anterior
                        var carga_NF_Saidas = nlapiLoadSearch('transaction','customsearch_nch_fci_venda');
                        carga_NF_Saidas.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', data_inicio));
                        carga_NF_Saidas.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', periodstartdate));
                        carga_NF_Saidas.addFilter(new nlobjSearchFilter('item', null, 'is', id_Prod_Envase ));// Produto Embalagem BUSCAR		
                            
                        var resultSet_carga_NF = carga_NF_Saidas.runSearch();
                        var objCuenta_carga_NF = resultSet_carga_NF.getResults(0, 1000);

                        a=0;

                        if(objCuenta_carga_NF.length > 0)
                        {
                            // Utiliza para o calculo as notas do periodo informado anterior
                            while ( a < objCuenta_carga_NF.length ) 
                            {
                                var partes =  objCuenta_carga_NF[a].getValue(cols[2]).split('/');
                                var dia = parseInt(partes[0], 10);
                                var mes = parseInt(partes[1], 10) -1;
                                var ano = parseInt(partes[2], 10);

                                data_ultima = new Date(ano,mes, 1, 0, 0, 0);
                                a = objCuenta_carga_NF.length + a;
                            }

                            var data_inicio_temp = data_ultima ;// "01/" + (nlapiStringToDate(searchresults[0].getValue(columns[1])).getMonth()+1)+ "/" + nlapiStringToDate(searchresults[0].getValue(columns[1])).getFullYear();                            // searchresults[0].getValue(columns[1]);
                            var data_final_temp  = data_ultima ;// "01/" + (nlapiStringToDate(searchresults[0].getValue(columns[1])).getMonth()+1)+ "/" + nlapiStringToDate(searchresults[0].getValue(columns[1])).getFullYear();
                            
                           // nlapiLogExecution('DEBUG', ' Nota Saida | Quant | Valor', data_inicio_temp + " | " + data_final_temp );

                            data_final_temp.setMonth(data_final_temp.getMonth() +1);
                            data_final_temp.setMinutes(-1);

                           // nlapiLogExecution('DEBUG', ' Datas', data_inicio_temp + " | " + data_final_temp);
                            data_inicio_temp =  "01/" + (data_inicio_temp.getMonth() +1) + "/" + data_inicio_temp.getFullYear();
                            data_final_temp  = data_final_temp .getDate() + "/" + (data_final_temp.getMonth() +1) + "/" + data_final_temp.getFullYear();

                           // nlapiLogExecution('DEBUG', ' Nota Saida | Quant | Valor', data_inicio_temp + " | " + data_final_temp);
                                    
                            var carga_NF_Saidas = nlapiLoadSearch('transaction','customsearch_nch_fci_venda');
                            carga_NF_Saidas.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter',data_inicio_temp));
                            carga_NF_Saidas.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', data_final_temp));
                            carga_NF_Saidas.addFilter(new nlobjSearchFilter('item', null, 'is', id_Prod_Envase ));// Produto Embalagem BUSCAR		
                                
                            var resultSet_carga_NF = carga_NF_Saidas.runSearch();
                            var objCuenta_carga_NF = resultSet_carga_NF.getResults(0, 1000);
    
                            a=0;
                            // Utiliza para o calculo as notas do periodo informado
                            while ( a < objCuenta_carga_NF.length ) 
                            {
                                cols = objCuenta_carga_NF[a].getAllColumns();		
                                if(numNFAnterior != parseInt( objCuenta_carga_NF[a].getValue(cols[0])))
                                {
                                    numNFAnterior  = parseInt( objCuenta_carga_NF[a].getValue(cols[0]));
                                    contRegistros = contRegistros +1;
                                }    
    
                                Quant_NF_Saida = Quant_NF_Saida + parseFloat(objCuenta_carga_NF[a].getValue(cols[5]));
                                Valor_NF_Saida = Valor_NF_Saida + parseFloat(objCuenta_carga_NF[a].getValue(cols[6]));
      
                                a++
                            }

                        }
                        else
                        {
                            /* 
                                Não localizou as ultimas saidas, será necessário pegar o valor de venda da embalagem para fazer o calculo
                                Falta criar o processo para buscar o valor de venda do item
                            */
                            Valor_NF_Saida = PrecioBase(id_Prod_Envase) ;
                            Quant_NF_Saida = 1;
                            contRegistros  = 1;
                        }
                    
                    }
                                
                    valor_media_ponde_NF_Saida = (Valor_NF_Saida / contRegistros ) / (Quant_NF_Saida /contRegistros );
                    nlapiLogExecution('DEBUG', 'Log_Jonh| O Valor foi igual a zero', 'Valor ZERO - Checar'+valor_media_ponde_NF_Saida);
                    if(valor_media_ponde_NF_Saida > 0)
                    {
                       // var Manter_FCI_ATUAL = 0; // Exemplo de checagem (Comparar com a Tabela de FCI no NetSuite)
                        var fci_percentual = ((valor_Unitario_Envasado_Importado / valor_media_ponde_NF_Saida)*100).toFixed(2);
                       
                        /*
                            Agrardando informações sobre a Tabela do NETSUITE onde sera adicionado os valores
                            É necessario checar a Tabela de FCI para ver se o percentual esta entre a faixa do FCI ativo no NetSuite
                        */
                        var origem_temp = 0;
                        var origem = 8;
                        if(fci_percentual <= 40)
                        {
                            origem = 5;
                        }
                        else
                        if(fci_percentual > 40 && fci_percentual <= 70)
                        {
                            origem = 3;     
                        }
                        else
                        if(fci_percentual > 70 && fci_percentual <= 100)
                        {
                            origem = 8;    
                        }
                        else
                        {
                            //Erro no valor (Não pode ocorrer valor superior a 100%)
                            nlapiLogExecution('DEBUG', ' ERRO AO CALCULAR VALOR FCI (valor superior a 100%)', campo015 + '|' + campo016+ '|' + campo017+ '|' + campo019  );
                        }

                        // Cria um objeto de pesquisa
                        var cargaRegistroFciSearch = nlapiSearchRecord(
                            'customrecord_nscs_fciinformation', // Tipo do registro
                            null, // Nenhum filtro de pesquisa salvo será usado
                            [   // Filtros de pesquisa
                                new nlobjSearchFilter('custrecord_nscs_fcii_item', null, 'is', id_Prod_Envase)
                                // new nlobjSearchFilter('custrecord_nscs_fcii_enddate', null, 'isnotempty')
                            ],
                            [   // Colunas de resultado
                                new nlobjSearchColumn('id'),
                                new nlobjSearchColumn('custrecord_nscs_fcii_item'),
                                new nlobjSearchColumn('custrecord_nscs_fcii_number'),
                                new nlobjSearchColumn('custrecord_nscs_fcii_startdate'),
                                new nlobjSearchColumn('custrecord_nscs_fcii_enddate'),
                                new nlobjSearchColumn('custrecord_nch_conten_importa')
                                
                            ]
                        );

                        if(cargaRegistroFciSearch)
                        {
                            // Executa a pesquisa e obtém os resultados
                            if (cargaRegistroFciSearch && cargaRegistroFciSearch.length > 0) {
                                for (var i = 0; i < cargaRegistroFciSearch.length; i++) {
                                    var searchResult = cargaRegistroFciSearch[i];
                                    var idRegFCIprod = searchResult.getId(); // Obtém o ID do registro

                                    var numeroFCI = searchResult.getValue('custrecord_nscs_fcii_number');
                                    var dataFinal = searchResult.getValue('custrecord_nscs_fcii_enddate');
                                    var percentual_importado = searchResult.getValue('custrecord_nch_conten_importa'); 

                                    if(percentual_importado  <= 40)
                                    {
                                        origem_temp = 5;
                                    }
                                    else
                                    if(percentual_importado  > 40 && percentual_importado  <= 70)
                                    {
                                        origem_temp = 3;     
                                    }
                                    else
                                    if(percentual_importado  > 70)
                                    {
                                        origem_temp = 8;    
                                    }
                                }
                            }
                        }

                        if(origem != 0 && origem != origem_temp)
                        {

                            strBody +=  '5020' + '|' + campo015 + '|' + campo016+ '|' + campo017+ '|' + campo019 + '|' +valor_media_ponde_NF_Saida + '|'+valor_Unitario_Envasado_Importado+'|'+fci_percentual;
                            strBody += '\r\n';

                            cont_reg5020 = cont_reg5020 + 1;
                        }
                    }
                    else
                    {
                        /* 
                            sera necessario realizar o cancelamento do FCI que existe ativo no sistema
                            Implementar codigo para alterar e desativar o FCI
                        */
                        UpdateFCI_Origem_Produto(id_Prod_Envase);
                    }

                }
                else
                {
                    //realizar o cancelamento do FCI que existe ativo no sistema
                    UpdateFCI_Origem_Produto(id_Prod_Envase);
 
                }
                
            }

        }


                    
       // throw 'paro';
        
            //CONTEO DE LINEAS BLOQUE 5
            //cont_reg5020 = cont_reg5020 + 2;

            strBody +=  '5990' + '|' + (cont_reg5020 + 2);
            strBody += '\r\n';
            strBody +=  '9001';
            strBody += '\r\n';
            strBody +=  '9900|0000' + '|1';
            strBody += '\r\n';
            strBody +=  '9900|0010' + '|1';
            strBody += '\r\n';
            strBody +=  '9900|5020' + '|' + cont_reg5020;
            strBody += '\r\n';
            strBody +=  '9990' + '|5' ;
            strBody += '\r\n';
            strBody +=  '9999' + '|' + (cont_reg5020 + 12);
            strBody += '\r\n';

        nlapiLogExecution('DEBUG', 'strBody', strBody);

		
		//CREATE & SAVE THE FILE
        if(cont_reg5020 > 0)
        {
            savefile( logId,subsId );     
        }   
        else
        {
            nlapiSubmitField('customrecord_nch_rpt_generator_log', logId, ['custrecord_nch_rg_name'], ['Não há registro']);
        }

		var usage = nlapiGetContext().getRemainingUsage();
			//nlapiLogExecution('DEBUG', 'Units Remaining', usage);
			nlapiLogExecution('DEBUG', 'scheduled', '** End Script **')

	} catch(err) 
	{
		// Envio de mail si sucede error.
		//sendemail(err);
		nlapiLogExecution('DEBUG', 'Error', err);
		
		// Actualiza el log para informar que se inicio el proceso
		nlapiSubmitField('customrecord_nch_rpt_generator_log', logId, ['custrecord_nch_rg_name'], ['Failed']);
	}
}

function UpdateFCI_Origem_Produto(id_Prod_Envase)
{
                        var nomeTypeConsulta = 'customrecord_nscs_fciinformation';
                            
                                                // Cria um objeto de pesquisa
                        var cargaRegistroFciSearch = nlapiSearchRecord(
                            nomeTypeConsulta, // Tipo do registro
                            null, // Nenhum filtro de pesquisa salvo será usado
                            [   // Filtros de pesquisa
                                new nlobjSearchFilter('custrecord_nscs_fcii_item', null, 'is', id_Prod_Envase)
                                // new nlobjSearchFilter('custrecord_nscs_fcii_enddate', null, 'isnotempty')
                            ],
                            [   // Colunas de resultado
                                new nlobjSearchColumn('id'),
                                new nlobjSearchColumn('custrecord_nscs_fcii_item'),
                                new nlobjSearchColumn('custrecord_nscs_fcii_number'),
                                new nlobjSearchColumn('custrecord_nscs_fcii_startdate'),
                                new nlobjSearchColumn('custrecord_nscs_fcii_enddate'),
                                new nlobjSearchColumn('custrecord_nch_conten_importa')
                                
                            ]
                        );

                        if(cargaRegistroFciSearch)
                        {
                            nlapiLogExecution('DEBUG', 'Log_Jonh| cargaRegistroFciSearch.length ', cargaRegistroFciSearch.length );

                            // Executa a pesquisa e obtém os resultados
                            if (cargaRegistroFciSearch && cargaRegistroFciSearch.length > 0) {
                                for (var i = 0; i < cargaRegistroFciSearch.length; i++) {
                                    var searchResult = cargaRegistroFciSearch[i];
                                    var idRegFCIprod = searchResult.getId(); // Obtém o ID do registro

                                    var numeroFCI = searchResult.getValue('custrecord_nscs_fcii_number');
                                    var dataFinal = searchResult.getValue('custrecord_nscs_fcii_enddate');
                                    var percentual_importado = searchResult.getValue('custrecord_nch_conten_importa'); 

                                    var origemGoverno = 0;
                                    
                                    if(percentual_importado  <= 40)
                                    {
                                        origemGoverno = 5;
                                    }
                                    else
                                    if(percentual_importado  > 40 && percentual_importado  <= 70)
                                    {
                                        origemGoverno = 3;     
                                    }
                                    else
                                    if(percentual_importado  > 70)
                                    {
                                        origemGoverno = 8;    
                                    }

                                    var filters = new Array();
                                    filters[0] = new nlobjSearchFilter('scriptid', null, 'is', 'customlist_brl_item_origin');

                                    var columns = new Array();
                                    columns[0] = new nlobjSearchColumn('internalid');

                                    var searchResult = nlapiSearchRecord('customlist', null, filters, columns);

                                    if (searchResult && searchResult.length > 0) {
                                    var internalId = searchResult[0].getValue('internalid');

                                    var customListRecord = nlapiLoadRecord('customlist', internalId);
                                    var lineCount = customListRecord.getLineItemCount('customvalue');
                                    
                                    var ID_origem_lista = 1;
                                    
                                    for (var k = 1; k <= lineCount; k++) { 

                                        var origem = customListRecord.getLineItemValue('customvalue', 'abbreviation', k);
                                        var origemID= customListRecord.getLineItemValue('customvalue', 'valueid', k);

                                         nlapiLogExecution('DEBUG', 'Log_Jonh| dataFinal | idRegFCIprod ', dataFinal + "|"+idRegFCIprod);

                                        if(dataFinal == null || dataFinal == '')// if(origemGoverno.toString() === origem.toString())
                                        {


                                            var itemRecord = nlapiLoadRecord(nomeTypeConsulta, idRegFCIprod);
                                                itemRecord.setFieldValue('custrecord_nscs_fcii_enddate', nlapiDateToString(new Date())); //'2025-04-12') 
                                           var recordId = nlapiSubmitRecord(itemRecord);

                                            nlapiLogExecution('DEBUG', 'Log_Jonh| recordId  ', recordId  );



                                            var objitem = nlapiLookupField('item', id_Prod_Envase, ['itemid', 'type']);
                                            // Localiza o tipo 
                                            var itemtype = objitem.type;
                                            var nomeTypeConsulta = 'lotnumberedinventoryitem';

                                            if(itemtype == 'Assembly')
                                            {
                                                nomeTypeConsulta = 'lotnumberedassemblyitem';
                                            }
                                            //  Carregue o registro para edição.
                                            var itemRecord = nlapiLoadRecord(nomeTypeConsulta, id_Prod_Envase);

                                            itemRecord.setFieldValue('custitem_brl_l_item_origin',  ID_origem_lista); // Substitua pelo valor desejado.
                                            //  Salve as alterações.
                                            nlapiSubmitRecord(itemRecord);

                                            ID_origem_lista =origemID;
                                            break;
                                        }

                                    }
                                    
                                    }

                                }
                            }
                        }
}

function CalculoNotaFornecedor(objCuenta_carga_envase,campo014,colAgrupador,valor_produto_importado )
{
    var a = 0;

    var Q_Producida_envase        = 0;//SALVA TOTAL QUANTIDAD PRODUCIDA X OP
    var Cont_OP_envase            = 0;//SALVA TOTAL DE NUMERO DE PRODUCAOS
    var valorTotalImportadoEnvase = 0; 

                        //Calcula o valor dos ENVASES conforme OP de Montagem de Envase
                        while ( a < objCuenta_carga_envase.length ) 
                            {
                                cols = objCuenta_carga_envase[a].getAllColumns();		
        
        
                                if( objCuenta_carga_envase[a].getValue(cols[3]) === 'Articulo Construido' )
                                {
                                        // falta calcular o total produzido
                                        id_Prod_Envase     = parseInt(objCuenta_carga_envase[a].getValue(cols[4]) );
                                        var item_fields         = ['displayname','description'];
                                        var objItens            = nlapiLookupField('item',id_Prod_Envase,item_fields );
                                        item_cod            = objItens.displayname;
                                        item_descr          = objItens.description;
                                        item_NCM            = objCuenta_carga_envase[a].getValue(cols[6]).replace(/[./-]+/g,''); 
                                        Q_Producida_envase     += parseInt(objCuenta_carga_envase[a].getValue(cols[12]));
                                        Cont_OP_envase         = Cont_OP_envase  + 1;

                                        nlapiLogExecution('DEBUG', ' Pitem_cod | item_descr',item_cod + "|"+item_descr);
        
        
                                }
                                            
                                if( objCuenta_carga_envase[a].getValue(cols[3]) === 'Componente' )
                                {                 
                                        var nome_compone_envase    = objCuenta_carga_envase[a].getValue(cols[4]) ;//Nome Componente
                                        //var num_lote_ori    = result.getValue(colAgrupador[10]);//INTERNA ID LOTE USADO
                                        var origen_compo_envase    = 0;//result.getValue(colAgrupador[9]);//VALOR ORIGEN DE COMPONENTE
                                        var Q_consum_envase        = 0;
                                        var valor_envase       = 0;
                                        
                                        var quant_envase_generico           = parseFloat(objCuenta_carga_envase[a].getValue(cols[12])); 
                                        if(quant_envase_generico <0)
                                        {
                                            quant_envase_generico = quant_envase_generico * -1;
                                        }

                                        
        
                                        // nlapiLogExecution('DEBUG', ' nome_compone | num_lote_ori | origen_Produto ',nome_compone +' | ' + num_lote_ori + ' | ' + campo018 );
                                        //LOAD BUSQUEDA NCH Detalhe do estoque | Nota Fornecedor | PARA TRAER VALOR UNITARIO DE LOTE Y CALCULAR PRIMER PORCENTUAL SIN ENVASE
                                        //nlapiLogExecution('DEBUG', 'id_compone_envase | id_prod_Generico', nome_compone_envase +"|" + campo014);
                                        if( nome_compone_envase == campo014)
                                        {
                                            var id_unitario                     = objCuenta_carga_envase[a].getValue(cols[0]) ;
                                            var valor_unitario                  = objCuenta_carga_envase[a].getValue(cols[5]);
                                            //var quant_envase_generico           = parseFloat(objCuenta_carga_envase[a].getValue(cols[12])); //valor da quantidade do Generico Envasado                         
                                            var valor_envase_gererico_Importado = quant_envase_generico * valor_produto_importado;
                                            valorTotalImportadoEnvase = valorTotalImportadoEnvase +  valor_envase_gererico_Importado;
                                           // nlapiLogExecution('DEBUG', 'item_descr  | quant_envase_generico | val_importado | valor_envase_gererico_Importado ',item_descr+ "|" +quant_envase_generico+  "|"+ valor_produto_importado+ "|" + valor_envase_gererico_Importado );
        
                                        }
                                        else
                                        {
                                            var carga_NF_Forn = nlapiLoadSearch( null,'customsearch_nch_nf_forne_fci');
                                                carga_NF_Forn.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', periodstartdate));
                                                carga_NF_Forn.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', periodenddate));	
                                                carga_NF_Forn.addFilter(new nlobjSearchFilter('item', null, 'is', nome_compone_envase ));// ID INTERNO DE LOTE A BUSCAR
                                            
                                            var resultSet_NF_Forn = carga_NF_Forn.runSearch();
                                            var objCuenta_NF_Forn = resultSet_NF_Forn.getResults(0, 10);
        
                                            var c = 0;
                                            /*
                                                Falta definir a Origem
                                            */
                                            var origen_compo_envase = "0"; // sera necessario revisar sua entrada
                                            var quantTotalNF = 0;
                                            var valorTotalNF = 0;
                                            var valorImportadoItemFornecedor = 0;

                                            if(objCuenta_NF_Forn.length > 0)
                                            {
                                                while ( c < objCuenta_NF_Forn.length ) 
                                                {
                                                    cols = objCuenta_NF_Forn[c].getAllColumns();	
                                                    
                                                    if(objCuenta_NF_Forn[c].getValue(cols[7])>0)
                                                    {
                                                        origen_compo_envase = objCuenta_NF_Forn[c].getValue(cols[5]);
                                                    }

                                                    //origen_compo = objCuenta_NF_Forn[c].getValue(cols[2]); Falta ler a origem de entrada
                                                    if(  origen_compo_envase === "1" || origen_compo_envase === "2" || origen_compo_envase === "3" || origen_compo_envase === "8")
                                                    {
                                                        var valor_unitario  = objCuenta_NF_Forn[c].getValue(cols[8]);
                                                        Q_consum        = parseFloat(objCuenta_NF_Forn[c].getValue(colAgrupador[7]));  
                                                        quaxvalun       = parseFloat(objCuenta_NF_Forn[c].getValue(colAgrupador[7])) * parseFloat(valor_unitario);
                                                        
                                                        if(Q_consum > 0 && quaxvalun > 0)
                                                        {
                                                            quantTotalNF = quantTotalNF +  Q_consum;
                                                            valorTotalNF = valorTotalNF +  quaxvalun ;
                                                        }
                                                    }
                                                    
                                                    c++
                                                    
                                                }
                                            }
                                            else
                                            {
        
                                                   
                                                var carga_NF_Forn = nlapiLoadSearch( null,'customsearch_nch_nf_forne_fci');
                                                    //carga_NF_Forn.addFilter(new nlobjSearchFilter('startdate', 'accountingperiod', 'onorafter', periodstartdate));
                                                    carga_NF_Forn.addFilter(new nlobjSearchFilter('enddate', 'accountingperiod', 'onorbefore', periodstartdate));	
                                                    carga_NF_Forn.addFilter(new nlobjSearchFilter('item', null, 'is', nome_compone_envase ));// ID INTERNO DE LOTE A BUSCAR
        
                                                   // nlapiLogExecution('DEBUG', 'tentou ler aqui ',"Segundo techo tentou ler aqui"  );
                                                  //  nlapiLogExecution('DEBUG', 'tentou ler aqui ',"tentou ler aqui" + objCuenta_NF_Forn.length  );

                                                    while ( c < objCuenta_NF_Forn.length ) 
                                                        {
                                                            nlapiLogExecution('DEBUG', ' item  ', "Ta dificil");

                                                            cols = objCuenta_NF_Forn[c].getAllColumns();	

                                                            if(objCuenta_NF_Forn[c].getValue(cols[7])>0)
                                                            {
                                                                origen_compo_envase = objCuenta_NF_Forn[c].getValue(cols[5]);
                                                            }
                                                            if( origen_compo_envase === "1" || origen_compo_envase === "2" || origen_compo_envase === "3" || origen_compo_envase === "8")
                                                            {
                                                                // var id_unitario     = objCuenta_NF_Forn[c].getValue(cols[]);
                                                                var valor_unitario  = objCuenta_NF_Forn[c].getValue(cols[8]);
                
                                                                Q_consum        = parseFloat(objCuenta_NF_Forn[c].getValue(colAgrupador[7]));                                
                                                                quaxvalun       = parseFloat(objCuenta_NF_Forn[c].getValue(colAgrupador[7])) * parseFloat(valor_unitario);
                                                                
                                                                quantTotalNF = quantTotalNF +  Q_consum;
                                                                valorTotalNF = valorTotalNF +  quaxvalun ;
                
                                                            }
                                                            
                                                            c = objCuenta_NF_Forn.length;
                                                            c++
                                                            
                                                        }     
                                            }

                                            if(c>0)
                                            {
                                                quantTotalNF = quantTotalNF/c;
                                                valorTotalNF = valorTotalNF/c;
                                                
                                                valorImportadoItemFornecedor = valorTotalNF/quantTotalNF;
            
                                                var quant_envase_fornecedor           = quant_envase_generico ;  //valor da quantidade do Generico Envasado                         
                                                var valor_envase_fornecedor_Importado = quant_envase_fornecedor  * valorImportadoItemFornecedor;
            
                                                valorTotalImportadoEnvase = valorTotalImportadoEnvase +  valor_envase_fornecedor_Importado;      
                                            }                  
                                           // nlapiLogExecution('DEBUG', ' valorImportadoItemFornecedor | quant_envase_fornecedor | valor_envase_fornecedor_Importado', valorImportadoItemFornecedor + ' | ' + quant_envase_fornecedor + "|" +valor_envase_fornecedor_Importado);
                                        }
                                        
                                        // val_importado   += parseFloat(quaxvalun); 
                                    
                                }  		
                                
                                a++
                            }


                     

                            Q_Producida_envase = Q_Producida_envase /Cont_OP_envase;
                            valor_envase_fornecedor_Importado = valor_envase_fornecedor_Importado / Cont_OP_envase;
                            var valor_Unitario_Envasado_Importado =  valor_envase_fornecedor_Importado / Q_Producida_envase;


                            nlapiLogExecution('DEBUG', 'TESTE - valor_Unitario_Envasado_Importado ', valor_Unitario_Envasado_Importado);

                            if(valor_Unitario_Envasado_Importado > 0)
                            {
                                return valor_Unitario_Envasado_Importado;
                            }
                            valor_Unitario_Envasado_Importado = 0;
                            nlapiLogExecution('DEBUG', 'TESTE - valor_Unitario_Envasado_Importado ', valor_Unitario_Envasado_Importado);

                            return valor_Unitario_Envasado_Importado;
}


/*
    Localiza o preço de venda do item
*/
function PrecioBase(id_Item)
{
/*
    var filter = new Array(); 
    var column = new Array(); filter[0] = new nlobjSearchFilter('internalidnumber', null, 'equalto', '149'); //replace with item's internal ID column[0] = new nlobjSearchColumn('baseprice', null, null);  
    var results = new nlapiSearchRecord('item', null, filter, column);

    for (var i = 0; i < results.length; i++) 
    { 
        nlapiLogExecution('DEBUG', 'Base Price', results[i].getValue(column[0])); 
    }
    */


    var id_currency     = '1'; //id_currency Real
    var id_pricelevel   = '1'; //id_pricelevel Base Price
    var pricebase = 0;

    var filters = new Array();  
        filters[0] = new nlobjSearchFilter('internalid', null, 'is', id_Item);
        filters[1] = new nlobjSearchFilter('pricelevel', 'pricing', 'is', id_pricelevel);
        filters[2] = new nlobjSearchFilter('currency', 'pricing', 'is', id_currency);
    var columns = new Array();
        columns[0] = new nlobjSearchColumn('internalid');
        columns[1] = new nlobjSearchColumn('pricelevel', 'pricing'); 
        columns[2] = new nlobjSearchColumn('unitprice', 'pricing');
        columns[3] = new nlobjSearchColumn('quantityrange', 'pricing').setSort(); 

    var objResultline = nlapiSearchRecord('item', null , filters, columns);

    if (objResultline && objResultline.length > 0) {
    nlapiLogExecution('DEBUG', 'SEARCHPRECIO-long search: ',objResultline.length);
    nlapiLogExecution('DEBUG', 'JSON SEARCHPRECIO: ',JSON.stringify(objResultline));

    
    if (objResultline.length > 0)
    {
        for (var k = 0; k < objResultline.length; k++) 
        {
                pricebase = objResultline[k].getValue('unitprice', 'pricing');
                nlapiLogExecution('DEBUG', 'pricebase : ',pricebase);
        }
    }
    }
    return pricebase;
}

/* ------------------------------------------------------------------------------------------------------ 
 * Nota: Graba el archivo en FileCabinet
 * --------------------------------------------------------------------------------------------------- */
function savefile(Ilogid,Subsid)
{
	// Ruta de la carpeta contenedora
	var folderId = 5259;//67044;
    var Ilogid      = Ilogid;
    var Subsid      = Subsid;

	//var logId = objContext.getSetting('SCRIPT', 'custscript_br_idrep_balancete');
		
	// Genera el nombre del archivo
	var nameFile = '';
		nameFile += ' FCIGerado';

		//strBody = xmlStr;
	    var nameFile_Show = '';
		
	nlapiLogExecution('DEBUG', 'Nombre Archivo', nameFile);
	
	//Crea el file XLS
	var File = nlapiCreateFile(nameFile + '.txt', 'PLAINTEXT', strBody);
	File.setEncoding('UTF-8');
	File.setFolder(folderId);

	nameFile_Show = nameFile + '.txt';

	// Termina de grabar el archivo
	var idfile = nlapiSubmitFile(File);

	// Trae URL de archivo generado
	var idfile2 = nlapiLoadFile(idfile);

	var urlfile = '';
	var environment = objContext.getEnvironment();
	
	if (environment == 'SANDBOX') {
		urlfile = "https://8589184-sb1.app.netsuite.com";
	}
	if (environment == 'PRODUCTION') {
		urlfile = "https://system.netsuite.com";
	}
	urlfile += idfile2.getURL();

	// Actualiza el log para informar que se inicio el proceso
	nlapiSubmitField('customrecord_nch_rpt_generator_log', Ilogid, ['custrecord_nch_rg_name', 'custrecord_nch_rg_url_file'], [nameFile_Show , urlfile]);
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
