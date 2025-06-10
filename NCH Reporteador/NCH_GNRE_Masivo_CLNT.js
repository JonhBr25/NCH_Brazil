/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@NModuleScope Public
 *
 * Version    Date            Author           Remarks
 * 1.00       08 Abr 2025     Jaciel           Generar masivamente los GNRE
 */

define(['N/url', 'N/log', 'N/https', 'N/ui/dialog', 'N/record'],
    function (url, log, https, dialog, record) {
        var currentRecord = '';

        function pageInit(context) {
            currentRecord = context.currentRecord;
        }

        function Genera_GNREMasivo() {
            try {
                // function si(clicSi) {
                //     if (clicSi) {
                const suiteletUrl = url.resolveScript({
                    scriptId: 'customscript_brl_ss_transaction_gnre',
                    deploymentId: 'customdeploy_brl_ss_transaction_gnre',
                    returnExternalUrl: false
                });

                var gnreListaCuantos = currentRecord.getLineCount({
                    sublistId: 'custpage_sublista_log'
                });
                var gnreLista = currentRecord.getSublist({
                    sublistId: 'custpage_sublista_log'
                });

                var seleccionadoValida = false;

                for (var j = 0; j < gnreListaCuantos; j++) {
                    seleccionadoValida = currentRecord.getSublistValue({
                        sublistId: 'custpage_sublista_log',
                        fieldId: 'custpage_log_gnre_genera',
                        line: j
                    });

                    if (seleccionadoValida) {
                        break;
                    }
                }

                if (!seleccionadoValida) {
                    dialog.alert({
                        title: 'Aviso!',
                        message: 'Você deve selecionar pelo menos um registro para gerar GNRE.'
                    });
                }

                for (var i = 0; i < gnreListaCuantos; i++) {
                    var seleccionado = currentRecord.getSublistValue({
                        sublistId: 'custpage_sublista_log',
                        fieldId: 'custpage_log_gnre_genera',
                        line: i
                    });

                    if (seleccionado) {
                        var estatusGNRE = currentRecord.getSublistValue({
                            sublistId: 'custpage_sublista_log',
                            fieldId: 'custpage_log_gnre_est_gnre',
                            line: i
                        });
                        var numeroDoc = currentRecord.getSublistValue({
                            sublistId: 'custpage_sublista_log',
                            fieldId: 'custpage_log_gnre_documento',
                            line: i
                        });

                        var subsidiaryId = 3;
                        var transactionId = currentRecord.getSublistValue({
                            sublistId: 'custpage_sublista_log',
                            fieldId: 'custpage_log_gnre_idinterno',
                            line: i
                        });
                        var tipoDoc = currentRecord.getSublistValue({
                            sublistId: 'custpage_sublista_log',
                            fieldId: 'custpage_log_gnre_tipodoc',
                            line: i
                        });

                        var transactionType = (tipoDoc == 'Documento fiscal') ? 'invoice' : 'customsale_brl_outbound_delivery';

                        var tex = ' this0' + '|' + suiteletUrl + '|' + transactionId + '|' + transactionType;
                        log.debug({ title: 'suitelet_main', details: tex });

                        // var suiteletGNRE = https.post.promise({
                        var suiteletGNRE = https.post({
                            body: JSON.stringify({
                                sourceTransactionId: transactionId,
                                targetRecordType: 'gnre_transaction',
                                subsidiaryId: subsidiaryId,
                                transactionType: transactionType
                            }),
                            url: suiteletUrl
                        })
                        // .then((function (e) {
                        //     var t = JSON.parse(e.body);
                        //     // t.success ? (F.BannerHandler.getInstance().showBanner(u),
                        //     // 	setTimeout((function () {
                        //     // 		(0,
                        //     // 			n.reloadPage)()
                        //     // 	}
                        //     // 	), 1e4),
                        //     // 	o()) : (F.BannerHandler.getInstance().showBanner((0,
                        //     // 		n.createGnreErrorMessage)(t.message)),
                        //     // 		d())
                        //     log.debug({
                        //         title: 'then',
                        //         details: t.success + '|' + t.message
                        //     });
                        //     // GuardaLog('then', '', '', t.success + '|' + t.message);
                        // }
                        // ))
                        // .catch((function (e) {
                        //     // F.BannerHandler.getInstance().showBanner((0,
                        //     // 	n.createGnreErrorMessage)(e)),
                        //     // 	i.error("Error occurred on Transaction GNRE generation", e),
                        //     // 	d()
                        //     log.debug({
                        //         title: 'catch',
                        //         details: e
                        //     });
                        //     // GuardaLog('catch', '', '', e);
                        // }
                        // ));

                        var respuestGNRE = JSON.parse(suiteletGNRE.body);
                        var regreso = respuestGNRE.success;
                        var mensajeR = respuestGNRE.message;

                        log.debug({
                            title: 'Genera_GNREMasivo()',
                            details: transactionId + '|' + suiteletGNRE.body.toString()
                        });

                        GuardaLog(numeroDoc, tipoDoc, regreso.toString(), mensajeR);

                        if (regreso) {
                            // alert(transactionId + '|' + regreso + '\n' + mensajeR);
                            dialog.alert({
                                title: 'Aviso!',
                                message: 'O ' + tipoDoc + ' de transação número ' + numeroDoc + ' foi gerado e enviado'
                            });
                        } else {
                            dialog.alert({
                                title: 'Aviso!',
                                message: numeroDoc + '|' + mensajeR
                            });
                        }

                        // window.opener.location.reload()

                        // Se llama de nuevo al SuiteLet actual
                        // redirect.toSuitelet({
                        //     scriptId: 'customscript_nch_gnre_masivo_br',
                        //     deploymentId: 'customdeploy_nch_gnre_masivo_br'
                        // });
                        //     };
                        // }

                        // function no(clicNo) {
                        //     return false;
                        // }

                        // dialog.confirm({
                        //     title: 'Gerar guia de recolhimento de imposto GNRE?',
                        //     message: 'Cada transação só pode ter uma guia de recolhimento de imposto GNRE. A geração e a autorização da guia GNRE é uma ação irreversível.'
                        // }).then(si).catch(no);
                        // }
                    }
                }
            }
            catch (e) {
                log.error({
                    title: 'cliente',
                    details: e.toString()
                });
            }
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
            pageInit: pageInit,
            Genera_GNREMasivo: Genera_GNREMasivo
        };
    });
