/**
 * Module Description
 * 
 * Version    Date            Author   	Remarks
 * 1.00       06 nov 2014     LatamReady Consultor
 * 1.01       20 may 2025     Jaciel	Se adecúa PDF para Brasil	
 * File : OSSParteIngresoSTLT.js
 */
// Declaracion de variables
var recPDF = '';
var numeremi = '';
var provnomb = '';
var provdire = '';
var provnuid = '';
var numefact = '';
var numeorde = '';
var nombsubs = '';
var notaentr = '';
var nombalma = '';
var numeguia = '';
var fechcomp = '';
var partnota = '';
var partfech = '';
var tipcamb = '';
var subsId = '';
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet_main_prn_pi(request, response) {
	try { 
		// Declaracion de variables
		var strName = '';
	
		// Carga el registro 
		var recId = request.getParameter('id');	
		
		// Abre la transaccion
		recPDF = nlapiLoadRecord('itemreceipt', recId);

		numeremi = recPDF.getFieldValue('tranid');
		provnomb = recPDF.getFieldText('entity');
		if(provnomb!='' && provnomb!=null)
		{provnomb = provnomb.replace('&', '&amp;');}
		numefact = recPDF.getFieldValue('custbody8');
		if ( numefact=='' || numefact==null ) { numefact=''; }
		numeorde = recPDF.getFieldText('createdfrom');		
		nombsubs = recPDF.getFieldText('subsidiary');
		subsId = recPDF.getFieldValue('subsidiary');
		nombalma = recPDF.getFieldText('location');
		nombalmaorig = recPDF.getFieldText('transferlocation');
		if ( nombalmaorig=='' || nombalmaorig==null ) { nombalmaorig=''; }
		numeguia = recPDF.getFieldValue('custbody_rec_numero_guia');	
		if ( numeguia=='' || numeguia==null ) { numeguia=''; }
		partnota = recPDF.getFieldValue('memo');
		if ( partnota =='' || partnota ==null ) { partnota =''; }	
		if(partnota!='' && partnota!=null)
		{partnota = partnota.replace('&', '&amp;');}
		partfech = recPDF.getFieldValue('trandate');
        tipcamb = recPDF.getFieldValue('exchangerate');
		if(recPDF.getFieldValue('createdfrom')!='' && recPDF.getFieldValue('createdfrom')!=null)
		{ fechcomp = nlapiLookupField('purchaseorder', recPDF.getFieldValue('createdfrom') , 'custbody_fecha_comp_pro');}
		else
		{fechcomp='';}		
		if ( fechcomp=='' || fechcomp==null ) { fechcomp=''; }
		
		// Cabecera
		strName += cabecera();
		
		// Detalle
		strName += detpagina();
		
		// Pie de Pagina
		strName += piepagina();

		// Libera la variable
		recPDF = null;

		// Genera el archivo PDF
		var xml = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
			xml += '<pdf><head><style> body {size:A4}</style></head><body>';
			xml += strName;
			xml += "</body>\n</pdf>";
		
		//
		var file = nlapiXMLToPDF( xml );
		
		// Create el archivo PDF
		response.setContentType('PDF', 'NCH_ParteIngreso.pdf', 'inline');
		
		// Muestra el PDF
		response.write( file.getValue() );
	} catch(err){
		sendemail(err);

		// Mensaje para el cliente
		response.writeLine('<br><br>');	
		var strhtml = "<html>";
			strhtml += "<table border='0' class='table_fields' cellspacing='0' cellpadding='0' align='center'>" +
					"<tr>" +
					"</tr>" +
					"<tr>" +
					"<td class='text'>" +
					"<div style=\"color: gray; font-size: 10pt; margin-top: 10px; padding: 5px; border-top: 1pt solid silver\">"+
					"Nota: Se ha producido un error. Descripcion : " + err + "</div>" +
					"</td>" +
					"</tr>" +
					"</table>" +
					"</html>";
		response.writeLine(strhtml);	
		response.writeLine('<br><br>');	
	}
}


