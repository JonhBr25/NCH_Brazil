/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * 
 * Version    Date            Author           	Remarks
 * 1.00       16 jul 2024     Jaciel			Mostrar PDF de Factura de cliente con sus mensajes relacionados a nivel de artículo y general
 */


define(['N/record', 'N/file', 'N/search', 'N/runtime', 'N/render'],
	function (record, file, search, runtime, render) {
		function onRequest(context) {
			try {
				//Método GET
				if (context.request.method == 'GET') {
					//Cliente relacionado
					var ambiente = runtime.envType;
					// form.clientScriptFileId = (ambiente == 'SANDBOX') ? 54826 : 54826;
					//form.clientScriptModulePath = 'SuiteScripts/NCH Developer/NCH SuiteScript Brasil/NCH_ImportaFacturaXML_Form_CLNT.js';

					var registroId = context.request.parameters.id;

					// Genera el archivo PDF
					var pdfArchivo = render.xmlToPdf({
						xmlString: GeneraPDF(registroId)
					});

					// Crea el archivo PDF
					// response.setContentType('PDF', 'NCH_CreditoRetencion.pdf', 'inline');

					// Muestra el PDF
					// response.write(file.getValue());
					context.response.renderPdf(GeneraPDF(registroId));
				}
			} catch (error) {
				var mensajeError = 'Error en método onRequest: ' + error + ' - ' + error.lineNumber
				log.debug({ title: 'Error suitelet_main', details: mensajeError });

				throw mensajeError;
			}
		}

		function GeneraPDF(registroId) {
			try {
				// Carga registro
				var registro = record.load({
					type: record.Type.INVOICE,
					id: registroId
				});

				//UF
				var subRegistroDireccion = registro.getSubrecord({
					fieldId: 'billingaddress'
				});
				var UF = subRegistroDireccion.getValue({
					fieldId: 'state'
				});

				/* var UFs = registro.getValue({
					fieldId: 'tranid'
				}); */

				if (UF == '' || UF == null) {
					throw 'Adicione um endereço de cobrança válido.';

					return false;
				}

				//Tipo segmento (CEST item)
				var cuantosArt = registro.getLineCount({
					sublistId: 'item'
				});

				var valorCEST = [], nombreItem = [];

				for (var x = 0; x < cuantosArt; x++) {
					var idItem = registro.getSublistValue({
						sublistId: 'item',
						fieldId: 'item',
						line: x
					});
					var item = registro.getSublistValue({
						sublistId: 'item',
						fieldId: 'item_display',
						line: x
					});

					var codigo = search.lookupFields({
						type: search.Type.ITEM,
						id: idItem,
						columns: ['custitem_brl_l_cest_code']
					});

					var tex = ' this1' + '|' + cuantosArt + '|' + idItem + '|' + String(codigo.custitem_brl_l_cest_code[0].text).substring(0, 2);
					log.debug({ title: 'beforeLoad_addButton', details: tex });

					valorCEST.push(String(codigo.custitem_brl_l_cest_code[0].text).substring(0, 2));
					nombreItem.push(item);
				}

				//Contribuyente ICMS
				var idCliente = registro.getValue({
					fieldId: 'entity'
				});

				var contribuyente = search.lookupFields({
					type: search.Type.CUSTOMER,
					id: idCliente,
					columns: ['custentity_br_nao_contribu_icms']
				});

				/* var codigoContribuyente = search.lookupFields({
					type: 'customrecord3431',
					id: contribuyente.custentity_br_nao_contribu_icms[0].value,
					columns: ['custrecord1397']
				}); */

				//Codigo tipo operación (finalidade)				
				var codigoTipoOperacion = registro.getValue({
					fieldId: 'custbody_nch_finalidad_br'
				});

				var pdfAbre = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
				pdfAbre += '<pdf><head><style>body {size:A4}</style></head><body>';
				//  style=\"background-image: url(\'https://3574893.app.netsuite.com/core/media/media.nl?id=7629121&amp;c=3574893&amp;h=e5893efc98dd0b7cbe2d\');\">';

				for (var y = 0; y < cuantosArt; y++) {

					var customrecord_nch_regras_mensagensSearchObj = search.create({
						type: "customrecord_nch_regras_mensagens",
						filters:
							[
								["custrecord_nch_unidad_federativa", "is", UF],
								"AND",
								["custrecord_nch_codigo_tipo_segmento", "equalto", valorCEST[y]],
								"AND",
								["custrecord_nch_codigo_contribuyente_icms", "equalto", "1"],
								"AND",
								["custrecord_nch_codigo_tipo_operacion", "equalto", "2"]
							],
						columns:
							[
								search.createColumn({ name: "custrecord_nch_mensage_descripcion", label: "NCH Mensage Descrição" }),
								search.createColumn({ name: "custrecord_nch_mensaje_posicion", label: "NCH Mensagen posição" })
							]
					});

					var searchResultCount = customrecord_nch_regras_mensagensSearchObj.runPaged().count;
					log.debug("customrecord_nch_regras_mensagensSearchObj result count", searchResultCount);

					var mensaje = [], parteMensaje = [];

					customrecord_nch_regras_mensagensSearchObj.run().each(function (result) {
						mensaje.push(result.getValue({ name: 'custrecord_nch_mensage_descripcion' }));
						parteMensaje.push(result.getValue({ name: 'custrecord_nch_mensaje_posicion' }));

						return true;
					});
				}

				var tex = ' this0' + '|' + nombreItem + '|' + mensaje + '|' + valorCEST;
				log.debug({ title: 'beforeLoad_addButton', details: tex });

				// Titulo
				var pdfHead = "<table style=\"font-family: Verdana, Arial, Helvetica, sans-serif; width:100%; height:100%; border:solid\">";
				pdfHead += "<tr>";
				pdfHead += "<td><b>DADOS DOS PRODUTOS / SERVIÇOS:</b></td><td></td>";
				pdfHead += "</tr>";
				for (var z = 0; z < cuantosArt; z++) {
					pdfHead += "<tr>";
					pdfHead += "<td><b>" + nombreItem[z] + "</b></td>";
					pdfHead += "<td><p><b> " + mensaje[z] + "</b></p></td>";
					pdfHead += "</tr>";
				}
				pdfHead += "<tr>";
				pdfHead += "<td><br/><br/><b>DADOS ADICIONAIS:</b></td><td></td>";
				pdfHead += "</tr>";
				pdfHead += "<tr>";
				pdfHead += "<td colspan=\"2\"><p><b> " + parteMensaje + "</b></p></td>";
				pdfHead += "</tr>";
				pdfHead += "</table>";

				var pdfCcierra = "</body>\n</pdf>";

				var pdfCompleto = pdfAbre + pdfHead + pdfCcierra;

				return pdfCompleto;
			} catch (error) {
				var mensajeError = 'Error en método GeneraPDF: ' + error + ' - ' + error.lineNumber
				log.debug({ title: 'Error GeneraPDF', details: mensajeError });

				throw mensajeError;
			}
		}

		return {
			onRequest: onRequest
		};
	});