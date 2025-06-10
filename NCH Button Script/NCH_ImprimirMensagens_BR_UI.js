/**
 * @NApiVersion 2.x 
 * @NScriptType UserEventScript
 *
 * Version    Date            Author           Remarks
 * 1.00       15 Jul 2024     Jaciel           Mostrar PDF de Factura de cliente con sus mensajes relacionados a nivel de artículo y general
 */

define(['N/runtime'],
	function (runtime) {

		/* function beforeLoad_addButton(scriptContext) {
			var form = scriptContext.form;
			form.addButton({ id: 'custpage_buttonid', label: 'Test', functionName: 'clientButton()' });
			form.clientScriptFileId = 18964;
			//ID interna del archivo de script en el gabinete de archivos     
		}
		return {
			beforeLoad: beforeLoad_addButton
		} */

		function beforeLoad_addButton(context) {
			var currentContext = runtime.getCurrentScript();
			var form = context.form;

			var tex = ' this0' + '|' + runtime.executionContext + '|' + runtime.ContextType.USER_INTERFACE + '|' + context.type;
			log.debug({ title: 'beforeLoad_addButton', details: tex });

			if ((runtime.executionContext == runtime.ContextType.USER_INTERFACE) && (context.type == 'view')) {
				form.addButton({
					id: 'custpage_botonImprime',
					label: 'Imprimir fatura mensagens',
					functionName: 'ImprimeFacturaMensajes()'
				});
				form.clientScriptFileId = 18964;
			}
		}

		return {
			beforeLoad: beforeLoad_addButton
		}

	});