//-------------------------------------------------------------------------------------------------------	
//Cabecera
//-------------------------------------------------------------------------------------------------------
function cabecera(){
var strHead = '';
	var recsub = nlapiLookupField( 'subsidiary', recPDF.getFieldValue('subsidiary'), ['legalname', 'address1', 'address3', 'city', 'state', 'zip', 'country'] );
	var subname = recsub.legalname;
	var subadd1 = recsub.address1;
	var subadd2 = recsub.address3;
	var subadd3 = recsub.city + ' - ' + recsub.state + ' ' + recsub.zip;
	var subadd4 = recsub.country;
	var imagenLogo = nlapiLoadFile('Images/Netsuite-Brasil-Log.jpg');
	var objContext =  nlapiGetContext();
	var url = '';
	var ambiente = objContext.getEnvironment();
	if (ambiente == 'SANDBOX') {
		url = "https://3574893-sb2.app.netsuite.com/";
	}
	else {
		url = "https://system.netsuite.com/";
	}
	//var imagenUrl = url + imagenLogo.getURL();
	var imagenUrl = 'https://8589184-sb1.app.netsuite.com/core/media/media.nl?id=204405&amp;c=8589184_SB1&amp;h=B2fGPqR2XQlX4d80Q41o8i9kgUahvWUgxKM7lnYx-wjAZr01';

	// Titulo
	strHead += "<table style=\"font-family: Verdana, Arial, Helvetica, sans-serif; width:100%\">";
		strHead += "<tr>";
			strHead += "<td style=\"text-align: center; font-size: 16pt; border: 0px solid #000000\">";
			strHead += '<img src="' + imagenUrl + '" width="60%" height="60%"/>'; //image
			strHead += "</td>";
		strHead += "</tr>";
	strHead += "</table>";	

	var fecCom = (subsId != 22) ? 'FECHA COMPROMETIDA' : 'FECHA DE RECIBIDO';
	var fecComValor = (subsId != 22) ? fechcomp : partfech;
	var moneda = recPDF.getFieldText('currency');
	
	// Sub Titulo
	strHead += "<p></p>";	
	strHead += "<table style=\"font-family: Verdana, Arial, Helvetica, sans-serif; width:100%\">";
		strHead += "<tr>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"73mm\">";
			strHead += "<p>NUMERO DE RECEPCION</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"73mm\">";
			strHead += "<p>" + numeremi + "</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"46mm\">";
			strHead += "</td>";
		strHead += "</tr>";
		strHead += "<tr>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"73mm\">";
			strHead += "<p>PROVEEDOR</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"73mm\">";
			strHead += "<p>" + provnomb + "</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"46mm\">";
			strHead += "</td>";
		strHead += "</tr>";
		strHead += "<tr>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>NUM. ORDEN DE COMPRA / TRASLADO</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>" + numeorde + "</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "</td>";
		strHead += "</tr>";
		strHead += "<tr>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>" + fecCom + "</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>" + fecComValor + "</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "</td>";
		strHead += "</tr>";
		strHead += "<tr>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>ALMACEN ORIGEN</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>" + nombalmaorig + "</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "</td>";
		strHead += "</tr>";
		strHead += "<tr>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>ALMACEN DESTINO</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>" + nombalma + "</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "</td>";
		strHead += "</tr>";
		if (subsId == 22) 
		{
			strHead += "<tr>";
				strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
				strHead += "<p>MONEDA</p>";
				strHead += "</td>";
				strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
				strHead += "<p>" + moneda + "</p>";
				strHead += "</td>";
				strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
				strHead += "</td>";
			strHead += "</tr>";			
		}
		strHead += "<tr>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "<p>TIPO DE CAMBIO</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; color: red; border: 0px solid #000000\">";
			strHead += "<p>" + tipcamb + "</p>";
			strHead += "</td>";
			strHead += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\">";
			strHead += "</td>";
		strHead += "</tr>";
	strHead += "</table>";

	return strHead;
}

