/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : jamrules.js
 *  
 *
 * -----------------------------------------------------------------------------------------
 * Modifications :
 * - 20170227  - E.Podvin - V1.0.0 - Creation
 * 
 * -----------------------------------------------------------------------------------------
 *
 * @copyright Intersel 2017
 * @fileoverview : 
 * @see {@link https://github.com/intersel/jamrules}
 * @author : Emmanuel Podvin - emmanuel.podvin@intersel.fr
 * @version : 1.0.0
 * -----------------------------------------------------------------------------------------
 */

/**
 * How to use it :
 * ===============
 *
 * see README.md content or consult it on https://github.com/intersel/jamrules
 */
function jamrules(aJqueryObj) {
 
    // variables and functions private unless attached to API below
    // 'this' refers to global window
 
    // private array
    var arrayProperties = [];
    var myRulesEngineStates = {
            DefaultState        :
            {
            	propertyChange   :   
    	        {
                    init_function: function(data,aEvent,dataFromCheckbox){
                    }
    	        }
            }
    };
    var myRulesEngineStates = aJqueryObj.iFSM(myRulesEngineStates);

 
	/**
	 * 
	 */
    function setProperty(aPropertyName,aProperyValue,aStatus) {
    	log("setProperty(aPropertyName,aProperyValue,aStatus):"+aPropertyName+','+aProperyValue+','+aStatus);
    	var statusChanged = true;
    	if (arrayProperties[aPropertyName] && arrayProperties[aPropertyName][aPropertyValue] && arrayProperties[aPropertyName][aPropertyValue] == initialStatus)
    		statusChanged=false;
    	
    	arrayProperties[aPropertyName][aPropertyValue]=aStatus;
		if (statusChanged) myRulesEngine.trigger('propertyChange',{propertyName:aPropertyName,propertyValue:aPropertyValue,status:aStatus});

    }
    
    
 
	/**
	 * 
	 */
    function addRule(aRule) {
    }

	/**
	 * {
	 * 		propertySet:
	 * 		{	
	 * 			propertyName.propertyValue:true|false
	 * 		}
	 * 		matched:function called when a rule will match for the element
	 * 		notmatched:function called when there is a change but element does not match any rules
	 * }
	 */
    function addElement(aElement) {
    }

    
	/**
	 * boolean return true if the properties set is compliant with the property configuration and the defined rules
	 */
    function matchObject(aPropertiesSet) {
    }

    /**
     * a private debug function
	 * 
	 */
    function log(msg) {
        console.debug(msg);
    }
 
    return {
    		addProperty: addProperty
        , 	propertyStatusChange: propertyStatusChange
    };
};
