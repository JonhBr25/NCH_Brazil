/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope Public
 *
 * Version    Date            Author           Remarks
 * 1.00       12 May 2025     Jaciel           Valida del lado de cliente la creación de factura desde XML de GNRE
 */

define(['N/url', 'N/log', 'N/https', 'N/ui/dialog', 'N/record', 'N/ui/message'],
    function (url, log, https, dialog, record, message) {
        var currentRecord = '';

        function onSaveRecord(context) {
            currentRecord = context.currentRecord;
            var seleccion = false;

            var gnreLista = currentRecord.getLineCount({
                sublistId: 'custpage_sublista_log'
            });

            for (var i = 0; i < gnreLista; i++) {
                var check = currentRecord.getSublistValue({
                    sublistId: 'custpage_sublista_log',
                    fieldId: 'custpage_log_gnre_cf_criar',
                    line: i
                });

                if (check) {
                    seleccion = true;
                }
            }

            if (!seleccion) {
                var messageObj = message.create({
                    title: "¡Error!",
                    type: message.Type.ERROR,
                    message: 'Você deve selecionar pelo menos um GNRE.'
                });

                messageObj.show({
                    duration: 7000 
                });

                return false;
            }
         
            return true;
        }

        /**
         * Guarda éxito o error en log: NCH Log GNRE Masivo
         * 
         * @param {string} idDocumento Documento / Donde sucede el error
         * @param {string} tipoDocumento Tipo de documento
         * @param {string} notas Notas extras
         * @param {string} error Mensaje de error
         */
        function GuardaLog(idDocumento, tipoDocumento, notas, error) {
            var registroLog = record.create({
                type: 'customrecord_nch_log_gnre_masivo_br'
            })

            registroLog.setValue({
                fieldId: 'custrecord_nch_documento_gnre_m', value: idDocumento
            });
            registroLog.setValue({
                fieldId: 'custrecord_nch_tipodoc_gnre_m', value: tipoDocumento
            });
            registroLog.setValue({
                fieldId: 'custrecord_nch_notas_gnre_m', value: notas
            });
            registroLog.setValue({
                fieldId: 'custrecord_nch_error_gnre_m', value: error
            });

            registroLog.save();
        }

        return {
            saveRecord: onSaveRecord
        };
    });
