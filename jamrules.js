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
function jamrules() {
 
    // variables and functions private unless attached to API below
    // 'this' refers to global window
 
    // private array
    var array = [];
 
	/**
	 * 
	 */
    function addProperty(aPropertyName,aProperyValue,initialStatus) {
    	log("property name:"+aPropertyName);
    }
 
	/**
	 * 
	 */
    function addRule(aRule) {
    }

    /**
	 * 
	 */
    function propertyStatusChange(aPropertyName,aPropertyValue,aStatus) {
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