//-------------------------------------------------------------------------------------------------------	
// Detalle de Pagina
//-------------------------------------------------------------------------------------------------------
function detpagina() {

var strDeta = '';
	strDeta += "<p></p>";	
	
	// Detalle
	strDeta += "<table style=\"font-family: Verdana, Arial, Helvetica, sans-serif; width:100%\">";
		strDeta += "<tr>";
			strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"19mm\">";
			strDeta += "<p>CODIGO</p>";
			strDeta += "</td>";
			strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"63mm\">";
			strDeta += "<p>DESCRIPCION</p>";
			strDeta += "</td>";
			strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"19mm\">";
			strDeta += "<p>CANTIDAD</p>";
			strDeta += "</td>";
			strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"18mm\">";
			strDeta += "<p>UND.MED</p>";
			strDeta += "</td>";
			if (subsId == 22)
			{
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"20mm\">";
				strDeta += "<p>N° LOTE</p>";
				strDeta += "</td>";
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"30mm\">";
				strDeta += "<p>DEPOSITO-BIN</p>";
				strDeta += "</td>";
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"21mm\">";
				strDeta += "<p>N° LOTE PROVEEDOR</p>";
				strDeta += "</td>";				
			}
			else
			{
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"25mm\">";
				strDeta += "<p>N°.LOTE</p>";
				strDeta += "</td>";
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\" width=\"30mm\">";
				strDeta += "<p>DEPOSITO-BIN</p>";
				strDeta += "</td>";
			}
		strDeta += "</tr>";

	var filas = recPDF.getLineItemCount('item');
	var bindetails = '';
	
	for (var i = 0; i < filas; i++) 
	{
		var camposArticulo = ['custitem_familia_0', 'salesdescription', 'displayname'];
		var itemcode = recPDF.getLineItemValue('item', 'item', i+1);
		var	campos = nlapiLookupField( 'item', itemcode, camposArticulo );
		// 7 = Materia Prima
		var codigoArticulo = (campos.custitem_familia_0 == 7) ? campos.salesdescription : campos.displayname;
		var itemdescription = recPDF.getLineItemValue('item', 'itemdescription', i+1);
		if ( itemdescription=='' || itemdescription==null ) { itemdescription=''; }
		if(itemdescription!='' && itemdescription!=null)
		{itemdescription=itemdescription.replace('&', '&amp;');}
		var itemunit = recPDF.getLineItemValue('item', 'unitsdisplay', i+1);
		if ( itemunit=='' || itemunit==null ) { itemunit=''; }
		var itemlote = recPDF.getLineItemValue('item', 'custcol_notas_recepcion', i+1);
		if ( itemlote=='' || itemlote==null) { itemlote = ''; }
		var subRecordDet = recPDF.viewLineItemSubrecord('item', 'inventorydetail', i+1);
		
		if(subRecordDet != null)
		{
			var idbindetail = subRecordDet.getLineItemValue('inventoryassignment', 'binnumber', 1);
						
			if (idbindetail !='' && idbindetail != null) 
			{
				bindetails = nlapiLookupField('bin', idbindetail, 'binnumber'); 
			} 
			else 
			{ 
				var bindetail = ''; 
			}
			
			var subrecTotal = 0;
			subrecTotal = subRecordDet.getLineItemCount('inventoryassignment');
			var subRecSerie = '', subRecCant = ''; 

			// Brasil
			var loteInventario = '', binInventario = '';

			for (var x = 1; x <= subrecTotal; x++) 
			{
				subRecordDet.selectLineItem('inventoryassignment', x);
				subRecSerie += subRecordDet.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber') + '<br/>';
				subRecCant += subRecordDet.getCurrentLineItemValue('inventoryassignment', 'quantity') + '<br/>';
				//loteInventario += subRecordDet.getCurrentLineItemText('inventoryassignment', 'issueinventorynumber') + '<br/>';
				binInventario += subRecordDet.getCurrentLineItemText('inventoryassignment', 'binnumber') + '<br/>';
			}

            var assignmentCount = subRecordDet.getLineItemCount('inventoryassignment');
            for (var j = 1; j <= assignmentCount; j++) {
                var quantity = subRecordDet.getLineItemValue('inventoryassignment', 'quantity', j);
                var binNumber = subRecordDet.getLineItemValue('inventoryassignment', 'binnumber', j);
                loteInventario = subRecordDet.getLineItemValue('inventoryassignment', 'issueinventorynumber', j);
            }

		}

		var quantityItem = (subrecTotal > 1) ? subRecCant : recPDF.getLineItemValue('item', 'quantity', i + 1);
		
		strDeta += "<tr>";
			strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
			strDeta += "<p>" + codigoArticulo + "</p>";
			strDeta += "</td>";
			strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
			strDeta += "<p>" + itemdescription + "</p>";
			strDeta += "</td>";
			strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
			strDeta += "<p>" + quantityItem + "</p>";
			strDeta += "</td>";
			strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
			strDeta += "<p>" + itemunit + "</p>";
			strDeta += "</td>";
			if (subsId == 22)
			{
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
				strDeta += "<p>" + subRecSerie + "</p>";
				strDeta += "</td>";
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
				strDeta += "<p>" + bindetails + "</p>";
				strDeta += "</td>";
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
				strDeta += "<p>" + itemlote + "</p>";
				strDeta += "</td>";
			}
			else
			{
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
				strDeta += "<p>" + subRecSerie + "</p>";
				strDeta += "</td>";
				strDeta += "<td style=\"text-align: center; font-size: 8pt; border: 1px solid #000000\">";
				strDeta += "<p>" + binInventario + "</p>";
				strDeta += "</td>";			
			}
		strDeta += "</tr>";
		
	}	
	strDeta += "</table>";

	return strDeta;
}

