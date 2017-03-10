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
function jamrules(aJqueryObj,options) {
 
    // variables and functions private unless attached to API below
    // 'this' refers to global window

	var defaults = {
			debug				: false,
			LogLevel			: 2,
		};
	
	// on charge les options passées en paramètre
	if (options == undefined) options=null;
	options = jQuery.extend( {}, defaults, options || {});

	
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
 					catchEvent:'startTestingRules',
	 				startTestingRules:
 					{
	 					next_state:'startTesting',
 					},
	 				ruleDontMatch:
 					{
	 					next_state:'ruleDontMatch',
	 			 		prevent_bubble:true
 					},
 					testRuleDone:
 					{
 					//dummy to catch the event without being caught by catchevent!	
 					}
	 			}
		},
 	};
    
    /**
     * @param stateRuleTemplate
     * @access private
     * @abstract template of a rule described in a subengine 
     */
    var stateRuleTemplate =
    {
		enterState:
		{
	 		process_event_if: 'this.opts.jamrules.aMatchingTest()',
	 		propagate_event_on_refused:'ruleDontMatch',
	 		propagate_event_on_localmachine:true,
	 		next_state:'',
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
                    	if (!this.opts.TestRules) this.opts.TestRules={};
                    	this.opts.TestRules.nbRulesTested = 0;
                    	this.opts.TestRules.nbRulesToTest = Object.keys(this._stateDefinition.TestRules
                    																	.testRuleDone
                    																	.next_state_on_target
                    																	.submachines).length;
                    	this.opts.jamrules.log('nb rules to test:'+this.opts.TestRules.nbRulesToTest);
                    },
            	},
    		 	delegate_machines: 
    		 	{
    		 		/***
    		 		 * submachine for testing
    		 		 /**/
    		 		/* for test - close this comment to activate the test
    		 		PriorityTestMatch1:
    		 		{
    		 			submachine:
    		 			{
        		 			
    		 				startTesting:
        		 			{
        		 				enterState:
        		 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 			 		next_state:'testDisplayAll',
        		 				},
        		 			},
    		 				testDisplayAll:
        		 			{
        		 				enterState:
        		 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 			 		process_event_if: 'this.opts.jamrules.ConfigurationPropertySet("activities","all")',
        		 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		propagate_event_on_localmachine:true,
        		 			 		next_state:'testPriorityExist',
        		 				},
        		 			},
        		 			testPriorityExist:
				 			{
				 				enterState:
				 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
				 			 		process_event_if: 'this.opts.jamrules.MatchProperty("priority")',
				 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		propagate_event_on_localmachine:true,
				 			 		next_state:'ruleMatch',
				 				},
				 			},
        		 			ruleMatch:
        		 			{
        		 				enterState:
        		 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 					propagate_event:'testRuleDone'
        		 				},
        		 			},
        		 			ruleDontMatch:
        		 			{
        		 				enterState:
        		 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
            		 				propagate_event:'testRuleDone'
        		 				}
        		 			},
        		 			DefaultState:
        		 			{

			 					catchEvent:'startTestingRules',
				 				startTestingRules:
    		 					{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 					next_state:'startTesting',
    		 					},
        		 				ruleDontMatch:
    		 					{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 					next_state:'ruleDontMatch',
        		 			 		prevent_bubble:true
    		 					},
    		 					testRuleDone:
    		 					{
    		 						
    		 					}
        		 			}
    		 				
    		 			},
    		 		},
    		 		/* for test - close this comment line to activate the test
    		 		PriorityTestMatch2:
    		 		{
    		 			submachine:
    		 			{
        		 			
    		 				startTesting:
        		 			{
        		 				enterState:
        		 				{
        		 			 		//next_state:'ruleMatch', //default state that will end the process
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 			 		next_state:'testDisplayAll',
        		 				},
        		 			},
    		 				testDisplayAll:
        		 			{
        		 				enterState:
        		 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 			 		process_event_if: 'this.opts.jamrules.ConfigurationPropertySet("activities","compliant")',
        		 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		propagate_event_on_localmachine:true,
        		 			 		next_state:'testPriorityExist',
        		 				},
        		 			},
        		 			testPriorityExist:
				 			{
				 				enterState:
				 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
				 			 		process_event_if: 'this.opts.jamrules.MatchProperty("priority")',
				 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		propagate_event_on_localmachine:true,
				 			 		next_state:'technicianCompliant',
				 				},
				 			},
        		 			technicianCompliant:
        		 			{
        		 				enterState:
        		 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 			 		process_event_if: 'this.opts.jamrules.MatchProperties("compliantTechnician","technician")',
        		 			 		propagate_event_on_refused:'ruleDontMatch',
        		 			 		propagate_event_on_localmachine:true,
        		 			 		next_state:'ruleMatch',
        		 				},
        		 			},
        		 			ruleMatch:
        		 			{
        		 				enterState:
        		 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 					propagate_event:'testRuleDone'
        		 				},
        		 			},
        		 			ruleDontMatch:
        		 			{
        		 				enterState:
        		 				{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
            		 				propagate_event:'testRuleDone'
        		 				}
        		 			},
        		 			DefaultState:
        		 			{
			 					catchEvent:'startTestingRules',
				 				startTestingRules:
    		 					{
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
        		 					next_state:'startTesting',
    		 					},
        		 				ruleDontMatch:
    		 					{
        		 					next_state:'ruleDontMatch',
        		                    init_function: function(data,aEvent,aPropertyConfiguration){
        		                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
        		                    },
    		 					},
    		 					testRuleDone:
    		 					{
    		 						
    		 					}
        		 			}
    		 				
    		 			},
    		 		},
    		 		/**/
    		 	},	  
    		 	/**
    		 	 * Events of TestRules
    		 	 */
    		 	testRuleDone:
    		 	{
                    init_function: function(){
                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
                    	this.opts.TestRules.nbRulesTested++;
                    },
    		 		next_state_on_target: 
    		 		{
    		 			condition 			: '||',
    		 			submachines			: 
    		 			{
    		 				/*for test - close this comment line to activate the test
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
    				propagate_event:'giveMatchResult',
 			 		propagate_event_on_localmachine:true,
    		 	},
    		 	giveMatchResult:
    		 	{
                    init_function: function(data,aEvent,aPropertyConfiguration){
                    	this.opts.jamrules.log("-->"+this.currentState+' '+this.receivedEvent);
                    },
                    process_event_if:'this.opts.TestRules.nbRulesTested >= this.opts.TestRules.nbRulesToTest',
                    propagate_event:'giveMatchResult',
                    next_state:'ruleDontMatch',
 			 		propagate_event_on_localmachine:true,
    		 		
    		 	},
            	
            },
            /**
             * State ruleMatch
             */
            ruleMatch:
            {
            	giveMatchResult:
    		 	{
                    init_function: function(data,aEvent,aPropertyConfiguration){
                    	this._log('Element profile matched');
                    	//alert("match");
                    },
                    propagate_event:'updateElementsMatch',
                    next_state:'updateElements',
    		 		
    		 	},
            	
            },
            /**
             * State ruleDontMatch
             */
            ruleDontMatch:
            {
            	giveMatchResult:
    		 	{
                    init_function: function(data,aEvent,aPropertyConfiguration){
                    	this._log('Element profile did not match');
                    	//alert("don't match");
                    },
                    propagate_event:'updateElementsDontMatch',
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
                    	for(aElement in this.opts.elementProfile.elementsList) 
                    	{
                    		this.opts.elementProfile.elementsList[aElement].matched();
                    	}

                    },
	            	propagate_event:'testRules',
	                next_state:'waitTestRules',
                },
	        	updateElementsDontMatch:
	            {
	                init_function: function(){
	                	if (this.opts.elementProfile.elementsList[0].notmatched)
	                	for(aElement in this.opts.elementProfile.elementsList) 
	                	{
	                		this.opts.elementProfile.elementsList[aElement].notmatched();
	                	}
	
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
            	 * event should send a 'aPropertyConfiguration' data object as:
            	 * {propertyName:<aPropertyName>,propertyValue:<aPropertyValue>,status:<aStatus>}
            	 */
	        	propertyChange:   
		        {
	                init_function: function(data,aEvent,aPropertyConfiguration){
	                	//initialize the element profiles to process
	                	this.opts.elementProfileId=-1;
	                	this.opts.aPropertyConfiguration=aPropertyConfiguration;
	                	this.opts.maxElementProfiles = Object.keys(ElementProfiles).length;
	                	// start processing rules on the element profiles list
	                	if (this.opts.maxElementProfiles > 0) this.trigger(this.opts.aPropertyConfiguration.propertyName); 
	                },
		        },
            	/*
            	 * internal event - starts the process to test the rules against the current configuration and the different element profiles
            	 * event should send a 'aPropertyConfiguration' data object as:
            	 * {propertyName:<aPropertyName>,propertyValue:<aPropertyValue>,status:<aStatus>}
            	 */
		        /*for test
		        priority:'testRules',
		        activities:'testRules',
		        compliantTechnician:'testRules',
		        /**/
    	        testRules:
    	        {
                    next_state_when:"this.opts.elementProfileId  < this.opts.maxElementProfiles",
            		next_state:'TestRules',
            		init_function: function(data,aEvent){
                    	this.opts.elementProfileId++;
            			if (this.opts.elementProfileId  < this.opts.maxElementProfiles)
            			{
                    		this.opts.elementProfile=ElementProfiles[Object.keys(ElementProfiles)[this.opts.elementProfileId]];
                    		this.trigger(this.opts.aPropertyConfiguration.propertyName);
            			}
            		},
                    
    	        },
            },
    		DefaultState:
            {
    		 	start: //a default start event received at the FSM start
    		 	{
                    next_state:"waitTestRules"
    		 	},
    		 	testRuleDone:
    		 	{
    		 		//dummy to catch it
    		 	}
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
    	
    	//if undefined, means that we want that the property value of element profile is set in the configuration too 
    	if (aPropertyValue==undefined) 
    	{
    		// we can process only if the property has only one value
    		if (Object.keys(propertiesElementProfile[aElementPropertyName]).length==1 )
    		{
    			aPropertyValue = Object.keys(propertiesElementProfile[aElementPropertyName])[0];
    			if (!propertiesElementProfile[aElementPropertyName][aPropertyValue]) return false;
    		}
    		else return false;
    		
    	}
    	
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
     * @function ConfigurationPropertySet
     * @access public 
     * @abstract matching rule function, tests if the property in the configurator has its value set
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
	 * @param aStatus: [boolean] status of the property for this property value set or not
	 * @param doTest: [boolean] [default:true] if false, configure the configurator but does not run the rules engine test
	 * @return void 
	 */
    function setProperty(aPropertyName,aPropertyValue,aStatus, doTest) {
    	log("setProperty(aPropertyName,aPropertyValue,aStatus):"+aPropertyName+','+aPropertyValue+','+aStatus);
    	if (aStatus == undefined) aStatus=false;
    	if (doTest == undefined) doTest=true;
    	
    	var statusChanged = true;

    	if (	propertiesConfiguration[aPropertyName] 
    		&& 	propertiesConfiguration[aPropertyName][aPropertyValue] 
    		&& 	propertiesConfiguration[aPropertyName][aPropertyValue] == aStatus
    		)
    		statusChanged=false;
    	
    	if (!propertiesConfiguration[aPropertyName]) propertiesConfiguration[aPropertyName]={};
    	
    	propertiesConfiguration[aPropertyName][aPropertyValue]=aStatus;
		if (myRulesEngine && doTest && statusChanged) myRulesEngine.trigger('propertyChange',{propertyName:aPropertyName,propertyValue:aPropertyValue,status:aStatus});

    }
    
    
	/**
	 * @function createRulesSet - creates a rule set
	 * @access public 
	 * @param aRulesGroup: name of the rules set to create
	 * @param ruleEvents: [array] events to hear to test the rules group. Actually, should be names of properties that are used as events (see setProperty). 
	 * a Rule Group is added in the "TestRules" state by adding a submachine in it
	 * Rules added in a Rule Group are tested between them with the "AND" operator
	 * Rule Groups are tested between them with the "OR" operator
	 * The rule engine will react only to events defined in ruleEvents
	 * 
	 */
    function createRulesSet(aRulesGroup, ruleEvents) {
    	log("createRulesSet(aRulesGroup, ruleEvents): "+aRulesGroup,+" - "+ruleEvents);
    	var testRules = myRulesEngineStates.TestRules;
    	var waitTestRules = myRulesEngineStates.waitTestRules;
    	if (!testRules.delegate_machines[aRulesGroup])
    	{
    		testRules.delegate_machines[aRulesGroup]=$.extend(true, {}, matchRuleTemplate);

    		ruleEvents.forEach(function(aEvent) {
        		waitTestRules[aEvent] = "testRules";
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
	 * 
	 */
    function addRule(aRulesGroup, aRuleName, aRuleTest) {
    	log("addRule(aRulesGroup, aRuleName, aRuleTest): "+aRulesGroup+" - "+aRuleName+"-"+aRuleTest);
    	var testRules = myRulesEngineStates.TestRules;
    	if (!testRules.delegate_machines[aRulesGroup])
    	{	
    		alert(aRulesGroup+" needs to be previously created with createRulesSet function");
    		return;
    	}
    	
    	//create the new state called "aRuleName" for the rule
	 	testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName]=$.extend(true, {}, stateRuleTemplate);
	 	// activate the test
	 	if (aRuleTest.charAt(0) == '!') aRuleTest = '!'+'this.opts.jamrules.'+aRuleTest.slice(1);
	 	else aRuleTest = 'this.opts.jamrules.'+aRuleTest;
	 	testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName].enterState.process_event_if=aRuleTest;

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
    	log("addElement");
    	objectKey = getElementProfileKey(aElement);
    	addElementProfile(objectKey,aElement);
    	addElementToElementProfilesArray(objectKey,aElement);
    }

    /**
     * @function compileRules
     * @abstract initialize the rule engine - to do before action and after adding the rules
     */
    function compileRules()
    {
    	log("compileRules");
        aJqueryObj.iFSM(myRulesEngineStates,{debug:options.debug,LogLevel:options.LogLevel,jamrules:jamrules});
    	myRulesEngine = aJqueryObj.getFSM(myRulesEngineStates); 

    	jamrules.ruleEngine = myRulesEngine;
    	return jamrules;
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
     * @access public
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
        	,	compileRules:compileRules
        	,	MatchProperty:MatchProperty
        	,	MatchPropertyValue:MatchPropertyValue
        	,	MatchProperties:MatchProperties
        	,	MatchPropertiesValue:MatchPropertiesValue
        	,	ConfigurationPropertySet:ConfigurationPropertySet
        	,	log:log
    }; 


    return (jamrules);
};
