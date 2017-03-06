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
 
	/**
	 * private propertiesConfiguration
	 * 	a configuration set of the properties defines by an array of [aPropertyName][aPropertyValue] = status (1|0)
	 * 		{	
	 * 			<propertyName1>:{
	 * 				type:<discreteValuesList>,
	 * 				<propertyValue1>:1|0,
	 * 				<propertyValue2>:1|0,
	 * 				...
	 * 			},
	 * 			<propertyName2>:{
	 * 				type:<intervalValues>, //not implemented
	 * 				min:<aValue>,
	 * 				max:<aValue>,
	 * 				interval:'<external|internal>'
	 * 				...
	 * 			},
	 * 			<propertyName3>:{
	 * 				type:<supIntervalValues>, //not implemented
	 * 				min:<aValue>,
	 * 				...
	 * 			},
	 * 			<propertyName4>:{
	 * 				type:<infIntervalValues>, //not implemented
	 * 				max:<aValue>,
	 * 				...
	 * 			},
	 * 			....
	 * 		}
	 *  it is used to test against element profiles to identify the element profiles that match or not to this configuration
	 */
    var propertiesConfiguration = {};

    /**
     * private ElementProfiles
     * 	list of possible profiles
     * 	a profile is defined by a list of entries [objectKey]:{propertiesSet:<apropertiesSet>,elementsList:[]}
     * {
	 * 		<objectKey1>:{
	 * 			propertiesSet:
	 * 			{	
	 * 				<propertyName1>:{
	 * 					type:<discreteValuesList>,
	 * 					<propertyValue1>:1|0,
	 * 					<propertyValue2>:1|0,
	 * 					...
	 * 				},
	 * 				... same as propertiesConfiguration definition
	 * 				<propertyName1>.<propertyValue1>:1|0,
	 * 				<propertyName2>.<propertyValue2>:1|0
	 * 				....
	 * 			],
	 * 			elementList:[ //element objects that share the same properties set
	 * 			]
	 * 		},
	 * 		<objectKey2>:{
	 *  	....
	 *  }
     */
    var ElementProfiles = {};
    
    var matchRuleTemplate = 
    {
		ruleMatch:
		{
			propagate_event:'testMatch'
		},
		ruleDontMatch:
		{
			propagate_event:'testMatch'
		},
		DefaultState:
		{
			eventExemple:
			{
		 		next_state_when: 'MatchPropertyName("priority")',
		 		next_state:'ruleMatch',
		 		propagate_event: 'ruleDontMatch',
				
			},
			ruleDontMatch:
			{
				next_state:'ruleDontMatch'
			}
		}
 	};
    
    /**
     * private
     * 	myRulesEngineStates - states definition that handles the rule testing process 
     */
    var myRulesEngineStates = {
            TestRules:
            {
    		 	delegate_machines: 
    		 	{
    		 		Priority1Match:{
    		 			
    		 			ruleMatch:
    		 			{
    		 				propagate_event:'testMatch'
    		 			},
    		 			ruleDontMatch:
    		 			{
    		 				propagate_event:'testMatch'
    		 			},
    		 			DefaultState:
    		 			{
    		 				priority:
    		 				{
    		 			 		next_state_when: 'MatchPropertyName("priority")',
    		 			 		next_state:'ruleMatch',
    		 			 		propagate_event: 'ruleDontMatch',
    		 					
    		 				},
    		 				ruleDontMatch:
    		 				{
    		 					next_state:'ruleDontMatch'
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
    		 				Priority1Match: 
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
                    propagate_event:'updateElementsMatch',
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
                    propagate_event:'updateElementsDontMatch',
                    next_state:'updateElements',
    		 		
    		 	},
            	
            },
            updateElements:
            {
            	updateElementsMatch:
                {
                    init_function: function(){
	                	if (this.opts.elementProfile.elementList[0].matched)
                    	for(aElement in this.opts.elementProfile) 
                    	{
                    		aElement.matched();
                    	}

                    	this.opts.elementProfileId++;
                    },
	            	propagate_event:'testRules',
	                next_state:'waitTestRule',
                },
	        	updateElementsDontMatch:
	            {
	                init_function: function(){
	                	if (this.opts.elementProfile.elementList[0].notmatched)
	                	for(aElement in this.opts.elementProfile) 
	                	{
	                		aElement.notmatched();
	                	}
	
	                	this.opts.elementProfileId++;
	                },
	            	propagate_event:'testRules',
	                next_state:'waitTestRule',
	            }

            },
            waitTestRules:
            {
            	/*
            	 * internal event - starts the process to test the rules against the current configuration and the different element profiles
            	 * event should send a 'dataFromCheckbox' data object as:
            	 * {propertyName:<aPropertyName>,propertyValue:<aPropertyValue>,status:<aStatus>}
            	 */
    	        testRules:
    	        {
                    init_function: function(data,aEvent,dataFromCheckbox){
                    	this.opts.elementProfileId++;
                		this.opts.elementProfile=ElementProfiles[Object.keys(ElementProfiles)[this.opts.elementProfileId]];
                		this.trigger(dataFromCheckbox.propertyName,dataFromCheckbox);
                    },
                    next_state_when:"this.opts.elementProfileId  < this.opts.maxElementProfiles",
            		next_state:'TestRules',
                    
    	        },
            	/*
            	 * event to emit when a property changed in the configuration
            	 * Initializes the rule engine for testing the rules against the current configuration and the different element profiles
            	 * 
            	 * event should send a 'dataFromCheckbox' data object as:
            	 * {propertyName:<aPropertyName>,propertyValue:<aPropertyValue>,status:<aStatus>}
            	 */
	        	propertyChange:   
		        {
	                init_function: function(data,aEvent,dataFromCheckbox){
	                	this.opts.elementProfileId=-1;
	                	this.opts.maxElementProfiles = Object.keys(ElementProfiles).length;
	                	if (this.opts.maxElementProfiles > 0) this.trigger('testRules',dataFromCheckbox);
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
    
    /**
     * private myRulesEngine - iFSM Engine
     */
    var myRulesEngine = aJqueryObj.iFSM(myRulesEngineStates);

    
    /**
     * Testing functions available for the rules
     * 	this = the iFSM engine
     */
    /**
     * returns true if the property is set in the profile element and in the property set
     */
    function MatchPropertyName(aPropertyName)
    {
    	return (propertiesConfiguration[aPropertyName] && this.opts.elementProfile[aPropertyName]);
    }
    function MatchProperty(aPropertyName,aPropertyValue)
    {
    	return (
    			(propertiesConfiguration[aPropertyName] && this.opts.elementProfile[aPropertyName])
    			&& (propertiesConfiguration[aPropertyName][aPropertyValue] && this.opts.elementProfile[aPropertyName][aPropertyValue])
    			&& (propertiesConfiguration[aPropertyName][aPropertyValue] == this.opts.elementProfile[aPropertyName][aPropertyValue])
    			);
    }

    
    /**
	 * public function setProperty
	 * - aPropertyName: name of the property that has changed
	 * - aProperyValue: value of the property
	 * - aStatus: 
	 */
    function setProperty(aPropertyName,aPropertyValue,aStatus) {
    	log("setProperty(aPropertyName,aPropertyValue,aStatus):"+aPropertyName+','+aPropertyValue+','+aStatus);
    	var statusChanged = true;
    	if (	propertiesConfiguration[aPropertyName] 
    		&& 	propertiesConfiguration[aPropertyName][aPropertyValue] 
    		&& 	propertiesConfiguration[aPropertyName][aPropertyValue] == aStatus
    		)
    		statusChanged=false;
    	
    	if (!propertiesConfiguration[aPropertyName]) propertiesConfiguration[aPropertyName]={};
    	
    	propertiesConfiguration[aPropertyName][aPropertyValue]=aStatus;
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
    function addRule(aRuleName, aRuleEvent,aRuleTest,aRuleAction) {
    	if (!myRulesEngineStates.TestRules.delegate_machines[aRuleName])
    		myRulesEngineStates.TestRules.delegate_machines[aRuleName]=$.extend(true, {}, matchRuleTemplate);
    	
    	myRulesEngineStates.TestRules.delegate_machines[aRuleName]['DefaultState'][aRuleEvent]={
			 		next_state_when: aRuleTest,
 			 		next_state:'ruleMatch',
 			 		propagate_event: 'ruleDontMatch',
    	};
    	myRulesEngineStates.TestRules.testMatch.next_state_on_target.submachines[aRuleName]={
    			target_list: ['ruleDontMatch']
    	};
    }

	/**
	 * addElement - add an element to the list of elements to test against rules
	 * 
	 * aElement: object
	 * {
	 * 		propertiesSet:
	 * 		[	
	 * 			<propertyName1>.<propertyValue1>:true|false,
	 * 			<propertyName2>.<propertyValue2>:true|false
	 * 			....
	 * 		]
	 * 		matched:<function name to call when a rule will match for the element>
	 * 		notmatched:<function name to call when there is a change but element does not match any rules>
	 * }
	 */
    function addElement(aElement) {
    	objectKey = getElementProfileKey(aElement);
    	addElementProfile(objectKey,aElement);
    	addElementToElementProfilesArray(objectKey,aElement);
    }

    
	/**
	 * boolean return true if the properties set is compliant with the property configuration and the defined rules
	 */
    function matchObject(aPropertiesSet) {
    }

    
    /**
     * private function
     * get the key to access to the element profile of an element
	 * 
	 */
    function getElementProfileKey(aElement)
    {
    	return $.md5(JSON.stringify(aElement.propertiesSet));
    }
    /**
     * private function
     * add a new element profile if the one defines by aElement does not exist
	 * 
	 */
    function addElementProfile(objectKey,aElement)
    {
    	if (!ElementProfiles[objectKey]) ElementProfiles[objectKey]={propertiesSet:aElement.propertiesSet,elementsList:[]};
    }
    /**
     * private function
     * add a new element to the element profiles array
	 * 
	 */
    function addElementToElementProfilesArray(objectKey,aElement)
    {
    	ElementProfiles[objectKey]['elementList'].push(aElement);
    }
    
    /**
     * a private debug function
	 * 
	 */
    function log(msg) {
        console.debug(msg);
    }
 
    aRetObject = {
    		setProperty: setProperty
        	,	addElement:addElement
        	,	addRule:addRule
        }; 
    return (aRetObject);
};