//-------------------------------------------------------------------------------------------------------	
//Pie de Pagina
//-------------------------------------------------------------------------------------------------------
function piepagina(){
var strNpie = '';
	strNpie += "<p></p>"
	//  ---------- Pie de Pagina ----------
	strNpie += "<table style=\"font-family: Verdana, Arial, Helvetica, sans-serif; width:100%\">";
		//	Notas
		strNpie += "<tr>";
			strNpie += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"30%\">";
			strNpie += "<p></p>"
			strNpie += "<p>OBSERVACIONES</p>"
			strNpie += "<p></p>"
			strNpie += "</td>";
			strNpie += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" colspan=\"2\">";
			strNpie += "<p></p>"
			strNpie += "<p>" + partnota + "</p>";
			strNpie += "<p></p>"
			strNpie += "</td>";
		strNpie += "</tr>";
		if (subsId != 22) 
		{
				//Fecha
				strNpie += "<tr>";
				strNpie += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"30%\">";
				strNpie += "<p></p>"
				strNpie += "<p>FECHA DE RECIBIDO</p>"
				strNpie += "<p></p>"
				strNpie += "</td>";
				strNpie += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" colspan=\"2\">";
				strNpie += "<p></p>"
				strNpie += "<p>" + partfech + "</p>";
				strNpie += "<p></p>"
				strNpie += "</td>";
			strNpie += "</tr>";	
		}
		//	Autorizacion
		strNpie += "<tr>";
			strNpie += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"30%\">";
			strNpie += "<p></p>"
			strNpie += "<p></p>"
			strNpie += "<p>____________________</p>"
			strNpie += "RECIBIO"
			strNpie += "</td>";
			strNpie += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"40%\">";
			strNpie += "<p></p>"
			strNpie += "<p></p>"
			strNpie += "<p>____________________</p>"
			strNpie += "ENTREGO"
			strNpie += "</td>";
			strNpie += "<td style=\"text-align: center; font-size: 8pt; border: 0px solid #000000\" width=\"30%\">";
			strNpie += "<p></p>"
			strNpie += "<p></p>"
			strNpie += "<p>____________________</p>"
			strNpie += "AUTORIZO"
			strNpie += "</td>";
		strNpie += "</tr>";
	strNpie += "</table>";
			
	return strNpie;
}

/* ****************************************
 * Envio de mail al usuario en caso de 
 * ocurrir un error.
 * ****************************************/
function sendemail(swerrormg)
{
	var userid = nlapiGetUser();
	var userfn = [ 'email', 'firstname' ];
	var employ = nlapiLookupField('employee', userid, userfn);
	var empema = employ.email;
	var empfir = employ.firstname;

	// Envio de email
	var subject = 'NetSuite - NCH: ';
	var bcc = new Array();
	var cco = new Array();
		cco[0] = 'customer.care@1oss.net';
	var body = '<p>Saludos!</p>';
		body += '<p>Estimado(a) ' + empfir + ':</p>';
		body += '<p>Contactese con el administrador.<p>';
		body += '<p>La siguiente informacion es para el administrador del sistema:</p>';
		body += '<p>El error generado es el siguiente: </p><strong>' + swerrormg + '</strong>';
		body += '<ul>';
		body += '<li> InternalID del rol del usuario: [' + nlapiGetRole() + '].</li>';
		body += '<li> El nombre del script......: [OSSParteIngresoSTLT.js].</li>'; 
		body += '</ul>';
		body += '<br>';
		body += '<p>Atentamente,</p>';
		body += '<br>';
		body += '<p>El personal de NCH</p>';
		body += '<br>';
		body += '<p><strong>***NO RESPONDA A ESTE MENSAJE***</strong></p>';

	// Api de Netsuite para enviar correo electronico
	nlapiSendEmail(userid, empema, subject, body, bcc, cco, null, null);
   
    return true;
}