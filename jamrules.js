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
    var arrayElementProfiles = [];
    var myRulesEngineStates = {
            TestRules:
            {
    		 	delegate_machines: 
    		 	{
    		 		Priority1Match:{
    		 			
    		 			ruleMatch:
    		 			{
    		 				
    		 			},
    		 			ruleDontMatch:
    		 			{
    		 				
    		 			},
    		 			DefaultState:
    		 			{
    		 				priority:
    		 				{
    		 			 		next_state_when: 'Match("priority")',
    		 			 		next_state:'ruleMatch',
    		 			 		next_state_if_error: 'ruleDontMatch',
    		 					
    		 				}
    		 			}
    		 		},
    		 	},	  	
    			testMatch:
    		 	{
    		 		next_state_on_target: 
    		 		{
    		 			condition 			: '&&',
    		 			submachines			: 
    		 			{
    		 				Priority1: 
    		 				{
    							target_list: ['ruleDontMatch'],
    		 				},
    		 				Rule2:
    		 				{
     							target_list: ['ruleDontMatch'],
    		 				}
    			 		}
    		 		},
    		 		next_state:'ruleDontMatch',
    				propagate_event:'testMatchResult'
    		 	},
    		 	testMatchResult:
    		 	{
                    init_function: function(data,aEvent,dataFromCheckbox){
                    	alert("match");
                    },
                    propagate_event:'updateElements',
                    next_state:'updateElements',
    		 		
    		 	},
            	
            },
            ruleDontMatch:
            {
    		 	testMatchResult:
    		 	{
                    init_function: function(data,aEvent,dataFromCheckbox){
                    	alert("dont  match");
                    },
                    propagate_event:'testRules',
                    next_state:'waitTestRules',
    		 		
    		 	},
            	
            },
            updateElements:
            {
                updateElements:
                {
                	propagate_event:'testRules',
                    next_state:'waitTestRule',
                    init_function: function(){
                    	this.opts.elementProfileId++;
                    }
                }

            },
            waitTestRules:
            {
    	        testRules:
    	        {
                    init_function: function(data,aEvent,dataFromCheckbox){
                    	this.opts.elementProfileId++;
                		this.opts.elementProfile=Object.keys(arrayElementProfiles)[this.opts.elementProfileId];
                		this.trigger(dataFromCheckbox.propertyName,dataFromCheckbox);
                    },
                    next_state_when:"this.opts.elementProfileId  <this.opts.maxElementProfiles",
            		next_state:'TestRules',
                    
    	        },
	        	propertyChange:   
		        {
	                init_function: function(data,aEvent,dataFromCheckbox){
	                	this.opts.elementProfileId=-1;
	                	this.opts.maxElementProfiles = Object.keys(arrayElementProfiles)[this.opts.elementProfileId].length;
	                	this.trigger('testRules',dataFromCheckbox);
	                },
		        },
            },
    		DefaultState:
            {
    		 	start: //a default start event received at the FSM start
    		 	{
                    next_state:"waitTestRules"
    		 	},
            }
    };
    var myRulesEngine = aJqueryObj.iFSM(myRulesEngineStates);

    
    /**
     * 
     */
    function Match()
    {
    	Match("priority",currentProfileToTest);
    }
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
	 * aRulesSetName: name of a rules set
	 * aRuleName: a rule to define in the rules set
	 * aRuleEvent: event to hear to test the rule
	 * aRuleTest: a boolean test
	 * aRuleAction: an action name to call on the elements that match the rule
	 * 
	 */
    function addRule(aRulesSetName,aRuleName, aRuleEvent,aRuleTest,aRuleAction) {
    	if (!myRulesEngineStates[aRulesSetName])
    		myRulesEngineStates[aRulesSetName]={};
    	
    	if (!myRulesEngineStates.aRuleName[aRuleEvent]) myRulesEngineStates.aRuleName[aRuleEvent]={
    			
    	};
    }

	/**
	 * addElement - add an element to the list of elements to test against rules
	 * {
	 * 		propertiesSet:
	 * 		{	
	 * 			propertyName .propertyValue:true|false
	 * 		}
	 * 		matched:function called when a rule will match for the element
	 * 		notmatched:function called when there is a change but element does not match any rules
	 * }
	 */
    function addElement(aElement) {
    	objectKey = $.md5(JSON.stringify(aElement.propertiesSet));
    	if (!arrayElementProfiles[objectKey]) arrayElementProfiles[objectKey]={propertiesSet:aElement.propertiesSet,elementsList:[]};
    	arrayElementProfiles[objectKey][elementList].push(aElement);
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
    	,	addElement::addElement
    	,	addRule:addRule
        , 	propertyStatusChange: propertyStatusChange
    };
};
