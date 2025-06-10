/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *
 * Version    Date            Author           Remarks
 * 1.00       04 Jun 2025     Jaciel           Valida transacción outbound delivery (Remessa de Saída) desde Ejecución de pedido de artículo
 */

define(['N/ui/dialog'],
    function (dialog) {

        function onPageInit(context) {
            // Lógica RemessaSaída desde ItemFulfillment
            var currentRecord = context.currentRecord;

            var nuevaRemessaSaida = currentRecord.getValue({
                fieldId: 'custbody_nch_idnuevo_rm_desde_if'
            });
            var tipoTransaccion = currentRecord.getValue({
                fieldId: 'custbody_nch_natope_trans_netsuite'
            });

            // Redirecciona al nuevo registro
            if (tipoTransaccion === 1 && !nuevaRemessaSaida) {

            }
        }

        function fieldChanged(context) {
            var currentRecord = context.currentRecord;
            var fieldId = context.fieldId;

            if (fieldId === 'custbody_nch_idnuevo_rm_desde_if') {
                var idRMNuevo = currentRecord.getValue(fieldId);

                if (idRMNuevo) {
                    // window.location.href = '/app/accounting/transactions/outbounddelivery.nl?id=' + idRMNuevo;
                }
            }
        }

        return {
            pageInit: onPageInit,
            fieldChanged: fieldChanged
        };
    }); 