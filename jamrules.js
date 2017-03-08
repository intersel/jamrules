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
	 * @param jamrules - the current jamrules object giving access to its API
     * @access public
     */
	var jamrules;
	
	/**
	 * @param myRulesEngine - the FSM engine bound to the jamrules
	 * @access private 
	 */
	var myRulesEngine;
	
	/**
	 * @param propertiesConfiguration
	 * @access private 
	 * @abstract a configuration set of the properties defines by an array of [aPropertyName][aPropertyValue] = status (1|0)
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
     * @param ElementProfiles
     * @access private 
     * @abstract list of possible profiles
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
    
    /**
     * @param matchRuleTemplate
     * @abstract template to create new rule in the state definition of the rules engine
     */
    var matchRuleTemplate = 
    {
		submachine:
		{
				startTesting:
	 			{
	 				enterState:
	 				{
	 			 		next_state:'ruleMatch', //default state that will end the process
	 				},
	 			},
	 			ruleMatch:
	 			{
	 				enterState:
	 				{
	 					propagate_event:'testRuleDone'
	 				},
	 			},
	 			ruleDontMatch:
	 			{
	 				enterState:
	 				{
		 				propagate_event:'testRuleDone'
	 				}
	 			},
	 			DefaultState:
	 			{
	 				startEventExample:
 					{
	 					next_state:'startTesting',
 					},
	 				ruleDontMatch:
 					{
	 					next_state:'ruleDontMatch',
 					}
	 			}
		},
 	};
    
    /**
     * @param stateRuleTemplate
     * @access private
     * @abstract
     */
    var stateRuleTemplate =
    {
		enterState:
		{
	 		process_event_if: 'this.opts.jamrules.aMatchingTest()',
	 		propagate_event_on_refused:'ruleDontMatch',
	 		next_state:'testPriorityExist',
	 		prevent_bubble:true
		}
    }
    
    /**
     * @param myRulesEngineStates
     * @access private
     * @abstract states definition of the rule engine that handles the rule testing process 
     */
    var myRulesEngineStates = {
            TestRules:
            {
            	enterState:
            	{
                    init_function: function(){
                    },
            	},
    		 	delegate_machines: 
    		 	{
    		 		/***
    		 		 * submachine for testing
    		 		 /**/
    		 		/**/
    		 		PriorityTestMatch1:
    		 		{
    		 			submachine:
    		 			{
        		 			
    		 				startTesting:
        		 			{
        		 				enterState:
        		 				{
        		 			 		next_state:'testDisplayAll',
        		 				},
        		 			},
    		 				testDisplayAll:
        		 			{
        		 				enterState:
        		 				{
        		 			 		process_event_if: 'this.opts.jamrules.ConfigurationPropertySet("activities","all")',
        		 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		next_state:'testPriorityExist',
        		 			 		prevent_bubble:true
        		 				},
        		 			},
        		 			testPriorityExist:
				 			{
				 				enterState:
				 				{
				 			 		process_event_if: 'this.opts.jamrules.MatchProperty("priority")',
				 			 		propagate_event_on_refused:'ruleDontMatch',
				 			 		next_state:'testPriorityValue',
        		 			 		prevent_bubble:true
				 				},
				 			},
				 			testPriorityValue:
        		 			{
        		 				enterState:
        		 				{
        		 			 		process_event_if: 'this.opts.jamrules.MatchPropertyValue("priority")',
        		 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		next_state:'ruleMatch',
        		 			 		prevent_bubble:true
        		 				},
        		 			},
        		 			ruleMatch:
        		 			{
        		 				enterState:
        		 				{
        		 					propagate_event:'testRuleDone'
        		 				},
        		 			},
        		 			ruleDontMatch:
        		 			{
        		 				enterState:
        		 				{
            		 				propagate_event:'testRuleDone'
        		 				}
        		 			},
        		 			DefaultState:
        		 			{
        		 				startEventExample:
    		 					{
        		 					next_state:'startTesting',
    		 					},
        		 				ruleDontMatch:
    		 					{
        		 					next_state:'ruleDontMatch',
    		 					}
        		 			}
    		 				
    		 			},
    		 		},
    		 		/**/
    		 		PriorityTestMatch2:
    		 		{
    		 			submachine:
    		 			{
        		 			
    		 				startTesting:
        		 			{
        		 				enterState:
        		 				{
        		 			 		//next_state:'ruleMatch', //default state that will end the process
        		 			 		next_state:'testDisplayAll',
        		 				},
        		 			},
    		 				testDisplayAll:
        		 			{
        		 				enterState:
        		 				{
        		 			 		process_event_if: 'this.opts.jamrules.ConfigurationPropertySet("activities","compliant")',
        		 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		next_state:'testPriorityExist',
        		 			 		prevent_bubble:true
        		 				},
        		 			},
        		 			testPriorityExist:
				 			{
				 				enterState:
				 				{
				 			 		process_event_if: 'this.opts.jamrules.MatchProperty("priority")',
				 			 		propagate_event_on_refused:'ruleDontMatch',
				 			 		next_state:'testPriorityValue',
        		 			 		prevent_bubble:true
				 				},
				 			},
				 			testPriorityValue:
        		 			{
        		 				enterState:
        		 				{
        		 			 		process_event_if: 'this.opts.jamrules.MatchPropertyValue("priority")',
        		 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		next_state:'technicianCompliant',
        		 			 		prevent_bubble:true
        		 				},
        		 			},
        		 			technicianCompliant:
        		 			{
        		 				enterState:
        		 				{
        		 			 		process_event_if: 'this.opts.jamrules.MatchPropertiesValue("compliantTechnician","technician")',
        		 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		next_state:'ruleMatch',
        		 			 		prevent_bubble:true
        		 				},
        		 			},
        		 			ruleMatch:
        		 			{
        		 				enterState:
        		 				{
        		 					propagate_event:'testRuleDone'
        		 				},
        		 			},
        		 			ruleDontMatch:
        		 			{
        		 				enterState:
        		 				{
            		 				propagate_event:'testRuleDone'
        		 				}
        		 			},
        		 			DefaultState:
        		 			{
        		 				startEventExample:
    		 					{
        		 					next_state:'startTesting',
    		 					},
        		 				ruleDontMatch:
    		 					{
        		 					next_state:'ruleDontMatch',
    		 					}
        		 			}
    		 				
    		 			},
    		 		},
    		 	},	  
    		 	/**
    		 	 * Events of TestRules
    		 	 */
    		 	testRuleDone:
    		 	{
                    init_function: function(){
                    },
    		 		next_state_on_target: 
    		 		{
    		 			condition 			: '||',
    		 			submachines			: 
    		 			{
    		 				/**/
    		 				PriorityTestMatch1: 
    		 				{
    							target_list: ['ruleMatch'],
    		 				},
    		 				PriorityTestMatch2: 
    		 				{
    							target_list: ['ruleMatch'],
    		 				},
    		 				/**/
    			 		}
    		 		},
    		 		next_state:'ruleMatch',
    				propagate_event:'giveMatchResult'
    		 	},
    		 	giveMatchResult:
    		 	{
                    init_function: function(data,aEvent,dataFromCheckbox){
                    	alert("dont match");
                    },
                    propagate_event:'updateElementsDontMatch',
                    next_state:'updateElements',
    		 		
    		 	},
            	
            },
            /**
             * State ruleDontMatch
             */
            ruleMatch:
            {
            	giveMatchResult:
    		 	{
                    init_function: function(data,aEvent,dataFromCheckbox){
                    	alert("match");
                    },
                    propagate_event:'updateElementsMatch',
                    next_state:'updateElements',
    		 		
    		 	},
            	
            },
            /**
             * State updateElements
             */
            updateElements:
            {
            	updateElementsMatch:
                {
                    init_function: function(){
	                	if (this.opts.elementProfile.elementsList[0].matched)
                    	for(aElement in this.opts.elementProfile) 
                    	{
                    		aElement.matched();
                    	}

                    	this.opts.elementProfileId++;
                    },
	            	propagate_event:'testRules',
	                next_state:'waitTestRules',
                },
	        	updateElementsDontMatch:
	            {
	                init_function: function(){
	                	if (this.opts.elementProfile.elementsList[0].notmatched)
	                	for(aElement in this.opts.elementProfile) 
	                	{
	                		aElement.notmatched();
	                	}
	
	                	this.opts.elementProfileId++;
	                },
	            	propagate_event:'testRules',
	                next_state:'waitTestRules',
	            }

            },
            /**
             * State waitTestRules
             */
            waitTestRules:
            {
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
	                	this.opts.dataFromCheckbox=dataFromCheckbox;
	                	this.opts.maxElementProfiles = Object.keys(ElementProfiles).length;
	                	if (this.opts.maxElementProfiles > 0) this.trigger('testRules');
	                },
		        },
            	/*
            	 * internal event - starts the process to test the rules against the current configuration and the different element profiles
            	 * event should send a 'dataFromCheckbox' data object as:
            	 * {propertyName:<aPropertyName>,propertyValue:<aPropertyValue>,status:<aStatus>}
            	 */
    	        testRules:
    	        {
                    next_state_when:"this.opts.elementProfileId  < this.opts.maxElementProfiles",
            		next_state:'TestRules',
            		out_function: function(data,aEvent){
            			if (this.opts.elementProfileId  < this.opts.maxElementProfiles)
            			{
                        	this.opts.elementProfileId++;
                    		this.opts.elementProfile=ElementProfiles[Object.keys(ElementProfiles)[this.opts.elementProfileId]];
                    		this.trigger(this.opts.dataFromCheckbox.propertyName);
            			}
            		}
                    
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
     * Testing functions available for the rules
     */
    
    /**
     * @function MatchProperty
	 * @access public 
     * @abstract matching rule function, tests if at least a property value of a property is shared between the configuration and the element  
     * @param aPropertyName: a property name
     * 
     * @return returns true if any property value for a given aPropertyName is set in the profile element and in the configuration property set
     * @example
     *  element.priority.priority1=1
     *  element.technician.technician1=1
     *  configuration.priority.priority1=1
     *  configuration.priority.priority2=0
     *  configuration.technician.technician1=0
     *  configuration.technician.technician2=1
     *  MatchProperty('priority') -> match
     *  MatchProperty('technician') -> no match
     */
    function MatchProperty(aPropertyName)
    {
    	propertiesElementProfile = myRulesEngine.opts.elementProfile.propertiesSet;
    	
    	if (propertiesConfiguration[aPropertyName] && propertiesElementProfile[aPropertyName])
    	{
    		for(aPropertyValue in propertiesElementProfile[aPropertyName]) 
    		{
    			if (
    					(propertiesConfiguration[aPropertyName][aPropertyValue])
    				&&	(propertiesElementProfile[aPropertyName][aPropertyValue])
//    				&& 	(propertiesElementProfile[aPropertyName][aPropertyValue] == propertiesConfiguration[aPropertyName][aPropertyValue])
    				)
    				return true;
    		}
    	}
    	return false;
    }
    
    /**
     * @function MatchPropertyValue
	 * @access public 
     * @abstract matching rule function, tests if a given property value is set for configuration and the element   
     * @param aPropertyName: a property name
     * @param aPropertyValue: a value of aPropertyName 
     *  
     * @return returns true if the configuration for the aPropertyName.aPropertyValue == the one defined for the current elementProfile being tested
     * @example
     * element.priority.priority1=1
     * element.technician.technician1=1
     * configuration.priority.priority1=1
     * configuration.technician.technician1=0
     * MatchPropertyValue('priority','priority1') -> match
     * MatchPropertyValue('technician','technician1') -> no match
     */
    function MatchPropertyValue(aPropertyName,aPropertyValue)
    {
    	var propertiesElementProfile = myRulesEngine.opts.elementProfile.propertiesSet;
    	if (
    			(propertiesConfiguration[aPropertyName] && propertiesElementProfile[aPropertyName])
    			&& (propertiesConfiguration[aPropertyName][aPropertyValue] && propertiesElementProfile[aPropertyName][aPropertyValue])
//    			&& (propertiesConfiguration[aPropertyName][aPropertyValue] == propertiesElementProfile[aPropertyName][aPropertyValue])
    			)
    		return true;
    	else return false;
    }
    
    /**
     * @function public MatchPropertiesValue
     * @abstract matching rule function, tests if a property value exists and is the same between a configurator property and the element property
     * @param aConfigurationPropertyName: a configuration property name
     * @param aElementPropertyName: a element property Name 
     * @param aPropertyValue: a value that should match
     *   
     * @return returns true if aPropertyValue in aConfigurationPropertyName and in aElementPropertyName are both set
     * @example:
     *  element.priority.priority1=1
     *  configuration.priority.priority1=0
     *  configuration.activity.priority1=1
     *  configuration.strawberry.priority2=1
     *  MatchPropertiesValue('activity','priority','priority1') -> match
     *  MatchPropertiesValue('strawberry','priority','priority1') -> no match
     */
    function MatchPropertiesValue(aConfigurationPropertyName,aElementPropertyName,aPropertyValue)
    {
    	var propertiesElementProfile = myRulesEngine.opts.elementProfile.propertiesSet;
    	
    	if (
    			(propertiesConfiguration[aConfigurationPropertyName] && propertiesElementProfile[aElementPropertyName])
    		&& 	(propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] && propertiesElementProfile[aElementPropertyName][aPropertyValue])
//    		&& 	(propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] == propertiesElementProfile[aElementPropertyName][aPropertyValue])
    		)
    	{
    		return true;
    	}
    	return false;
    }
    /**
     * 
     * @function MatchProperties
	 * @access public 
     * @abstract matching rule function, tests if at least a property value exists and is set between the configurator property and the element property
     * @param aConfigurationPropertyName: a configuration property name
     * @param aElementPropertyName: a element property Name 
     *   
     * @return returns true if it exists a value of aConfigurationPropertyName that is the same that in aElementPropertyName
     * @example
     *  element.priority.priority1=1
     *  configuration.priority.priority1=0
     *  configuration.activity.priority1=1
     *  configuration.strawberry.priority2=1
     *  MatchProperties('activity','priority') -> match
     *  MatchProperties('strawberry','priority') -> no match
     */
    function MatchProperties(aConfigurationPropertyName,aElementPropertyName)
    {
    	propertiesElementProfile = myRulesEngine.opts.elementProfile.propertiesSet;

    	if (
    			(propertiesConfiguration[aConfigurationPropertyName] && propertiesElementProfile[aElementPropertyName])
    		)
    	{
    		for(aElementPropertyValue in propertiesElementProfile[aElementPropertyName]) 
    		{
    			if (
    					(propertiesElementProfile[aElementPropertyName][aElementPropertyValue])
    				&&	(propertiesConfiguration[aConfigurationPropertyName][aElementPropertyValue])
//    				&&	(propertiesElementProfile[aElementPropertyName][aElementPropertyValue] == propertiesConfiguration[aConfigurationPropertyName][aElementPropertyValue])
    				)
    			{
       				return true;
    			}
    		}
    	}
    	return false;
    }
    
    /**
     * @function public ConfigurationPropertySet 
     * @param  aPropertyName: a configuration property name
     * @param  aPropertyValue: a value of aPropertyName 
     * @param  valueSet: [0|1(default)]
     *   
     * @return returns true if the configuration for the aPropertyName.aPropertyValue == valueSet
     */
    function ConfigurationPropertySet(aPropertyName,aPropertyValue,valueSet)
    {
    	if (valueSet == undefined) valueSet=1;
    	if (
    				(propertiesConfiguration[aPropertyName])
    			&& 	(propertiesConfiguration[aPropertyName][aPropertyValue])
    			)
    		return true;
    	else return false;
    }

    
    /**
	 * @function setProperty
	 * @access public 
	 * @abstract set a property/property value status in the rules configurator
	 * @param aPropertyName: name of the property that has changed
	 * @param aProperyValue: value of the property
	 * @param aStatus:
	 * @return void 
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
	 * @function createRulesSet - creates a rule set
	 * @access public 
	 * @param aRulesGroup: name of the rules set to create
	 * @param aRuleEvents: [array] events to hear to test the rules group
	 * 
	 */
    function createRulesSet(aRulesGroup, aRuleEvents) {
    	var testRules = myRulesEngine._stateDefinition.TestRules;
    	if (!testRules.delegate_machines[aRulesGroup])
    	{
    		testRules.delegate_machines[aRulesGroup]=$.extend(true, {}, matchRuleTemplate);

    		aRuleEvents.forEach(function(aEvent) {
        		testRules.delegate_machines[aRulesGroup][aEvent]=
				{
   					next_state:'startTesting',
				};
    		});    		

    		testRules.testRuleDone.next_state_on_target.submachines[aRulesGroup]={
        			target_list: ['ruleMatch']
        	};
    	}
    }    
 
	/**
	 * @function addRule - add a new "and" rule in aRulesGroup
	 * @access public 
	 * @param aRuleName: a rule to define in the rules set
	 * @param aRuleEvent: event to hear to test the rule
	 * @param aRuleTest: a boolean test
	 * 
	 */
    function addRule(aRulesGroup, aRuleName, aRuleTest) {
    	var testRules = myRulesEngine._stateDefinition.TestRules;
    	if (!testRules.delegate_machines[aRulesGroup])
    	{	
    		alert(aRulesGroup+" needs to be previously created with createRulesSet function");
    		return;
    	}
    	
    	//create the new state called "aRuleName" for the rule
	 	testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName]=stateRuleTemplate;
	 	// activate the test
	 	testRules.delegate_machines[aRulesGroup]['submachine'].startTesting.enterState.process_event_if='this.opts.jamrules.'+aRuleTest;

	 	// modify the rules chain
	 	theNextRuleState = testRules.delegate_machines[aRulesGroup]['submachine'].startTesting.enterState.next_state;
	 	testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName].enterState.next_state=theNextRuleState;
	 	testRules.delegate_machines[aRulesGroup]['submachine'].startTesting.enterState.next_state = aRuleName;
	 	
    }

	/**
	 * @function public addElement 
	 * @abstract add an element to the list of elements to test against rules
	 * @param aElement: object
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
	 * @example
	 */
    function addElement(aElement) {
    	objectKey = getElementProfileKey(aElement);
    	addElementProfile(objectKey,aElement);
    	addElementToElementProfilesArray(objectKey,aElement);
    }

    
    /**
     * @access private
     * @abstract get the key to access to the element profile of an element
     * @return a md5 key for a json object
	 * 
	 */
    function getElementProfileKey(aElement)
    {
    	return $.md5(JSON.stringify(aElement.propertiesSet));
    }
    /**
     * @access private
     * @abstract add a new element profile if the one defines by aElement does not exist
	 * 
	 */
    function addElementProfile(objectKey,aElement)
    {
    	if (!ElementProfiles[objectKey]) ElementProfiles[objectKey]={propertiesSet:aElement.propertiesSet,elementsList:[]};
    }
    /**
     * @access private
     * @abstract add a new element to the element profiles array
	 * 
	 */
    function addElementToElementProfilesArray(objectKey,aElement)
    {
    	ElementProfiles[objectKey]['elementsList'].push(aElement);
    }
    
    /**
     * @access private
     * @abstract log a message on the console for debug
	 * 
	 */
    function log(msg) {
        console.debug(msg);
    }
 
    jamrules = {
    			setProperty: setProperty
        	,	addElement:addElement
        	,	createRulesSet:createRulesSet
        	,	addRule:addRule
        	,	MatchProperty:MatchProperty
        	,	MatchPropertyValue:MatchPropertyValue
        	,	MatchProperties:MatchProperties
        	,	MatchPropertiesValue:MatchPropertiesValue
        	,	ConfigurationPropertySet:ConfigurationPropertySet
    }; 

    aJqueryObj.iFSM(myRulesEngineStates,{debug:true,LogLevel:3,jamrules:jamrules});
	myRulesEngine = aJqueryObj.getFSM(myRulesEngineStates); 

	jamrules.ruleEngine = myRulesEngine;


    return (jamrules);
};
