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

                    var filefolder  = 106478;//SANDBOX
                    //var filefolder  = 107782;//PRODUCCION
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
            var num_legal = 0;

            //log.error('trantype ', trantype ); 

            if (trantype == 'invoice') 
            {
                var rec_now = record.load({
                    type: record.Type.INVOICE,
                    id: currentRecord.id,
                    });
                
                num_legal     = rec_now.getValue('custbody_brl_tran_t_edoc_number');  

                if (!num_legal) 
                {
                    num_legal = rec_now.getValue('custbody_brl_tran_t_rps_num');  
                }
    
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