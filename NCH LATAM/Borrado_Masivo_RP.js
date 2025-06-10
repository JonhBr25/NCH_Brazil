function DeleteRecord(recordType, recordId)
{
    try
    {
        nlapiDeleteRecord(recordType, recordId);
    }
    catch(error)
    {
    	if(error instanceof nlobjError)
        {
      	    var errorCode 	 = returnBlank(error.getCode());
    	    var errorDetails 	 = returnBlank(error.getDetails());
    	    var errorID 	 = returnBlank(error.getId());
    	    var errorInternalID	 = returnBlank(error.getInternalId());
    	    var errorStackTrace	 = returnBlank(error.getStackTrace());
    	    if(errorStackTrace != '')
    	    {
    		errorStackTrace	 = errorStackTrace.join();
    	    }
    	    var errorUserEvent 	 = returnBlank(error.getUserEvent());
            nlapiLogExecution( 'ERROR', 'Error Code',errorCode);
            nlapiLogExecution( 'ERROR', 'Error Details',errorDetails);
            nlapiLogExecution( 'ERROR', 'Error ID',errorID);
            nlapiLogExecution( 'ERROR', 'Error Internal ID',errorInternalID);
            nlapiLogExecution( 'ERROR', 'Error StackTrace',errorStackTrace);
            nlapiLogExecution( 'ERROR', 'Error UserEvent',errorUserEvent);
        }
        else
        {
            var errorString	 = returnBlank(error.toString());
            nlapiLogExecution( 'ERROR', 'Unexpected Error',errorString);
        }
    }
}