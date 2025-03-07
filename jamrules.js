/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS - France
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : jamrules.js
 *
 *
 * -----------------------------------------------------------------------------------------
 * Modifications :
 * - 20250224 - E.Podvin - V2.5.3 - use 'let' instead of 'var' to declare variables
 * - 20250220 - E.Podvin - V2.5.2 - fix search in MatchPropertySearch
 * - 20210509 - E.Podvin - V2.5.1 - fix on start/stopProcessing
 * - 20210508 - E.Podvin - V2.5.0 - add startProcessing and stopProcessing
 * - 20210507 - E.Podvin - V2.4.0
 *    - !!selectConfigurationPropertyValue is renamed checkConfigurationPropertyValue !!
 *    - selectConfigurationPropertyValue: select a value as a radio would do (unselecting other values)
 *    - checkConfigurationPropertyValue: set a value as a checkbox would do
 *    - resetConfigurationPropertyValues: reset all values of a property
 * - 20210504 - E.Podvin - V2.3.0 -
 *   - add MatchPropertySearch test with wildcard
 *   - add resetConfigurationProperty
 *   - add '*' as a property value to match any value of a property of the configurator
 * - 20210418 - E.Podvin - V2.2.0 - add addPropertyObjects
 * - 20170402 - E.Podvin - V2.1.0 - adding new objects simplified + possibility to call matching rule functions
 * - 20170331  - E.Podvin - V2.0.0 - Refactoring
 * - 20170227  - E.Podvin - V1.0.0 - Creation
 *
 * -----------------------------------------------------------------------------------------
 *
 * @copyright Intersel 2017-2025
 * @fileoverview :
 * @see {@link https://github.com/intersel/jamrules}
 * @author : Emmanuel Podvin - emmanuel.podvin@intersel.fr
 * @version : 2.5.3
 * -----------------------------------------------------------------------------------------
 */

/**
 * How to use it :
 * ===============
 *
 * see README.md content or consult it on https://github.com/intersel/jamrules
 */

var jamrules = (function() {


  /**
   * @param ObjectProfiles
   * @access private
   * @abstract list of possible profiles available to all rules
   * used as optimization to process filtering on object profiles rather than on each objects...
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
  let ObjectProfiles = {};


  /**
   * private
   * private jQuery object for iFSM when not given
   */
  let aDefaultJqueryObj;
  let randomSessionId = $.md5(Math.random());
  if (!$('html').attr("id")) $('html').attr("id", "jamrules" + randomSessionId)
  aDefaultJqueryObj = $("html");


  /**
   * @access private
   * @abstract get the key to access to the object profile of an object
   * @return a md5 key for a json object
   *
   */
  let getObjectProfileKey = function(anObject) {
    return $.md5(JSON.stringify(anObject.propertiesSet));
  }
  /**
   * @access private
   * @abstract add a new object profile if the one defines by anObject does not exist
   *
   */
  let addObjectProfile = function(objectKey, anObject, anObjectProfiles) {
    if (!anObjectProfiles) anObjectProfiles = ObjectProfiles;
    if (!anObjectProfiles[objectKey]) anObjectProfiles[objectKey] = {
      propertiesSet: anObject.propertiesSet,
      objectsList: []
    };
  }
  /**
   * @access private
   * @abstract add a new element to the element profiles array
   *
   */
  let addObjectToObjectProfilesArray = function(objectKey, anObject, anObjectProfiles) {
    if (!anObjectProfiles) anObjectProfiles = ObjectProfiles;
    anObjectProfiles[objectKey]['objectsList'].push(anObject);
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
   * 		],
   * 		matched:<function name to call when a rule will match for the object>,
   * 		notmatched:<function name to call when there is a change but object does not match any rules>
   * }
   * @example
   */
  let _addObject = function(anObject, anObjectProfiles) {
    if (!anObject) {
      alert("object is void...?");
      return;
    }
    if ((!anObject.propertiesSet) || (Object.keys(anObject.propertiesSet).length === 0)) {
      alert("object has no properties...?");
      return;
    }
    let objectKey = getObjectProfileKey(anObject);
    addObjectProfile(objectKey, anObject, anObjectProfiles);
    addObjectToObjectProfilesArray(objectKey, anObject, anObjectProfiles);
  };


  /**
   * @function public static _translateToJamrulesProperties
   * @abstract translate an object with properties to a propertiessSet compliant with jamrules..
   * @return anObject: object
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
   * remarks:
   * - the property value of an object may be a numeric, string or an array of values (multiple values)
   * @example
   */
  let _translateToJamrulesProperties = function(anObject) {
    let aPropertiesSet = {};

    for (let aProperty in anObject) {
      aPropertiesSet[aProperty] = {};
      if (Array.isArray(anObject[aProperty]))
      {
        anObject[aProperty].map(aPropertyValue => aPropertiesSet[aProperty][aPropertyValue] = 1);
      }
      else
      {
        aPropertiesSet[aProperty][anObject[aProperty]] = 1;
      }
      aPropertiesSet[aProperty]['*'] = 1;
    };
    return aPropertiesSet;

  };

  let jamrulesClass = function(options) {


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
    let propertiesConfiguration = {};

    /**
     * @param matchRuleTemplate
     * @abstract template to create new rule in the state definition of the rules engine
     */
    let matchRuleTemplate = {
      submachine: {
        startTesting: {
          enterState: {
            next_state: 'ruleMatch', //default state that will end the process
          },
        },
        ruleMatch: {
          enterState: {
            propagate_event: 'testRuleDone'
          },
        },
        ruleDontMatch: {
          enterState: {
            propagate_event: 'testRuleDone'
          }
        },
        DefaultState: {
          catchEvent: 'startTestingRules',
          startTestingRules: {
            next_state: 'startTesting',
          },
          ruleDontMatch: {
            next_state: 'ruleDontMatch',
            prevent_bubble: true
          },
          testRuleDone: {
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
    let stateRuleTemplate = {
      enterState: {
        process_event_if: 'this.opts.jamrules.aMatchingTest()',
        propagate_event_on_refused: 'ruleDontMatch',
        propagate_event_on_localmachine: true,
        next_state: '',
      }
    };

    /**
     * @param myRulesEngineStates
     * @access private
     * @abstract states definition of the rule engine that handles the rule testing process
     */
    let myRulesEngineStates = {
      TestRules: {
        enterState: {
          init_function: function() {
            if (!this.opts.TestRules) this.opts.TestRules = {};
            this.opts.TestRules.nbRulesTested = 0;
            this.opts.TestRules.nbRulesToTest = Object.keys(this._stateDefinition.TestRules
              .testRuleDone
              .next_state_on_target
              .submachines).length;
            this.opts.jamrules.log('nb rules to test:' + this.opts.TestRules.nbRulesToTest,3);
          },
        },
        delegate_machines: {
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
        testRuleDone: {
          init_function: function() {
            this.opts.jamrules.log("-->" + this.currentState + ' ' + this.receivedEvent,3);
            this.opts.TestRules.nbRulesTested++;

            this.opts.reason = {};
          },
          next_state_on_target: {
            condition: '||',
            submachines: {
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
          next_state: 'ruleMatch',
          propagate_event: 'giveMatchResult',
          propagate_event_on_localmachine: true,

        },
        giveMatchResult: {
          init_function: function(data, aEvent, aPropertyConfiguration) {
            this.opts.jamrules.log("-->" + this.currentState + ' ' + this.receivedEvent,3);
          },
          process_event_if: 'this.opts.TestRules.nbRulesTested >= this.opts.TestRules.nbRulesToTest',
          propagate_event: 'giveMatchResult',
          next_state: 'ruleDontMatch',
          propagate_event_on_localmachine: true,

        },

      },
      /**
       * State ruleMatch
       */
      ruleMatch: {
        giveMatchResult: {
          init_function: function(data, aEvent, aPropertyConfiguration) {
            this._log('Element profile matched',3);
            //alert("match");
          },
          propagate_event: 'updateObjectsMatch',
          next_state: 'updateObjects',

        },

      },
      /**
       * State ruleDontMatch
       */
      ruleDontMatch: {
        giveMatchResult: {
          init_function: function(data, aEvent, aPropertyConfiguration) {
            this._log('Object profile did not match',3);
            //alert("don't match");
          },
          propagate_event: 'updateObjectsDontMatch',
          next_state: 'updateObjects',
          out_function: function() {},

        },

      },
      /**
       * State updateObjects
       */
      updateObjects: {
        updateObjectsMatch: {
          init_function: function() {
            for (aSubMachine in this._stateDefinition.TestRules.delegate_machines) {
              this.opts.jamrules.log("-->" + aSubMachine,3);
              this.opts.reason[aSubMachine] = this._stateDefinition.TestRules.delegate_machines[aSubMachine].myFSM.currentState;
              //not needed 				this.opts.reason[aSubMachine]+=':'+this._stateDefinition.TestRules.delegate_machines[aSubMachine].myFSM.lastState;
            }
            let thisme = this
            $.each(this.opts.reason, function(index, value) {
              if (value.indexOf("DefaultState") == -1)
                thisme.opts.jamrules.log("Match reason: State " + index + " --> " + value,3);
            });

            if (this.opts.jamrules.options.matched) {
              this.opts.jamrules.options.matched.apply(thisme.opts.jamrules, [this.opts.objectProfile.objectsList]);
            }

            if (this.opts.objectProfile.objectsList[0].matched)
              for (anObject in this.opts.objectProfile.objectsList) {
                this.opts.objectProfile.objectsList[anObject].matched(thisme.opts.jamrules);
              }

          },
          propagate_event: 'testRules',
          next_state: 'waitTestRules',
          out_function: function() {},
        },
        updateObjectsDontMatch: {
          init_function: function() {
            this.opts.reason = {};
            for (aSubMachine in this._stateDefinition.TestRules.delegate_machines) {
              this.opts.jamrules.log("-->" + aSubMachine,3);
              this.opts.reason[aSubMachine] = this._stateDefinition.TestRules.delegate_machines[aSubMachine].myFSM.currentState;
              this.opts.reason[aSubMachine] += ':' + this._stateDefinition.TestRules.delegate_machines[aSubMachine].myFSM.lastState;
            }
            let thisme = this
            $.each(this.opts.reason, function(index, value) {
              if (value.indexOf("DefaultState") == -1)
                thisme.opts.jamrules.log("Don't Match reason: State " + index + " --> " + value,3);
            });

            if (this.opts.jamrules.options.notmatched) {
              this.opts.jamrules.options.notmatched.apply(thisme.opts.jamrules, [this.opts.objectProfile.objectsList]);
            }
            if (this.opts.objectProfile.objectsList[0].notmatched)
              for (anObject in this.opts.objectProfile.objectsList) {
                this.opts.objectProfile.objectsList[anObject].notmatched(thisme.opts.jamrules);
              }

          },
          propagate_event: 'testRules',
          next_state: 'waitTestRules',
        }

      },
      /**
       * State waitTestRules
       */
      waitTestRules: {
        /*
         * event to emit when a property changed in the configuration
         * Initializes the rule engine for testing the rules against the current configuration and the different element profiles
         *
         * event should send a 'aPropertyConfiguration' data object as:
         * {propertyName:<aPropertyName>,propertyValue:<aPropertyValue>,status:<aStatus>}
         */
        propertyChange: {
          init_function: function(data, aEvent, aPropertyConfiguration) {
            //initialize the element profiles to process
            this.opts.objectProfileId = -1;
            this.opts.aPropertyConfiguration = aPropertyConfiguration;
            this.opts.ObjectProfiles = this.opts.jamrules.getAllObjectProfiles();
            this.opts.maxObjectProfiles = Object.keys(this.opts.ObjectProfiles).length;
            // start processing rules on the element profiles list
            if (this.opts.maxObjectProfiles > 0)
            {
              this.trigger('startProcessing');
              let propertyNameEvent = this.opts.aPropertyConfiguration.propertyName;
              let that=this;
              $.doTimeout('testRules'+that.FSMName,100,function(){
                that.trigger(propertyNameEvent);
              });
            }
          },
        },
        /*
         * event to emit to run a test without a change on the configurator
         *
         */
        runEngine: {
          init_function: function() {
            //initialize the element profiles to process
            this.opts.objectProfileId = -1;
            this.opts.aPropertyConfiguration = {
              propertyName: 'dummyEvent'
            };
            this.opts.ObjectProfiles = this.opts.jamrules.getAllObjectProfiles();
            this.opts.maxObjectProfiles = Object.keys(this.opts.ObjectProfiles).length;
            // start processing rules on the element profiles list
            if (this.opts.maxObjectProfiles > 0)
            {
              this.trigger('startProcessing');
              let that=this;
              $.doTimeout('testRules'+that.FSMName,10,function(){
                that.trigger('testRules')
              });
            }
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
        testRules: {
          next_state_when: "this.opts.objectProfileId  < this.opts.maxObjectProfiles",
          next_state: 'TestRules',
          init_function: function(data, aEvent) {
            this.opts.objectProfileId++;
            if (this.opts.objectProfileId < this.opts.maxObjectProfiles) {
              this.opts.objectProfile = this.opts.ObjectProfiles[Object.keys(this.opts.ObjectProfiles)[this.opts.objectProfileId]];
              this.trigger(this.opts.aPropertyConfiguration.propertyName);
            }
            else{
              this.trigger('stopProcessing');
            }
          },

        },
      },
      DefaultState: {
        start: //a default start event received at the FSM start
        {
          next_state: "waitTestRules"
        },
        testRuleDone: {
          //dummy to catch it
        },
        startProcessing: {
          init_function: function() {
            if (this.opts.jamrules.options.startProcessing)
              this.opts.jamrules.options.startProcessing(this.opts.jamrules);
          }
        },
        stopProcessing: {
          init_function: function() {
            if (this.opts.jamrules.options.stopProcessing)
              this.opts.jamrules.options.stopProcessing(this.opts.jamrules);
          }
        },

      }
    };


    /**
     * jamrulesConstructor
     *
     * constructor of a jamRules object
     *
     */
    let jamrulesConstructor = function(options) {


      // variables and functions private unless attached to API below
      // 'this' refers to global window

      let defaults = {
        debug: false,
        LogLevel: 1,
        matchedFunctionName: "matched",
        notmatchedFunctionName: "notmatched"
      };

      /**
       * @param options - options given to jamrules
       * @access public
       */
      if (this.options == undefined) this.options = {
        jqueryObj: aDefaultJqueryObj
      };
      this.options = jQuery.extend({}, defaults, options || {});


      /**
       * @param myRulesEngine - the FSM engine bound to the jamrules
       * @access public
       */
      this.myRulesEngine = null;


      /**
       * @param myJqueryObj - the jquery object on which jamrules is bound
       * @access public
       */
      this.myJqueryObj = options.jqueryObj;


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
      let _ObjectProfiles = {};

      /**
       * getObjectProfiles - get the current object profiles bound to this rule engine
       * @access public
       *
       */
      this.getObjectProfiles = function() {
        return _ObjectProfiles;
      }

      /**
       * getAllObjectProfiles - get all the object profiles (shared and of the current instance) bound to this rule engine
       * @access public
       *
       */
      this.getAllObjectProfiles = function() {
        return $.extend({}, ObjectProfiles, this.getObjectProfiles());
      }

      /**
       * wildcardSearch - look for a string with wildcards in an other string
       * @access public
       * @param {string} str - string to test
       * @param {string} wildcardStr
       * checks if a string match to wildcardStr
       * Wildcards are: * as zero to unlimited numbers - ? as zero to one character
       * @param  {[type]} regexOptions default:gmi, regex options
       * @returns {boolean}
       *
       *   "a*b" => everything that starts with "a" and ends with "b"
       *   "a*"  => everything that starts with "a"
       *   "*b"  => everything that ends with "b"
       *   "*a*" => everything that has an "a" in it
       *   "*a*b*"=> everything that has an "a" in it, followed by anything, followed by a "b", followed by anything
       *
       */
      this.wildcardSearch = function(str, wildcardStr,regexOptions) {
        regexOptions = regexOptions || 'gim';
        const escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/gi, "\\$1");
        return new RegExp("^" + regexReplaceHelper(wildcardStr, {"*": ".*", "?": ".?"}, escapeRegex) + "$",regexOptions).test(str);
      }

      /**
       * translate a string with wildcards in a regex
       * @access private
       * @param  {string} input        a string with wildcards
       * eg "a*b"
       * @param  {object} replace_dico object giving the how to translate a wildcard to a regex
       * eg: {"*": ".*", "?": ".?"}
       * @param  {function} last_map   a function to apply to string parts with no wildcard
       * @return {string}              a regex expression
       */
      let regexReplaceHelper = function(input, replace_dico, last_map) {
        let replace_dict = Object.assign({}, replace_dico);
        if (Object.keys(replace_dict).length === 0) {
          return last_map(input);
        }
        const split_by = Object.keys(replace_dict)[0];
        const replace_with = replace_dict[split_by];
        delete replace_dict[split_by];
        return input.split(split_by).map((next_input) => regexReplaceHelper(next_input, replace_dict, last_map)).join(replace_with);
      }

      /**
       * wildcardSearchInPropertyObject Search if a string is contained in one of the proporty values of the object
       * @access public
       * @param  {string} aString    a string (possible wildcards: '*' or '?') to find in one of the property values
       * @param  {object} jsonObj    an object to test
       * @param  {boolean} searchDeep default:false - if true, search all the levels in the object
       * @return {boolean} true if found
       */
      this.wildcardSearchInPropertyObject = function(aString,jsonObj,searchDeep)
      {
          let found = false;
          searchDeep = searchDeep?true:false;
          for (let i in jsonObj) {
            if (searchDeep && (typeof jsonObj[i] == 'object') && wildcardSearchInPropertyObject(aString, jsonObj[i])) {
              found = true
              break;
            } else
              //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
              if (wildcardSearch(jsonObj[i], aString)) {
                found = true
                break;
              }
          }//end for
          return found;
      }


    };



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
    let MatchProperty = function(aPropertyName) {
      let propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      if (propertiesConfiguration[aPropertyName] && propertiesObjectProfile[aPropertyName]) {
        for (aPropertyValue in propertiesObjectProfile[aPropertyName]) {
          if (
            (propertiesConfiguration[aPropertyName][aPropertyValue]) &&
            (propertiesObjectProfile[aPropertyName][aPropertyValue]) &&
            (propertiesObjectProfile[aPropertyName][aPropertyValue] == propertiesConfiguration[aPropertyName][aPropertyValue])
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
    let MatchPropertyValue = function(aPropertyName, aPropertyValue) {
      let propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;
      if (
        (propertiesConfiguration[aPropertyName]
          && propertiesObjectProfile[aPropertyName])
          && (propertiesConfiguration[aPropertyName][aPropertyValue]
          && propertiesObjectProfile[aPropertyName][aPropertyValue])
          && (propertiesConfiguration[aPropertyName][aPropertyValue] == propertiesObjectProfile[aPropertyName][aPropertyValue])
      )
        return true;
      else return false;
    }

    /**
     * @function MatchPropertySearch
     **access public
     * @abstract matching rule function, tests if a string aPropertyName is found as a property value of objects =
     * @param aPropertyName: a string to search in the property values of objects.
     *   wildcards are possible: '*' (0 or more char), '?' (0 or 1 char)
     *   eg: 'my*propert?' will match 'myproperty','mygivenpropert','myREDproperts'
     *                     won't match 'property', 'myREDproperties'
     *
     * @param searchMode: default:'or'
     *  - or: blank are considered as 'or' operator between keywords to find
     *  - and: blank are considered as 'and' operator with all keywords to be found in any property values
     * @return returns true if the pattern string(s) defined in the configurator are found in property values of object
     * @remark generally used for text input as search input
     * @example
     *  object.priority.priority1=1
     *  object.technician.technician1=1
     *  configuration.priority['prio*']=1
     *  configuration.technician['technician2']=1
     *  MatchPropertySearch('priority') -> match
     *  MatchPropertySearch('technician') -> no match
     */
    let MatchPropertySearch = function(aPropertyName, searchMode) {
      searchMode =  searchMode || 'or';
      let propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      let nbfound = 0;
      let nbtofind = 0;
      let found = false;
      let that = this;

      for (searchString in propertiesConfiguration[aPropertyName]) {
        if (!propertiesConfiguration[aPropertyName][searchString]) continue;// not active
        found = false;

        searchString.split(" ").some(function (searchSubString) {
          nbtofind++;
          for (aObjPropertyValue in propertiesObjectProfile[aPropertyName]) {
            if (aObjPropertyValue != '*'
              && propertiesObjectProfile[aPropertyName][aObjPropertyValue]
              && that.wildcardSearch(aObjPropertyValue, searchSubString)
            ) {
              found = true;
              break;
            }
          }
          if (found) {
            if (searchMode == 'or') return true;
            nbfound++;
            return false;
          }
        });

        if (found && (searchMode == 'or')) return true;
      }

      return (nbfound >= nbtofind);
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
    let MatchExternalRule = function(aRule) {
      let propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      let resultTest = eval(aRule);

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
    let MatchPropertiesSameValue = function(aConfigurationPropertyName, anObjectPropertyName, aPropertyValue) {
      let propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      //if undefined, means that we want that one of the property value of object is set in the configuration too
      if (aPropertyValue == undefined) {
        for (aPropertyValue in propertiesObjectProfile[anObjectPropertyName]) {
          if (
            (propertiesConfiguration[aConfigurationPropertyName] && propertiesObjectProfile[anObjectPropertyName]) &&
            (propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] && propertiesObjectProfile[anObjectPropertyName][aPropertyValue])
            //    	    		&& 	(propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] == propertiesObjectProfile[anObjectPropertyName][aPropertyValue])
          ) {
            return true;
          }
        }

        return false;

      } else if (
        (propertiesConfiguration[aConfigurationPropertyName] && propertiesObjectProfile[anObjectPropertyName]) &&
        (propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] && propertiesObjectProfile[anObjectPropertyName][aPropertyValue])
        //    		&& 	(propertiesConfiguration[aConfigurationPropertyName][aPropertyValue] == propertiesObjectProfile[anObjectPropertyName][aPropertyValue])
      ) {
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
    let MatchPropertiesSameValues = function(aConfigurationPropertyName, anObjectPropertyName) {

      let propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      // we can process only if the property has only one value
      if (propertiesObjectProfile[anObjectPropertyName])
        for (aPropertyValue in propertiesObjectProfile[anObjectPropertyName]) {
          //one of the value is not ok=> does not share their values setting
          if (!MatchPropertiesSameValue(aConfigurationPropertyName, anObjectPropertyName, aPropertyValue))
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
    let MatchProperties = function(aConfigurationPropertyName, anObjectPropertyName) {
      propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      if (
        (propertiesConfiguration[aConfigurationPropertyName] && propertiesObjectProfile[anObjectPropertyName])
      ) {
        for (anObjectPropertyValue in propertiesObjectProfile[anObjectPropertyName]) {
          if (
            (propertiesObjectProfile[anObjectPropertyName][anObjectPropertyValue]) &&
            (propertiesConfiguration[aConfigurationPropertyName][anObjectPropertyValue])
            //    				&&	(propertiesObjectProfile[anObjectPropertyName][anObjectPropertyValue] == propertiesConfiguration[aConfigurationPropertyName][anObjectPropertyValue])
          ) {
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
    let ConfigurationPropertySet = function(aPropertyName, aPropertyValue, valueSet) {
      if (valueSet == undefined) valueSet = 1;
      if (
        (propertiesConfiguration[aPropertyName] !== undefined) &&
        (propertiesConfiguration[aPropertyName][aPropertyValue] !== undefined) &&
        (propertiesConfiguration[aPropertyName][aPropertyValue] == valueSet)
      )
        return true;
      else return false;
    }

    /**
     * @function ObjectPropertySet
     * @access public
     * @abstract matching rule function, tests if the property in theObjectPropertySet has its value set
     * @param  aPropertyName: an element property name
     * @param  aPropertyValue: a value of aPropertyName
     * @param  valueSet: [0|1(default)]
     *
     * @return returns true if the configuration for the aPropertyName.aPropertyValue == valueSet
     */
    let ObjectPropertySet = function(aPropertyName, aPropertyValue, valueSet) {
      propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      if (valueSet == undefined) valueSet = 1;
      if (
        (propertiesObjectProfile[aPropertyName] !== undefined) &&
        (propertiesObjectProfile[aPropertyName][aPropertyValue] !== undefined) &&
        (propertiesObjectProfile[aPropertyName][aPropertyValue] == valueSet)
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
    let ObjectPropertiesSameValue = function(aPropertyName1, aPropertyName2, aPropertyValue) {
      propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      //if undefined, means that we want that one value of the property 1 and property 2 of object are set
      if (aPropertyValue == undefined) {
        if (propertiesObjectProfile[aPropertyName1]  !== undefined)
          for (aPropertyValue in propertiesObjectProfile[aPropertyName1]) {
            if (
              (propertiesObjectProfile[aPropertyName2]  !== undefined) &&
              (propertiesObjectProfile[aPropertyName1][aPropertyValue] && propertiesObjectProfile[aPropertyName2][aPropertyValue])
            ) {
              return true;
            }
          }

        return false;

      } else if (
        (propertiesObjectProfile[aPropertyName1]) &&
        (propertiesObjectProfile[aPropertyName1][aPropertyValue]) &&
        (propertiesObjectProfile[aPropertyName2]) &&
        (propertiesObjectProfile[aPropertyName2][aPropertyValue])
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
    let ObjectPropertiesSameValues = function(aPropertyName1, aPropertyName2) {
      let propertiesObjectProfile = this.myRulesEngine.opts.objectProfile.propertiesSet;

      // we can process only if the property has only one value
      if (propertiesObjectProfile[aPropertyName1])
        for (aPropertyValue in propertiesObjectProfile[aPropertyName1]) {
          //one of the value is not ok=> does not share their values setting
          if (!ObjectPropertiesSameValue(aPropertyName1, aPropertyName2, aPropertyValue))
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
    let ConfigurationPropertiesSameValue = function(aPropertyName1, aPropertyName2, aPropertyValue) {
      //if undefined, means that we want that one of the property value of object is set in the configuration too
      if (aPropertyValue == undefined) {
        if (propertiesConfiguration[aPropertyName1])
          for (aPropertyValue in propertiesConfiguration[aPropertyName1]) {
            if (
              (propertiesConfiguration[aPropertyName2]) &&
              (propertiesConfiguration[aPropertyName1][aPropertyValue] && propertiesConfiguration[aPropertyName2][aPropertyValue])
            ) {
              return true;
            }
          }

        return false;

      } else if (
        (propertiesConfiguration[aPropertyName1]) &&
        (propertiesConfiguration[aPropertyName1][aPropertyValue]) &&
        (propertiesConfiguration[aPropertyName2]) &&
        (propertiesConfiguration[aPropertyName2][aPropertyValue])
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
    let ConfigurationPropertiesSameValues = function(aPropertyName1, aPropertyName2) {
      // we can process only if the property has only one value
      if (propertiesConfiguration[aPropertyName1])
        for (aPropertyValue in propertiesConfiguration[aPropertyName1]) {
          //one of the value is not ok=> does not share their values setting
          if (!ConfigurationPropertiesSameValue(aPropertyName1, aPropertyName2, aPropertyValue))
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
    let createRulesSet = function(aRulesGroup, ruleEvents) {
      this.log("createRulesSet(aRulesGroup, ruleEvents): " + aRulesGroup + " - " + ruleEvents,3);
      let testRules = myRulesEngineStates.TestRules;
      let waitTestRules = myRulesEngineStates.waitTestRules;
      if (!testRules.delegate_machines[aRulesGroup]) {
        testRules.delegate_machines[aRulesGroup] = $.extend(true, {}, matchRuleTemplate);

        if (ruleEvents)
          ruleEvents.forEach(function(aEvent) {
            waitTestRules[aEvent] = "testRules";
          });

        testRules.testRuleDone.next_state_on_target.submachines[aRulesGroup] = {
          target_list: ['ruleMatch']
        };
      } else {
        this.log("createRulesSet: " + aRulesGroup + " still declared! nothing done",2);
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
     */
    let addRule = function(aRulesGroup, aRuleName, aRuleTest, overloadRule) {
      this.log("addRule(aRulesGroup, aRuleName, aRuleTest): " + aRulesGroup + " - " + aRuleName + "-" + aRuleTest,3);
      let testRules = myRulesEngineStates.TestRules;

      if (!overloadRule) overloadRule = false;

      if (!testRules.delegate_machines[aRulesGroup]) {
        if (this.options.debug) alert(aRulesGroup + " needs to be previously created with createRulesSet function");
        return;
      }

      //create the new state called "aRuleName" for the rule
      if (!overloadRule && testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName]) {
        if (this.options.debug) alert(aRuleName + " still exists and can not be overloaded");
        return;
      }
      testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName] = $.extend(true, {}, stateRuleTemplate);
      // activate the test
      if (aRuleTest.charAt(0) == '!') aRuleTest = '!' + 'this.opts.jamrules.' + aRuleTest.slice(1);
      else aRuleTest = 'this.opts.jamrules.' + aRuleTest;
      testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName].enterState.process_event_if = aRuleTest;

      // modify the rules chain
      theNextRuleState = testRules.delegate_machines[aRulesGroup]['submachine'].startTesting.enterState.next_state;
      testRules.delegate_machines[aRulesGroup]['submachine'][aRuleName].enterState.next_state = theNextRuleState;
      testRules.delegate_machines[aRulesGroup]['submachine'].startTesting.enterState.next_state = aRuleName;

    }


    /**
     * @function runRulesEngine
     * @access public
     * @abstract run the rules engine
     * @return void
     */
    let runRulesEngine = function() {
      this.log("runRulesEngine",3);
      if (!this.myRulesEngine || $.isEmptyObject(this.myRulesEngine)) {
        this.log("Rules engine is not started. Call first compile rules (cf compileRules())",2);
        this.myRulesEngine = {};
        this.compileRules();
        //return;
      }
      this.myRulesEngine.trigger('runEngine');

    }

    /**
     * @function checkConfigurationPropertyValue
     * @access public
     * @abstract set a property/property value status in the rules configurator
     *           designed for checkboxes/multiple select
     * @param aPropertyName: name of the property that has changed
     * @param aProperyValue: value of the property
     * @param aStatus: [boolean] status of the property for this property value set or not
     * @param doTest: [boolean] [default:true] if false, configure the configurator but does not run the rules engine test
     * @return void
     */
    let checkConfigurationPropertyValue = function(aPropertyName, aPropertyValue, aStatus, doTest) {
      this.log("checkConfigurationPropertyValue(aPropertyName,aPropertyValue,aStatus):" + aPropertyName + ',' + aPropertyValue + ',' + aStatus,3);
      if (aStatus == undefined) aStatus = false;
      if (doTest == undefined) doTest = true;

      let statusChanged = true;

      if (propertiesConfiguration[aPropertyName] &&
        propertiesConfiguration[aPropertyName][aPropertyValue] &&
        propertiesConfiguration[aPropertyName][aPropertyValue] == aStatus
      )
        statusChanged = false;

      if (!propertiesConfiguration[aPropertyName]) propertiesConfiguration[aPropertyName] = {};

      propertiesConfiguration[aPropertyName][aPropertyValue] = aStatus;
      if (this.myRulesEngine && doTest && statusChanged) this.myRulesEngine.trigger('propertyChange', {
        propertyName: aPropertyName,
        propertyValue: aPropertyValue,
        status: aStatus
      });
      else if (!this.myRulesEngine) {
        if (this.options.debug) alert("Rules engine is not started. Call first compile rules (cf compileRules())");
        return;
      }


    }

    /**
     * @function selectConfigurationPropertyValue
     * @access public
     * @abstract set a property/property value status in the rules configurator
     *           designed for radio/exclusive select
     * @param aPropertyName: name of the property that has changed
     * @param aProperyValue: value of the property
     * @param doTest: [boolean] [default:true] if false, configure the configurator but does not run the rules engine test
     * @return void
     */
    let selectConfigurationPropertyValue = function(aPropertyName, aPropertyValue, doTest) {
      this.log("selectConfigurationPropertyValue(aPropertyName,aPropertyValue):" + aPropertyName + ',' + aPropertyValue , 3);
      if (doTest == undefined) doTest = true;

      if (!propertiesConfiguration[aPropertyName]) propertiesConfiguration[aPropertyName] = {};

      this.resetConfigurationPropertyValues(aPropertyName);

      // set the one...
      propertiesConfiguration[aPropertyName][aPropertyValue] = true;

      if (this.myRulesEngine && doTest) this.myRulesEngine.trigger('propertyChange', {
        propertyName: aPropertyName,
        propertyValue: aPropertyValue,
        status: true
      });
      else if (!this.myRulesEngine) {
        if (this.options.debug) alert("Rules engine is not started. Call first compile rules (cf compileRules())");
        return;
      }
    }
    /**
     * @function resetConfigurationPropertyValues
     * @access public
     * @abstract reset a property by setting all its property values to a false status in the rules configurator
     * @param aPropertyName: name of the property that has changed
     * @return void
     */
    let resetConfigurationPropertyValues = function(aPropertyName) {
      this.log("resetConfigurationPropertyValues(aPropertyName):" + aPropertyName,3);
      //unset all property's values
      for (propertyValue in propertiesConfiguration[aPropertyName]) {
        propertiesConfiguration[aPropertyName][propertyValue]=false;
      }

    }

    /**
     * @function resetConfigurationProperty
     * @access public
     * @abstract reset a property completely
     * @param aPropertyName: name of the property to reset
     * @return void
     */
    let resetConfigurationProperty = function(aPropertyName) {
      this.log("resetConfigurationProperty(aPropertyName):" + aPropertyName,3);
      propertiesConfiguration[aPropertyName] = {};
    }

    /**
     * @function compileRules
     * @abstract initialize the rule engine - to do before action and after adding the rules
     */
    let compileRules = function() {
      this.log("compileRules",3);
      let jamrules = this;
      this.myJqueryObj.iFSM(myRulesEngineStates, {
        debug: this.options.debug,
        logLevel: this.options.logLevel,
        jamrules: jamrules
      });
      let myRulesEngine = this.myJqueryObj.getFSM(myRulesEngineStates);

      this.myRulesEngine = myRulesEngine;
    }

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
    let addObject = function(anObject) {
      this.log("addObject",3);
      _addObject(anObject, this.getObjectProfiles());
    };

    /**
     * @function public addPropertyObject
     * @abstract add an object to the list of objects to test against rules
     * @param anObject: object with its properties plus optionnaly these following
     * 		matched (otion):<function name to call when a rule will match for the object>
     * 		notmatched (option):<function name to call when there is a change but object does not match any rules>
     * @param aMatchingFunction (option): the matching function, same as to define the "matched" property in the object
     * @param aNotMatchingFunction (option): the matching function, same as to define the "notmatched" property in the object
     * @example
     */
    let addPropertyObject = function(anObject, aMatchingFunction, aNotMatchingFunction) {
      this.log("addPropertyObject",3);
      if (!aMatchingFunction && anObject[this.options.matchedFunctionName])
      {
        aMatchingFunction = anObject[this.options.matchedFunctionName];
        delete(anObject[this.options.matchedFunctionName]);
      }

      if (!aNotMatchingFunction && anObject[this.options.notmatchedFunctionName])
      {
        aNotMatchingFunction = anObject[this.options.notmatchedFunctionName];
        delete(anObject[this.options.notmatchedFunctionName]);
      }


      _addObject({
        propertiesSet: jamrules._translateToJamrulesProperties(anObject),
        matched: aMatchingFunction,
        notmatched: aNotMatchingFunction
      }, this.getObjectProfiles());
    };
    /**
     * @function public addPropertyObjects
     * @abstract add objects to the list of objects to test against rules
     * @param objects: array of property objects. Each object may have these properties set:
     * 		matched (option):<function name to call when a rule will match for the object>
     * 		notmatched (option):<function name to call when there is a change but object does not match any rules>
     * @param aMatchingFunction (option): the matching function, same as to define the "matched" property in the object
     * @param aNotMatchingFunction (option): the matching function, same as to define the "notmatched" property in the object
     * @example
     */
    let addPropertyObjects = function(objects, aMatchingFunction, aNotMatchingFunction) {
      this.log("addPropertyObjects",3);
      let that=this;
      objects.forEach(function(anObject) {
        if (!aMatchingFunction && anObject[this.options.matchedFunctionName])
        {
          aMatchingFunction = anObject[this.options.matchedFunctionName];
          delete(anObject[this.options.matchedFunctionName]);
        }

        if (!aNotMatchingFunction && anObject[this.options.notmatchedFunctionName])
        {
          aNotMatchingFunction = anObject[this.options.notmatchedFunctionName];
          delete(anObject[this.options.notmatchedFunctionName]);
        }

        let theObject = anObject;
        _addObject({
          propertiesSet: jamrules._translateToJamrulesProperties(anObject),
          matched: aMatchingFunction,
          notmatched: aNotMatchingFunction,
          object:theObject
        }, that.getObjectProfiles());
      });
    };

    /**
     * this._log - log function
     * private function
     * @param message - message to log
     * @param error_level (default : 3)
     * 			- 1 : it's an error
     * 			- 2 : it's a warning
     * 			- 3 : it's a notice
     *
     */
    let log = function(message) {
      /*global console:true */

      let errorLevel = 3;

      if (arguments.length > 1) errorLevel = arguments[1];

      //show only errors if debug is not set
      if ( (errorLevel >= 2) && (!this.options.debug) ) return;

      if (errorLevel > this.options.LogLevel) return; //on ne continue que si le nv de message est <= LogLevel

      if (window.console && console.log) {
        switch (errorLevel)
        {
          case 1:
            console.error('[jamrules] ' + message);
            break;
          case 2:
            console.warn('[blapy] ' + message);
            break;
          default:
          case 3:
            console.log('[blapy] ' + message);
            break;
        }
        if ((errorLevel == 1) && this.options.alertError) alert(message);
      }

    }; //end Log


    jamrulesConstructor.prototype = {
      constructor: jamrulesClass
        /** general API **/
        ,
      runRulesEngine: runRulesEngine,
      selectConfigurationPropertyValue: selectConfigurationPropertyValue,
      checkConfigurationPropertyValue: checkConfigurationPropertyValue,
      resetConfigurationPropertyValues: resetConfigurationPropertyValues,
      resetConfigurationProperty: resetConfigurationProperty,
      createRulesSet: createRulesSet,
      addRule: addRule,
      compileRules: compileRules,
      addObject: addObject,
      addPropertyObject: addPropertyObject,
      addPropertyObjects: addPropertyObjects,
      log: log
        /** Public variables **/
        ,
      propertiesConfiguration: propertiesConfiguration
        /** Test function for matching **/
        ,
      MatchProperty: MatchProperty,
      MatchPropertyValue: MatchPropertyValue,
      MatchProperties: MatchProperties,
      MatchPropertiesSameValue: MatchPropertiesSameValue,
      MatchPropertiesSameValues: MatchPropertiesSameValues,
      MatchPropertySearch:MatchPropertySearch,
      ObjectPropertySet: ObjectPropertySet,
      ConfigurationPropertySet: ConfigurationPropertySet,
      ObjectPropertiesSameValue: ObjectPropertiesSameValue,
      ObjectPropertiesSameValues: ObjectPropertiesSameValues,
      ConfigurationPropertiesSameValue: ConfigurationPropertiesSameValue,
      ConfigurationPropertiesSameValues: ConfigurationPropertiesSameValues,
      MatchExternalRule: MatchExternalRule,
    };


    return (new jamrulesConstructor(options));
  };

  /**
   * builder of instance of a jamrules engine from the jamrulesClass definition
   */
  let jamRulesBuilder = function(options) {

    if (!options) options = {};

    if (!options.jqueryObj) options.jqueryObj = aDefaultJqueryObj;

    return new jamrulesClass(options);

  };

  /**
   * api of jamrules:
   *
   * jamrules.build(options)
   */
  let API = {
    build: jamRulesBuilder
      /** Static Functions **/
      ,
    _addObject: _addObject,
    _translateToJamrulesProperties: _translateToJamrulesProperties
  };

  return API;

})();
