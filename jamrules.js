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

var jamrules = (function(){
	

	var jamrulesClass = function(aJqueryObj,options) {
	
		
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
	     * @param ObjectProfiles
	     * @access private 
	     * @abstract list of possible profiles available to all rules
	     * 	a profile is defined by a list of entries [objectKey]:{propertiesSet:<apropertiesSet>,objectsList:[]}
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
	    var ObjectProfiles = {};
	    
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
	    };
	    
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
	
	                    	this.opts.reason={};
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
	                    propagate_event:'updateObjectsMatch',
	                    next_state:'updateObjects',
	    		 		
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
	                    	this._log('Object profile did not match');
	                    	//alert("don't match");
	                    },
	                    propagate_event:'updateObjectsDontMatch',
	                    next_state:'updateObjects',
	 			 		out_function: function() {
	 			 		},
	    		 		
	    		 	},
	            	
	            },
	            /**
	             * State updateObjects
	             */
	            updateObjects:
	            {
	            	updateObjectsMatch:
	                {
	                    init_function: function(){
	 			 			for(aSubMachine in this._stateDefinition.TestRules.delegate_machines) 
	 			 			{
	 			 				this.opts.jamrules.log("-->"+aSubMachine);
	 			 				this.opts.reason[aSubMachine]=this._stateDefinition.TestRules.delegate_machines[aSubMachine].myFSM.currentState;
	//not needed 				this.opts.reason[aSubMachine]+=':'+this._stateDefinition.TestRules.delegate_machines[aSubMachine].myFSM.lastState;
	 			 			}
	 			 			var thisme=this
	 			 			$.each(this.opts.reason,function(index,value) {
	 			 				if (value.indexOf("DefaultState")==-1)
	 			 					thisme.opts.jamrules.log("Match reason: State "+index+" --> "+value);
	 			 			});
	
	 			 			if (this.opts.objectProfile.objectsList[0].matched)
	                    	for(anObject in this.opts.objectProfile.objectsList) 
	                    	{
	                    		this.opts.objectProfile.objectsList[anObject].matched(thisme.opts.jamrules);
	                    	}
	
	                    },
		            	propagate_event:'testRules',
		                next_state:'waitTestRules',
	 			 		out_function: function() {
	 			 		},
	                },
		        	updateObjectsDontMatch:
		            {
		                init_function: function(){
	                    	this.opts.reason={};
	 			 			for(aSubMachine in this._stateDefinition.TestRules.delegate_machines) 
	 			 			{
	 			 				this.opts.jamrules.log("-->"+aSubMachine);
	 			 				this.opts.reason[aSubMachine]=this._stateDefinition.TestRules.delegate_machines[aSubMachine].myFSM.currentState;
	 			 				this.opts.reason[aSubMachine]+=':'+this._stateDefinition.TestRules.delegate_machines[aSubMachine].myFSM.lastState;
	 			 			}
	 			 			var thisme=this
	 			 			$.each(this.opts.reason,function(index,value) {
	 			 				if (value.indexOf("DefaultState")==-1)
	 			 					thisme.opts.jamrules.log("Don't Match reason: State "+index+" --> "+value);
	 			 			});
	
	 			 			if (this.opts.objectProfile.objectsList[0].notmatched)
		                	for(anObject in this.opts.objectProfile.objectsList) 
		                	{
		                		this.opts.objectProfile.objectsList[anObject].notmatched(thisme.opts.jamrules);
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
		                	this.opts.objectProfileId=-1;
		                	this.opts.aPropertyConfiguration=aPropertyConfiguration;
		                	this.opts.ObjectProfiles = this.opts.jamrules.getAllObjectProfiles();
		                	this.opts.maxObjectProfiles = Object.keys(this.opts.ObjectProfiles).length;
		                	// start processing rules on the element profiles list
		                	if (this.opts.maxObjectProfiles > 0) this.trigger(this.opts.aPropertyConfiguration.propertyName); 
		                },
			        },
	            	/*
	            	 * event to emit to run a test without a change on the configurator
	            	 * 
	            	 */
		        	runEngine:   
			        {
		                init_function: function(){
		                	//initialize the element profiles to process
		                	this.opts.objectProfileId=-1;
		                	this.opts.aPropertyConfiguration={propertyName:'dummyEvent'};
		                	this.opts.ObjectProfiles = this.opts.jamrules.getAllObjectProfiles();
		                	this.opts.maxObjectProfiles = Object.keys(this.opts.ObjectProfiles).length;
		                	// start processing rules on the element profiles list
		                	if (this.opts.maxObjectProfiles > 0) this.trigger('testRules'); 
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
	                    next_state_when:"this.opts.objectProfileId  < this.opts.maxObjectProfiles",
	            		next_state:'TestRules',
	            		init_function: function(data,aEvent){
	                    	this.opts.objectProfileId++;
	            			if (this.opts.objectProfileId  < this.opts.maxObjectProfiles)
	            			{
	                    		this.opts.objectProfile=this.opts.ObjectProfiles[Object.keys(this.opts.ObjectProfiles)[this.opts.objectProfileId]];
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
	    		 	},
	
	            }
	    };
	    
	    
	    /**
	     * jamrulesConstructor
	     * 
	     * constructor of a jamRules object
	     * 
	     */
	    var jamrulesConstructor = function(aJqueryObj,options) {
	    	
	   	 
		    // variables and functions private unless attached to API below
		    // 'this' refers to global window
		
			var defaults = {
					debug				: false,
					LogLevel			: 1,
				};
		
			/**
			 * @param options - options given to jamrules
			 * @access public 
			 */
			if (this.options == undefined) this.options=null;
			this.options = jQuery.extend( {}, defaults, options || {});
	
		
			/**
			 * @param myRulesEngine - the FSM engine bound to the jamrules
			 * @access public 
			 */
			this.myRulesEngine={};
	
		
			/**
			 * @param myJqueryObj - the jquery object on which jamrules is bound
			 * @access public 
			 */
			this.myJqueryObj = aJqueryObj;
			
			
		    /**
		     * @param _ObjectProfiles
		     * @access private 
		     * @abstract list of possible profiles available local to this rule engine
		     * 	a profile is defined by a list of entries [objectKey]:{propertiesSet:<apropertiesSet>,objectsList:[]}
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
		    var _ObjectProfiles = {};
		    
		    /**
		     * getObjectProfiles - get the current object profiles bound to this rule engine
		     * 
		     */
		    this.getObjectProfiles = function(){
		    	return _ObjectProfiles;
		    }
	
		    /**
		     * getAllObjectProfiles - get all the object profiles (shared and of the current instance) bound to this rule engine
		     * 
		     */
		    this.getAllObjectProfiles = function(){
			    return $.extend( ObjectProfiles, this.getObjectProfiles() );
		    }
	    };
	

	    
	    /**
	     * @access private
	     * @abstract get the key to access to the object profile of an object
	     * @return a md5 key for a json object
		 * 
		 */
	    var getObjectProfileKey = function(anObject)
	    {
	    	return $.md5(JSON.stringify(anObject.propertiesSet));
	    }
	    /**
	     * @access private
	     * @abstract add a new object profile if the one defines by anObject does not exist
		 * 
		 */
	    var addObjectProfile = function(objectKey,anObject,anObjectProfiles)
	    {
	    	if (!anObjectProfiles) anObjectProfiles = ObjectProfiles;
	    	if (!anObjectProfiles[objectKey]) anObjectProfiles[objectKey]={propertiesSet:anObject.propertiesSet,objectsList:[]};
	    }
	    /**
	     * @access private
	     * @abstract add a new element to the element profiles array
		 * 
		 */
	    var addObjectToObjectProfilesArray = function(objectKey,anObject,anObjectProfiles)
	    {
	    	if (!anObjectProfiles) anObjectProfiles = ObjectProfiles;
	    	anObjectProfiles[objectKey]['objectsList'].push(anObject);
	    }
	
	    
	    /**
	     * ----------------------------------------- 
	     * Testing functions available for the rules
	     * ----------------------------------------- 
	     */
	    
	    /**
	     * @function MatchProperty
		 * @access public 
	     * @abstract matching rule function, tests if at least a property value of a property is shared between the configuration and the object  
	     * @param aPropertyName: a property name
	     * 
	     * @return returns true if any property value for a given aPropertyName is set in the profile object and in the configuration property set
	     * @example
	     *  object.priority.priority1=1
	     *  object.technician.technician1=1
	     *  configuration.priority.priority1=1
	     *  configuration.priority.priority2=0
	     *  configuration.technician.technician1=0
	     *  configuration.technician.technician2=1
	     *  MatchProperty('priority') -> match
	     *  MatchProperty('technician') -> no match
	     */
	    var MatchProperty = function(aPropertyName)
	    {
	    	var propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
	    	
	    	if (propertiesConfiguration[aPropertyName] && propertiesObjectProfile[aPropertyName])
	    	{
	    		for(aPropertyValue in propertiesObjectProfile[aPropertyName]) 
	    		{
	    			if (
	    					(propertiesConfiguration[aPropertyName][aPropertyValue])
	    				&&	(propertiesObjectProfile[aPropertyName][aPropertyValue])
	//    				&& 	(propertiesObjectProfile[aPropertyName][aPropertyValue] == propertiesConfiguration[aPropertyName][aPropertyValue])
	    				)
	    				return true;
	    		}
	    	}
	    	return false;
	    }
	    
	    /**
	     * @function MatchPropertyValue
		 * @access public 
	     * @abstract matching rule function, tests if a given property value is set for configuration and the object   
	     * @param aPropertyName: a property name
	     * @param aPropertyValue: a value of aPropertyName 
	     *  
	     * @return returns true if the configuration for the aPropertyName.aPropertyValue == the one defined for the current objectProfile being tested
	     * @example
	     * object.priority.priority1=1
	     * object.technician.technician1=1
	     * configuration.priority.priority1=1
	     * configuration.technician.technician1=0
	     * MatchPropertyValue('priority','priority1') -> match
	     * MatchPropertyValue('technician','technician1') -> no match
	     */
	    var MatchPropertyValue=function (aPropertyName,aPropertyValue)
	    {
	    	var propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
	    	if (
	    			(propertiesConfiguration[aPropertyName] && propertiesObjectProfile[aPropertyName])
	    			&& (propertiesConfiguration[aPropertyName][aPropertyValue] && propertiesObjectProfile[aPropertyName][aPropertyValue])
	//    			&& (propertiesConfiguration[aPropertyName][aPropertyValue] == propertiesObjectProfile[aPropertyName][aPropertyValue])
	    			)
	    		return true;
	    	else return false;
	    }
	    
	    /**
	     * @function MatchExternalRule
		 * @access public 
	     * @abstract matching rule function, tests the given rule and return true/false according to the test   
	     * @param aRule: a statement to evaluate
	     * 			you can use these variables to access to the properties of the configurator or of the object
	     * 			* propertiesObjectProfile : properties of the current object being tested
	     * 			* propertiesConfiguration : properties set in the configurator
	     * 			you can use the other matching functions prefixing them with "this.<matchingFunction>"
	     * 			ex: this.MatchPropertiesSameValue('strawberry','priority','priority1')
	     *  
	     * @return boolean
	     * @example
	     * object.priority.priority1=1
	     * object.technician.technician1=1
	     * configuration.priority.priority1=1
	     * configuration.technician.technician1=0
	     * MatchExternalRule('propertiesObjectProfile[priority]==propertiesConfiguration[priority]') -> match
	     * MatchExternalRule('propertiesObjectProfile[technician][technician1]==propertiesConfiguration[technician][technician1]') -> not match
	     */
	    var MatchExternalRule = function(aRule)
	    {
	    	var propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
	    	
	    	var resultTest = eval(aRule);
	    	
	    	return resultTest;
	    }
	
	    /**
	     * @function public MatchPropertiesSameValue
	     * @abstract matching rule function, tests if a property value of a property is set for the configurator and the object
	     * @param aConfigurationPropertyName: a configuration property name
	     * @param anObjectPropertyName: a object property Name 
	     * @param aPropertyValue: [option] a value that should match
	     * 				if undefined, test if at least one of the property values of property is set in Object and in configuration
	     *   
	     * @return returns true if aPropertyValue in aConfigurationPropertyName and in anObjectPropertyName are both set
	     * @example:
	     *  object.priority.priority1=1
	     *  configuration.priority.priority1=0
	     *  configuration.activity.priority1=1
	     *  configuration.strawberry.priority2=1
	     *  MatchPropertiesSameValue('activity','priority','priority1') -> match
	     *  MatchPropertiesSameValue('strawberry','priority','priority1') -> no match
	     *  MatchPropertiesSameValue('activity','priority') -> match
	     *  MatchPropertiesSameValue('strawberry','priority') -> no match
	     */
	    var MatchPropertiesSameValue = function(aConfigurationPropertyName,anObjectPropertyName,aPropertyValue)
	    {
	    	var propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
	    	
	    	//if undefined, means that we want that one of the property value of object is set in the configuration too 
	    	if (aPropertyValue==undefined) 
	    	{
	    		for(aPropertyValue in propertiesObjectProfile[anObjectPropertyName]) 
	    		{
	    	    	if (
	    	    			(propertiesConfiguration[aConfigurationPropertyName] && propertiesObjectProfile[anObjectPropertyName])
	    	    		&& 	(propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] && propertiesObjectProfile[anObjectPropertyName][aPropertyValue])
	//    	    		&& 	(propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] == propertiesObjectProfile[anObjectPropertyName][aPropertyValue])
	    	    		)
	    	    	{
	    	    		return true;
	    	    	}
	    		}
	    		
	    		return false;
	    		
	    	}
	    	else if (
	    			(propertiesConfiguration[aConfigurationPropertyName] && propertiesObjectProfile[anObjectPropertyName])
	    		&& 	(propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] && propertiesObjectProfile[anObjectPropertyName][aPropertyValue])
	//    		&& 	(propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] == propertiesObjectProfile[anObjectPropertyName][aPropertyValue])
	    		)
	    	{
	    		return true;
	    	}
	    	return false;
	    }
	    /**
	     * @function public MatchPropertiesSameValues
	     * @abstract matching rule function, tests the property values set for the configurator's property and the object's property and if they are the same between the two
	     * @param aConfigurationPropertyName: a configuration property name
	     * @param anObjectPropertyName: a object property Name 
	     *   
	     * @return returns true if all properties values of aConfigurationPropertyName and of anObjectPropertyName are both set
	     * @example:
	     *  object.priority.priority1=1
	     *  configuration.priority.priority1=0
	     *  configuration.activity.priority1=1
	     *  configuration.strawberry.priority2=1
	     *  MatchPropertiesSameValues('activity','priority') -> match
	     *  MatchPropertiesSameValues('strawberry','priority','priority1') -> no match
	     */
	    var MatchPropertiesSameValues = function(aConfigurationPropertyName,anObjectPropertyName)
	    {
	    	
	    	var propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
	    	
			// we can process only if the property has only one value
			for(aPropertyValue in propertiesObjectProfile[anObjectPropertyName]) 
			{
				//one of the value is not ok=> does not share their values setting
		    	if (!MatchPropertiesSameValue(aConfigurationPropertyName,anObjectPropertyName,aPropertyValue))
		    		return false;
			}
	    		
	   		return true;
	    }
	    /**
	     * 
	     * @function MatchProperties
		 * @access public 
	     * @abstract matching rule function, tests if at least a property value exists and is set between the configurator property and the object property
	     * @param aConfigurationPropertyName: a configuration property name
	     * @param anObjectPropertyName: a object property Name 
	     *   
	     * @return returns true if it exists a value of aConfigurationPropertyName that is the same one in anObjectPropertyName
	     * @example
	     *  object.priority.priority1=1
	     *  configuration.priority.priority1=0
	     *  configuration.activity.priority1=1
	     *  configuration.strawberry.priority2=1
	     *  MatchProperties('activity','priority') -> match
	     *  MatchProperties('strawberry','priority') -> no match
	     */
	    var MatchProperties = function(aConfigurationPropertyName,anObjectPropertyName)
	    {
	    	propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
	
	    	if (
	    			(propertiesConfiguration[aConfigurationPropertyName] && propertiesObjectProfile[anObjectPropertyName])
	    		)
	    	{
	    		for(anObjectPropertyValue in propertiesObjectProfile[anObjectPropertyName]) 
	    		{
	    			if (
	    					(propertiesObjectProfile[anObjectPropertyName][anObjectPropertyValue])
	    				&&	(propertiesConfiguration[aConfigurationPropertyName][anObjectPropertyValue])
	//    				&&	(propertiesObjectProfile[anObjectPropertyName][anObjectPropertyValue] == propertiesConfiguration[aConfigurationPropertyName][anObjectPropertyValue])
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
	    var ConfigurationPropertySet = function(aPropertyName,aPropertyValue,valueSet)
	    {
	    	if (valueSet == undefined) valueSet=1;
	    	if (
	    				(propertiesConfiguration[aPropertyName])
	    			&& 	(propertiesConfiguration[aPropertyName][aPropertyValue])
	    			&&	valueSet
	    			)
	    		return true;
	    	else return false;
	    }
	
	    /**
	     * @function ObjectPropertySet
	     * @access public 
	     * @abstract matching rule function, tests if the property in theObjectPropertySett has its value set
	     * @param  aPropertyName: an element property name
	     * @param  aPropertyValue: a value of aPropertyName 
	     * @param  valueSet: [0|1(default)]
	     *   
	     * @return returns true if the configuration for the aPropertyName.aPropertyValue == valueSet
	     */
	    var ObjectPropertySet = function(aPropertyName,aPropertyValue,valueSet)
	    {
	    	propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
	    	
	    	if (valueSet == undefined) valueSet=1;
	    	if (
	    				(propertiesObjectProfile[aPropertyName])
	    			&& 	(propertiesObjectProfile[aPropertyName][aPropertyValue])
	    			&&	valueSet
	    			)
	    		return true;
	    	else return false;
	    }
	    
	    /**
	     * @function ObjectPropertiesSameValue
	     * @access public 
	     * @abstract matching rule function, tests if the property in the element has the same value as an other element property
	     * @param  aPropertyName1: an element property name
	     * @param  aPropertyName2: an other element property name
	     * @param  aPropertyValue: a value of aPropertyName 
	     *   
	     * @return returns true if the configuration for the aPropertyName.aPropertyValue == valueSet
	     */
	    var ObjectPropertiesSameValue = function(aPropertyName1,aPropertyName2,aPropertyValue)
	    {
	    	propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
	    	
	    	//if undefined, means that we want that one of the property value of object is set in the configuration too 
	    	if (aPropertyValue==undefined) 
	    	{
	    		for(aPropertyValue in propertiesObjectProfile[aPropertyName1]) 
	    		{
	    	    	if (
	    	    			(propertiesObjectProfile[aPropertyName2])
	    	    		&& 	(propertiesObjectProfile[aPropertyName1][aPropertyValue] && propertiesObjectProfile[aPropertyName2][aPropertyValue])
	    	    		)
	    	    	{
	    	    		return true;
	    	    	}
	    		}
	    		
	    		return false;
	    		
	    	}
	    	else if (
	    				(propertiesObjectProfile[aPropertyName1])
	    			&& 	(propertiesObjectProfile[aPropertyName1][aPropertyValue])
	    			&&	(propertiesObjectProfile[aPropertyName2])
	    			&& 	(propertiesObjectProfile[aPropertyName2][aPropertyValue])
	    			)
	    		return true;
	    	else return false;
	    }
	    
	    /**
	     * @function ObjectPropertiesSameValues
	     * @access public 
	     * @abstract matching rule function, tests if the property in the element has the same values as an other element property
	     * @param  aPropertyName1: an element property name
	     * @param  aPropertyName2: an other element property name
	     *   
	     * @return returns boolean
	     */
	    var ObjectPropertiesSameValues = function(aPropertyName1,aPropertyName2)
	    {
			var propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
			
			// we can process only if the property has only one value
			for(aPropertyValue in propertiesObjectProfile[aPropertyName1]) 
			{
				//one of the value is not ok=> does not share their values setting
		    	if (!ObjectPropertiesSameValue(aPropertyName1,aPropertyName2,aPropertyValue))
		    		return false;
			}
				
			return true;
	    }
	    
	    
	    /**
	     * @function ConfigurationPropertiesSameValue
	     * @access public 
	     * @abstract matching rule function, tests if the property in the configuration has the same value as an other configuration property
	     * @param  aPropertyName1: an element property name
	     * @param  aPropertyNam2: an other element property name
	     * @param  aPropertyValue: a value of aPropertyName 
	     *   
	     * @return returns true if the configuration for the aPropertyName.aPropertyValue == valueSet
	     */
	    var ConfigurationPropertiesSameValue = function(aPropertyName1,aPropertyName2,aPropertyValue)
	    {
	    	//if undefined, means that we want that one of the property value of object is set in the configuration too 
	    	if (aPropertyValue==undefined) 
	    	{
	    		for(aPropertyValue in propertiesConfiguration[aPropertyName1]) 
	    		{
	    	    	if (
	    	    			(propertiesConfiguration[aPropertyName2])
	    	    		&& 	(propertiesConfiguration[aPropertyName1][aPropertyValue] && propertiesConfiguration[aPropertyName2][aPropertyValue])
	    	    		)
	    	    	{
	    	    		return true;
	    	    	}
	    		}
	    		
	    		return false;
	    		
	    	}
	    	else if (
	    				(propertiesConfiguration[aPropertyName1])
	    			&& 	(propertiesConfiguration[aPropertyName1][aPropertyValue])
	    			&&	(propertiesConfiguration[aPropertyName2])
	    			&& 	(propertiesConfiguration[aPropertyName2][aPropertyValue])
	    			)
	    		return true;
	    	else return false;
	    }
	
	    /**
	     * @function ConfigurationPropertiesSameValues
	     * @access public 
	     * @abstract matching rule function, tests if the property in the element has the same values as an other element property
	     * @param  aPropertyName1: an element property name
	     * @param  aPropertyName2: an other element property name
	     *   
	     * @return returns true if the configuration for the aPropertyName.aPropertyValue == valueSet
	     */
	    var ConfigurationPropertiesSameValues = function(aPropertyName1,aPropertyName2)
	    {
			// we can process only if the property has only one value
			for(aPropertyValue in propertiesConfiguration[aPropertyName1]) 
			{
				//one of the value is not ok=> does not share their values setting
		    	if (!ConfigurationPropertiesSameValue(aPropertyName1,aPropertyName2,aPropertyValue))
		    		return false;
			}
				
			return true;
	    }
	
	    /**
	     * ----------------------------------------- 
	     * GENERAL API FUNCTIONS 
	     * -----------------------------------------
	     */ 
	    
		/**
		 * @function createRulesSet - creates a rule set
		 * @access public 
		 * @param aRulesGroup: name of the rules set to create
		 * @param ruleEvents: [array] events to hear to test the rules group. Actually, should be names of properties that are used as events (see selectConfigurationPropertyValue). 
		 * a Rule Group is added in the "TestRules" state by adding a submachine in it
		 * Rules added in a Rule Group are tested between them with the "AND" operator
		 * Rule Groups are tested between them with the "OR" operator
		 * The rule engine will react only to events defined in ruleEvents
		 * 
		 */
	    var createRulesSet = function(aRulesGroup, ruleEvents) {
	    	this.log("createRulesSet(aRulesGroup, ruleEvents): "+aRulesGroup+" - "+ruleEvents);
	    	var testRules = myRulesEngineStates.TestRules;
	    	var waitTestRules = myRulesEngineStates.waitTestRules;
	    	if (!testRules.delegate_machines[aRulesGroup])
	    	{
	    		testRules.delegate_machines[aRulesGroup]=$.extend(true, {}, matchRuleTemplate);
	
	    		if (ruleEvents)
	    		ruleEvents.forEach(function(aEvent) {
	        		waitTestRules[aEvent] = "testRules";
	    		});    		
	
	    		testRules.testRuleDone.next_state_on_target.submachines[aRulesGroup]={
	        			target_list: ['ruleMatch']
	        	};
	    	}
	    	else
	    	{
	    		this.log("createRulesSet: "+aRulesGroup+" still declared! nothing done");
	    	}
	    }    
	 
		/**
		 * @function addRule - add a new "and" rule in aRulesGroup
		 * @access public 
		 * @param aRulesGroup: a rule set name
		 * @param aRuleName: a rule to define in the rules set
		 * @param aRuleTest: a boolean test to evaluate
		 * @param overloadRule: boolean (default: false), if aRuleName exists, will overload it
		 * 
		 * 
		 */
	    var addRule = function(aRulesGroup, aRuleName, aRuleTest, overloadRule) {
	    	this.log("addRule(aRulesGroup, aRuleName, aRuleTest): "+aRulesGroup+" - "+aRuleName+"-"+aRuleTest);
	    	var testRules = myRulesEngineStates.TestRules;
	    	
	    	if (!overloadRule) overloadRule=false;
	    	
	    	if (!testRules.delegate_machines[aRulesGroup])
	    	{	
	    		if (this.options.debug) alert(aRulesGroup+" needs to be previously created with createRulesSet function");
	    		return;
	    	}
	    	
	    	//create the new state called "aRuleName" for the rule
	    	if (!overloadRule && testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName])
	    	{	
	    		if (this.options.debug) alert(aRuleName+" still exists and can not be overloaded");
	    		return;
	    	}
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
		 * @function runRulesEngine
		 * @access public 
		 * @abstract run the rules engine
		 * @return void 
		 */
	    var runRulesEngine = function() {
	    	this.log("runRulesEngine");
	    	if (!this.myRulesEngine)
	    	{
	    		if (this.options.debug) alert("Rules engine is not started. Call first compile rules (cf compileRules())");
	    		return;
	    	}
			this.myRulesEngine.trigger('runEngine');
	
	    }
	    
	    /**
		 * @function selectConfigurationPropertyValue
		 * @access public 
		 * @abstract set a property/property value status in the rules configurator
		 * @param aPropertyName: name of the property that has changed
		 * @param aProperyValue: value of the property
		 * @param aStatus: [boolean] status of the property for this property value set or not
		 * @param doTest: [boolean] [default:true] if false, configure the configurator but does not run the rules engine test
		 * @return void 
		 */
	    var selectConfigurationPropertyValue = function(aPropertyName,aPropertyValue,aStatus, doTest) {
	    	this.log("selectConfigurationPropertyValue(aPropertyName,aPropertyValue,aStatus):"+aPropertyName+','+aPropertyValue+','+aStatus);
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
			if (this.myRulesEngine && doTest && statusChanged) this.myRulesEngine.trigger('propertyChange',{propertyName:aPropertyName,propertyValue:aPropertyValue,status:aStatus});
			else if (!this.myRulesEngine)
	    	{
	    		if (this.options.debug) alert("Rules engine is not started. Call first compile rules (cf compileRules())");
	    		return;
	    	}
	
	
	    }
	    
	    /**
	     * @function compileRules
	     * @abstract initialize the rule engine - to do before action and after adding the rules
	     */
	    var compileRules = function()
	    {
	    	this.log("compileRules");
	    	var jamrules = this;
	        this.myJqueryObj.iFSM(myRulesEngineStates,{debug:this.options.debug,logLevel:this.options.logLevel,jamrules:jamrules});
	    	var myRulesEngine = this.myJqueryObj.getFSM(myRulesEngineStates); 
	
	    	this.myRulesEngine = myRulesEngine;
	    }
	    
	    /**
	     * @function public static _addObject 
	     * @abstract add an object to the list of objects to test against rules
	     * the new object will be tested against all the called rules
	     * @param anObject: object
	     * {
	     * 		propertiesSet:
	     * 		[	
	     * 			<propertyName1>.<propertyValue1>:true|false,
	     * 			<propertyName2>.<propertyValue2>:true|false
	     * 			....
	     * 		]
	     * 		matched:<function name to call when a rule will match for the object>
	     * 		notmatched:<function name to call when there is a change but object does not match any rules>
	     * }
	     * @example
	     */
	    var _addObject = function(anObject,anObjectProfiles) {
	    	this.log("addObject");
	    	var objectKey = getObjectProfileKey(anObject);
	    	addObjectProfile(objectKey,anObject,anObjectProfiles);
	    	addObjectToObjectProfilesArray(objectKey,anObject,anObjectProfiles);
	    };
	
	    /**
	     * @function public addObject 
	     * @abstract add an object to the list of objects to test against rules
	     * @param anObject: object
	     * {
	     * 		propertiesSet:
	     * 		[	
	     * 			<propertyName1>.<propertyValue1>:true|false,
	     * 			<propertyName2>.<propertyValue2>:true|false
	     * 			....
	     * 		]
	     * 		matched:<function name to call when a rule will match for the object>
	     * 		notmatched:<function name to call when there is a change but object does not match any rules>
	     * }
	     * @example
	     */
	    var addObject = function(anObject) {
	    	this.log("addObject");
	    	this._addObject(anObject,this.getObjectProfiles());
	    };
	  
	    /**
	     * @access public
	     * @abstract log a message on the console for debug
		 * 
		 */
	    var log = function(msg) {
	    	if (!this.options.debug) return;
	        console.debug(msg);
	    }
	 
	    jamrulesConstructor.prototype = {
	    			constructor:jamrulesClass
	    			/** general API **/
	    		,	runRulesEngine:runRulesEngine
	    		,	selectConfigurationPropertyValue: selectConfigurationPropertyValue
	        	,	createRulesSet:createRulesSet
	        	,	addRule:addRule
	        	,	compileRules:compileRules
	        	,	addObject:addObject
	        	,	log:log
	        		/** Static Functions **/
	        	,	_addObject:_addObject
	        		/** Public variables **/
	        	,	propertiesConfiguration:propertiesConfiguration
	        		/** Test function for matching **/ 
	        	,	MatchProperty:MatchProperty
	        	,	MatchPropertyValue:MatchPropertyValue
	        	,	MatchProperties:MatchProperties
	        	,	MatchPropertiesSameValue:MatchPropertiesSameValue
	        	,	MatchPropertiesSameValues:MatchPropertiesSameValues
	        	,	ObjectPropertySet:ObjectPropertySet
	        	,	ConfigurationPropertySet:ConfigurationPropertySet
	        	,	ObjectPropertiesSameValue:ObjectPropertiesSameValue
	        	,	ObjectPropertiesSameValues:ObjectPropertiesSameValues
	        	,	ConfigurationPropertiesSameValue:ConfigurationPropertiesSameValue
	        	,	ConfigurationPropertiesSameValues:ConfigurationPropertiesSameValues
	        	,	MatchExternalRule:MatchExternalRule
	    }; 
	
	
	    return (new jamrulesConstructor(aJqueryObj,options));
	};
	
	var jamRulesArray=[];
	
	/**
	 * builder of instance of a jamrules engine from the jamrulesClass definition
	 */
	var jamRulesBuilder = function(aJqueryObj,options){
		
		//initialisation of jamrules and its configurator
		id=jamRulesArray.length;

		return new jamrulesClass(aJqueryObj,options);

	};
	
	/**
	 * api of jamrules:
	 * 
	 * jamrules.build(aJqueryObj,options)
	 */
	var API = {};
	API.build = jamRulesBuilder;
	return API;
	
})();
