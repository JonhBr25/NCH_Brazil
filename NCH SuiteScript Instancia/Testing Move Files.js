/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
 */
define(['N/search', 'N/record', 'N/https', 'N/file', 'N/runtime'],    
    function(search, record, https, file, runtime) 
    {

    	function beforeLoad(context) 
        {
    		return true;
    	}
	
        function beforeSubmit(context) 
        {
            try
            {        	
                var currentRecord = context.newRecord;      	
                var eventype = context.type;
                var status_e = currentRecord.getValue({fieldId: 'custbody_brl_tran_l_edoc_status'}); 
                var id_file  = currentRecord.getValue({fieldId: 'custbody_brl_tran_dc_cert_pdf_file'});  
                
                //STATUS 3 = AUTORIZADO
                //EVENTYPE = xedit     
                    
                if( eventype === 'xedit' && id_file.length > 0 )
                {        		        	
                    //ID_FILE IN TRANSACTION | ID CUSTOMER | CADASTRO FEDERAL
                    var id_file_pdf = currentRecord.getValue({fieldId: 'custbody_brl_tran_dc_cert_pdf_file'});
                    var trantype    = currentRecord.type;
                    var name_type   = '';
                    var id_type_T   = 0;

                    if( trantype === 'invoice' )
                    {
                        var rec = record.load({
                            type: record.Type.INVOICE,
                            id: currentRecord.id
                        }); 
                    }
                    else
                    {
                        var rec = record.load({
                            type: 'customsale_brl_outbound_delivery',
                            id: currentRecord.id
                        });
                    }                                       
                    
                    log.error('eventype', eventype );
                    log.error('Status EI', status_e);
                    log.error('id_file', id_file_pdf ); 
                    log.error('trantype', trantype ); 

                    name_type = trantype === 'invoice' ? 'Documento Fiscal' : 'Remessa de Salida';
                    id_type_T = trantype === 'invoice' ? 7 : 113;

                    name_file      = rec.getValue('custbody_brl_tran_t_edoc_number'); 
                    
                    //COPY FILE TO OTHER FILE CABINET
                    var filerec     = file.load({id: id_file_pdf});
                    var filename    = name_type + '_' + name_file;
                    var filetype    = filerec.fileType;
                    var filecontent = filerec.getContents();
                    
                    log.error('filename | filetype | id_tran ', filename + ' | ' + filetype + ' | ' + currentRecord.id ); 

                    var filefolder  = 67547;
                    var fileObj = file.create({
                        name: filename,
                        fileType: filetype,
                        contents: filecontent,
                        isOnline: true
                    });

                        fileObj.folder = filefolder;

                    var fileId = fileObj.save();

                    // Trae URL de archivo generado
                    var idfile2 = file.load({id: fileId});

                    var urlfile = '';
                    var environment = runtime.envType;
                    
                    if (environment == 'SANDBOX') {
                        urlfile = "https://3574893-sb2.app.netsuite.com";
                    }
                    if (environment == 'PRODUCTION') {
                        urlfile = "https://system.netsuite.com";
                    }

                    var InternalId_filenew  = idfile2.id;
                        urlfile             += idfile2.url;

                    /*
                    User.department 
                    User.email 
                    User.id 
                    User.location 
                    User.name 
                    User.role 
                    User.roleCenter 
                    User.roleId 
                    User.subsidiary
                    */
                    var userObj = runtime.getCurrentUser();
                    //ID CUSTOMER | CADASTRO FEDERAL
                    var id_customer = rec.getValue({fieldId: 'entity'});
                    var num_cadastro = rec.getValue({fieldId: 'custbody_brl_tran_t_cust_fed_tx_reg'});

                    log.error('id_customer | num_cadastro ', id_customer + ' | ' + num_cadastro ); 
                    
                    //CREA LOG EN CUSTOMTABLE PARA IMPRESION
                    var logRecordm = record.create({ type: 'customrecord_nch_log_mass_print' });
                        logRecordm.setValue('custrecord_nch_createfor', userObj.id);
                        logRecordm.setValue('custrecord_nch_id_file', InternalId_filenew);
                        logRecordm.setValue('custrecord_nch_name_arquivo', filename);
                        logRecordm.setValue('custrecord_nch_url_file', urlfile);  
                        logRecordm.setValue('custrecord_nch_customer_invoice', id_customer);  
                        logRecordm.setValue('custrecord_nch_num_reg_fiscal', num_cadastro);
                        logRecordm.setValue('custrecord_nch_type_transaction', id_type_T);      
                        logRecordm.save();                   
                
                }     	
                               
                // GNRE
                var estatusGNRE = currentRecord.getValue({fieldId: 'custbody_brl_tran_l_gnre_edoc_status'});
                var idPDF = currentRecord.getValue({fieldId: 'custbody_brl_tran_dc_gnre_pdf'});
                var idPDFTex = currentRecord.getText({fieldId: 'custbody_brl_tran_dc_gnre_pdf'});
                var mensajeRetorno = currentRecord.getText({fieldId: 'custbody_brl_tran_lt_gnre_return_msg'});
                var idXML = currentRecord.getValue({fieldId: 'custbody_brl_tran_dc_gnre_xml'});
                var idXMLTex = currentRecord.getText({fieldId: 'custbody_brl_tran_dc_gnre_xml'});
                
                if(eventype === 'xedit' && mensajeRetorno.length > 0) {
                    log.error('MensajeRetornon', mensajeRetorno + '|');
                }

                if(eventype === 'xedit' && (idPDF.length > 0 || idXML.length))
                {        		        	
                    var tipoTransaccion = currentRecord.type;

                    if( tipoTransaccion === 'invoice' )
                        {
                            var rec = record.load({
                                type: record.Type.INVOICE,
                                id: currentRecord.id
                            }); 
                        }
                        else
                        {
                            var rec = record.load({
                                type: 'customsale_brl_outbound_delivery',
                                id: currentRecord.id
                            });
                        }                                       
                        
                    log.error('TipoEventoGNRE|EstatusGNRE|IdPDF|TipoTransaccion|IdXML', eventype + '|' + estatusGNRE + '|' + idPDF + idPDFTex + '|' + 
                        tipoTransaccion + '|' + idXML + idXMLTex);

                    var id_type_T = (tipoTransaccion === 'invoice') ? 7 : 113;

                    var numeroDoc = rec.getValue({
                        fieldId: 'custbody_brl_tran_t_edoc_number'
                    });
                    
                    // COPY FILE TO OTHER FILE CABINET
                    var filerec = file.load({
                        id: idPDF
                    });
                    var filename = idPDFTex.substring(0, 17) + '_' + numeroDoc;
                    var filetype    = filerec.fileType;
                    var filecontent = filerec.getContents();
                    
                    // Copia el XML a otro folder del gabinete
                    var archivoXML = file.load({
                        id: idXML
                    });
                    var archivoXMLNombre = idXMLTex.substring(0, 25) + '_' + numeroDoc;
                    var archivoXMLTipo = archivoXML.fileType;
                    var archivoXMLContenido = archivoXML.getContents();
                    
                    log.error('filename|filetype|idTran ', filename + '|' + filetype + '|' + currentRecord.id); 
                    log.error('ArchivoXMLNombre|ArchivoXMLTipo|idTran ', archivoXMLNombre + '|' + archivoXMLTipo + '|' + currentRecord.id); 

                    // Folder destino PDF y XML respectivamente
                    var environment = runtime.envType;

                    if (environment == 'SANDBOX') {
                        var filefolder = 68049, archivoXMLFolder = 68050;                        
                    }
                    else {
                        var filefolder = 106474, archivoXMLFolder = 106475;
                    }

                    var extensionXML = '.xml';

                    // Crear copia de archivo en nuevo folder
                    var fileObj = file.create({
                        name: filename,
                        fileType: filetype,
                        contents: filecontent,
                        isOnline: true
                    });
                    var archivoXMLObj = file.create({
                        name: archivoXMLNombre + extensionXML,
                        fileType: archivoXMLTipo,
                        contents: archivoXMLContenido,
                        isOnline: true
                    });

                    fileObj.folder = filefolder;
                    archivoXMLObj.folder = archivoXMLFolder;

                    var fileId = fileObj.save();
                    var archivoXMLId = archivoXMLObj.save();

                    // Trae URL de archivo generado
                    var idfile2 = file.load({ id: fileId });
                    var archivoXMLIdNuevo2 = file.load({ 
                        id: archivoXMLId 
                    });

                    var urlfile = '', archivoXMLURL = '';
                    
                    if (environment == 'SANDBOX') {
                        urlfile = "https://3574893-sb2.app.netsuite.com";
                        archivoXMLURL = "https://3574893-sb2.app.netsuite.com";
                    }
                    if (environment == 'PRODUCTION') {
                        urlfile = "https://system.netsuite.com";
                        archivoXMLURL = "https://system.netsuite.com";
                    }

                    var InternalId_filenew  = idfile2.id;
                        urlfile             += idfile2.url;
                    var archivoXMLIdInterno = archivoXMLIdNuevo2.id;
                    archivoXMLURL += archivoXMLIdNuevo2.url;

                    //ID CUSTOMER | CADASTRO FEDERAL
                    var id_customer = rec.getValue({fieldId: 'entity'});
                    var num_cadastro = rec.getValue({fieldId: 'custbody_brl_tran_t_cust_fed_tx_reg'});

                    log.error('id_customer | num_cadastro ', id_customer + ' | ' + num_cadastro ); 
                    
                    // NCH Log GNRE Impressão em massa (PDF)
                    var logGNREim = record.create({ 
                        type: 'customrecord_nch_log_gnre_impresion_masi' 
                    });
                    logGNREim.setValue('custrecord_nch_idinterno_gnre_i', InternalId_filenew);
                    logGNREim.setValue('custrecord_nch_tipodoc_gnre_i', id_type_T);      
                    logGNREim.setValue('custrecord_nch_nome_arquivo_gnre_i', filename);
                    logGNREim.setValue('custrecord_nch_url_arquivo_gnre_i', urlfile);  
                    logGNREim.setValue('custrecord_nch_cliente_gnre_i', id_customer);  
                    logGNREim.setValue('custrecord_nch_cadastro_gnre_i', num_cadastro);
                    logGNREim.save();                   
                
                    // NCH Log GNRE Creacion Factura (XML)
                    var logGNREfc = record.create({ 
                        type: 'customrecord_nch_log_gnre_crear_factura' 
                    });
                    logGNREfc.setValue('custrecord_nch_idarchivo_gnre_cf', archivoXMLIdInterno);
                    logGNREfc.setValue('custrecord_nch_tipodoc_gnre_cf', id_type_T);      
                    logGNREfc.setValue('custrecord_nch_nome_arquivo_gnre_cf', archivoXMLNombre);
                    logGNREfc.setValue('custrecord_nch_url_arquivo_gnre_cf', 'Para criar'); // archivoXMLURL);  
                    logGNREfc.setValue('custrecord_nch_cliente_gnre_cf', id_customer);  
                    logGNREfc.save();
                }

                return true;

            }catch(e){
                log.error({
                    title: 'Wrong on Try Catch Moving Script.',
                    details: e
                    });
                
                return false;
            }        
        }

        function afterSubmit(context) 
        {
            var currentRecord = context.newRecord;
            var eventype = context.type;
            var trantype = currentRecord.type;

            //log.error('trantype ', trantype ); 

            if (eventype == 'create'  && trantype == 'invoice') 
            {
                var rec_now = record.load({
                    type: record.Type.INVOICE,
                    id: currentRecord.id,
                    });
                
                var num_legal     = rec_now.getValue('custbody_brl_tran_t_edoc_number');  
    
                log.error('aftersubmit_num_legal ', num_legal ); 
                            
                rec_now.setValue({
                    fieldId: 'tranid',
                    value: num_legal,
                });
                    
                rec_now.save({
                    enableSourcing: true,
                });                
            }
            
            if (eventype == 'create' && trantype == 'customsale_brl_outbound_delivery') 
            {
                var rec_now = record.load({
                    type: 'customsale_brl_outbound_delivery',
                    id: currentRecord.id,
                    });
                
                var num_legal     = rec_now.getValue('custbody_brl_tran_t_edoc_number');  
    
                log.error('aftersubmit_num_legal ', num_legal ); 
                            
                rec_now.setValue({
                    fieldId: 'tranid',
                    value: num_legal,
                });
                    
                rec_now.save({
                    enableSourcing: true,
                });                
            }    
            
            return true;
        }

	    return{
		beforeLoad : beforeLoad,
		beforeSubmit: beforeSubmit,
		afterSubmit : afterSubmit
                 
        };
    });