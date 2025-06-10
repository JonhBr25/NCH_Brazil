/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 *
 * Version    Date            Author             Remarks
 * 1.00       24/04/2025      Joao Tadeu           Formulario para importar FCI Governo
 */

define(['N/runtime', 'N/ui/message', 'N/search','N/record','N/currentRecord', 'N/url', 'N/https'],
    function (runtime, message,search, record,currentRecord, url, https) {

        var msgClient = null;
        var sessionObj = runtime.getCurrentSession();

        function onPageInit(context) {
            currentRecord = context.currentRecord;

            var paso = sessionObj.get({ name: "paso" });

            if (paso == 2) {
                alert('Arquivo XML carregado, preencha a tabela de itens.');
            }

            //Esconde si esta en el primer paso
            var accion = (paso == 1 || paso == '' || paso == null) ? false : true;
            // EscondeMuestraCampos(accion, currentRecord);
        }

        function onSaveRecord(context) {
            try {
                
                return true;
            } catch (error) {
                //GuardaLog('onSaveRecord', '', xmlNombre, error);
                alert('ERRO'+error);

                return false;
            }
            
        }

        function Salvar() {

            /*    
                var suiteletURL = url.resolveScript({
                    scriptId: 'customscript_nch_importa_fci_txt',
                    deploymentId: 'customdeploy_nch_importa_fci_txt_gov'
                });
*/
          //  form.setAttribute('method', 'POST');
           // form.setAttribute('action', suiteletURL);


               return false;
        }


        function Cancelar() {
            try {
                if (msgClient) {
                    msgClient.hide();
                }

                msgClient = message.create({
                    title: "CANCELADO",
                    message: "Processo cancelado.",
                    type: message.Type.INFORMATION,
                    duration: 10000
                });
                msgClient.show();

                
                var cancelarBoton = true;
                
                var suiteletURL = url.resolveScript({
                    scriptId: 'customscript_nch_importa_fci_txt',
                    deploymentId: 'customdeploy_nch_importa_fci_txt_gov',
                    returnExternalUrl: false,
                    params: {
                        custscript_cancelarboton: cancelarBoton
                    }
                });
                window.onbeforeunload = null;
                location.href = suiteletURL;


                return true;
            } catch (error) {
                alert(error);

                return false;
            }
        }

        //NCH Log Importacion XML Compra
        function GuardaLog(idNombre, proveedor, notas, error) {
            var registroLog = record.create({
                type: 'customrecord_nch_importa_factura_xml_br'
            })

            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_idnombre', value: idNombre });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_proveedor', value: proveedor });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_notas', value: notas });
            registroLog.setValue({ fieldId: 'custrecord_nch_log_importaxml_error', value: error });

            registroLog.save();
        }

        return {
            pageInit: onPageInit,
            saveRecord: onSaveRecord,
            Salvar:Salvar,
            Cancelar: Cancelar
        };
    });