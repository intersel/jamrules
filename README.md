# JamRules
Javascript/jQuery configurator to filter objects among a set of objects according to rules.

# What is JamRules?
Let's say you have a set of objects with properties and you'd like to filter them according to a user configuration of criteria and specific rules of selection... then JamRules is for you!

JamRules is a Javascript/jQuery library. 

With it, you configure:
  * a set of parameters/criteria of selection (configurator)  
  * a set of rules of matching that your objects should comply
  * a set of objects to test

Then, you run the matching processing in order to have JamRules to select the objects that match your criteria and to call a 'match' function on them.

![alt JamRules designed for the selection of objects](https://cloud.githubusercontent.com/assets/1048488/24730721/91d34c04-1a65-11e7-8fb8-9e47dec60691.jpg)

For example, connected to a dialog box of criteria managed with checkboxes, JamRules can be activated each time a criteria changes and so to alert the selected/unselected object of their new selection status.

JamRules is your object filters best friend! Ideal for product configurators, objects selection on criteria, ...

[See JamRules in action](https://demo.intersel.fr/jamrules/tests/filterDocs.html)

# Let's get started with an example...
## Create a Jamrules object
To run jamrules, you have to create first your jamrules object, then you'll be able to call its functions to create rules, add objects to test, run the test, ...

```javascript

//initialisation of jamrules and its configurator
var rulesEngine = jamrules.build();
```
 
## Define a set of objects 

I sell red and white trousers and yellow and blue shirts through different kind of packs of 2 products:
  * packs of 2 trousers
  * packs with a trouser and shirt
  * packs with two shirts
  * etc...

For the example, we will translate this description defining the "pack" as our jamrules objects with the following properties:
* property "object1" that can have the values "trouser" or "shirt"
* property "object1color" that can have the values "blue" or "yellow" or "white"
* property "object2" that can have the values "trouser" or "shirt"
* property "object2color" that can have the values "blue" or "yellow" or "white"

Here is an exemple of how a pack may defined for jamrules:
```javascript
	
var pack1={
			object1:"trouser"
		,	object2:"shirt"
		,	object1Color:"blue"
		,	object2Color:"white"
};

rulesEngine.addPropertyObject(pack1);
	
```

## Define the rules to select objects

I want to give a promo coupon for packs that
  * have two trousers 
  * but nothing if the trousers in the pack are of different colors
  * and nothing for the other kind of packs

We will translate these rules to have a coupon as following:
* object1 and object2 have to be trousers
  * AND
    * object1color has to be the same color with object2color

In Jamrules, we'll describe these rules this way:
```javascript

// rules setting
rulesEngine.createRulesSet("SameColorTrousersPack");
	// we'd like to test a pack for giving it a promo coupon because it has 2 trousers of same color
	// so, does our current pack being tested have a trouser for object1 property?
	rulesEngine.addRule("SameColorTrousersPack","O1Trouser",'ObjectPropertySet("object1","trouser")');
	// yes? ok... do we have a trouser for object2 property too in our pack?
	rulesEngine.addRule("SameColorTrousersPack","O2Trouser",'ObjectPropertiesSameValue("object1","object2")');
	// yes? ok... is the color of the trouser is of same color?
	rulesEngine.addRule("SameColorTrousersPack","O1O2SameColor",'ObjectPropertiesSameValue("object1Color","object2Color")');
	// if gone up here implies that the pack has two trousers of same color...
	// then jamrules will call the match function for this pack


// prepare the rule engine
rulesEngine.compileRules();
```

## Test your objects against the rules... 

Which packs should have a promo code?

Jamrules will be able to tell you!
* add the objects to test in jamrules
* run the test: 
  * jamrules will tell to the packs that have a two trousers with the same color that they have a coupon. 
  * It will tell to the others packs that they don't match the selection or the rules.

JamRules will select the packs that match the configuration if it respects the rules in order to give them the promo code.


### Give the function to call if objects match

To do that, just define a "matched" function on your object like in this example:

```javascript

var pack1 ={property1:20} 
pack1.matched=function(aRuleEngine){
	alert("it matches");
}
rulesEngine.addPropertyObject(pack1);
```

You can define a "notmatched" that will be called if the tested object did not match the rules...

aRuleEngine variable gives you access to the rule engine that has called the matched/unmatched function.

You may find why the object does not match by accessing aRuleEngine.ruleEngine.opts.reason.

### Run the test 

* You need first to "compile" your rules. You need to do that anytimes you change your rules...
* Then run the engine...

```javascript

// prepare the rule engine
rulesEngine.compileRules();

//
$("#msg").append("<h2>run the test to get the packs that match the rules... </h2>");
rulesEngine.runRulesEngine();
```

## Example conclusion
Of course, that's a simple example but you can now create your own rules with all the complexity you'd like... 

# Demos
no demo available :-( will come quickly!

# Create the javascript JamRules object - jamrules

```javascript

//initialisation of jamrules and its configurator
var rulesEngine = jamrules.build({
	debug:		<boolean>,
	matched:	<a function to call when the rule find a match>,
	notmatched:	<a function to call when the rule did not find a match>
	jqueryObj:	<aJqueryObject>,
});
```

## the options parameter
### debug
if true, the rule engine will send debug message on the console


### the Matched and NotMatched functions

The "matched" and "notmatched" functions are called whenever the rule engine matches an object profile.

They have the following parameters:
  * aListOfMatchedObjects: the list of objects that matched the rule

### jqueryObj -internal parameter-
jquery Object to bind with the iFSM engine.

# The JamRules Objects 
In order to test objects with jamrules, you have to give it objects to test against the rules defined in the rule engine.

These objects may be any with properties...

Internally, the objects are formatted in order to process the matching functions and rules, the internal format of your data in jamrules will be :

```javascript
{
	propertiesSet:{
		<propertyName1>:{<propertyValue1:<0|1>,<propertyValue2:<0|1>, ...},
		<propertyName2>:{<propertyValue1:<0|1>,<propertyValue2:<0|1>, ...},
		...
	},
	matched: <a function when it matches>,	
	notmatched: <a function when it does not match>,	
}
```

# The JamRules Configurator
The JamRules configurator is a special object that can be used in a rule to test a configuration of properties that have been set.

For example, let's say we have white and black trousers.
If you'd like to get only the white trousers, you can set a configurator property "color" with a "white" property value set to 1.
Then you'll be able to test this configurator property against your objects.

The **selectConfigurationPropertyValue** function allows to create and edit such entry in the configurator.


```javascript


rulesEngine.createRulesSet("SameTrousers",["color"]);
// tells to select objects that have their property "color" to "white" when the configurator has its "color/white" property set 
rulesEngine.addRule("SameTrousers","O1WhiteTrouser",'MatchPropertyValue("color","white")');
...

rulesEngine.selectConfigurationPropertyValue("color","white",1);

```

There are several matching functions that helps the tests between a configuration in the configurator and the properties of an object:
* MatchProperty
* MatchPropertyValue
* MatchProperties
* MatchPropertiesSameValue
* MatchPropertiesSameValues
* ConfigurationPropertySet
* ConfigurationPropertiesSameValue
* ConfigurationPropertiesSameValues
* MatchExternalRule
 

# The JamRules rules

## Rules set
Jamrules tests sets of rules. 

It declares an object "matched" as soon as the first set of rules is compliant with the properties of the object.

Rules are defined within a rules set.

A rules set is validated when all its rules are validated to true. 

If not, Jamrules will try the next rules set.

If none of the rules sets are validated, then the object is declared "unmatched".

We use the **createRulesSet** function to create a rules set, and the **addRule** function to add a rule in a rule set.

## Rules

A rule declares a test to try.

The test can use information on the object properties, the configurator or any other information you'd like...

JamRules has several matching functions ready to use as:
* ObjectPropertySet: tests the value of the property of the object currently tested
* ObjectPropertiesSameValue: tests the value of one property against another property...
* ... 

## Example 
```javascript
rulesEngine.createRulesSet("SameTrousers");
rulesEngine.addRule("SameTrousers","O1Trouser",'ObjectPropertySet("object1","trouser")');
rulesEngine.addRule("SameTrousers","O2Trouser",'ObjectPropertiesSameValue("object1","object2")');
rulesEngine.createRulesSet("SameShirts",["object1","object2"]);
rulesEngine.addRule("SameColorTrousersPack","O1Shirt",'ObjectPropertySet("object1","shirt")');
rulesEngine.addRule("SameColorTrousersPack","O2Shirt",'ObjectPropertiesSameValue("object1","object2")');
```
# The JamRules API

## addPropertyObject(anObject<, aMatchingFunction, aNotMatchingFunction>)

Add an object to the list of objects to test against rules.

  * object with its properties plus these optional ones
    * matched (otion): function to call when a rule will match for the object
    * notmatched (option): function to call when rules will be tested but no rules match for the object
  * aMatchingFunction (option): a matching function, same as to define the "matched" property in the object 
  * aNotMatchingFunction (option): a 'not' matching function, same as to define the "notmatched" property in the object

### Example
```javascript
ruleEngine = jamrules.build();
var anObject = {
	object1Color : "white"
};
myMatchFunction = function(){alert("Hello:"+this.object1Color)};
rulesEngine.addPropertyObject(onObject,myMatchFunction);
```

## addObject(anObject)
Add an object to the list of objects to test against rules.

### parameters  
* anObject: a object to test in jamrules in jamrules format

### Example
```javascript
ruleEngine = jamrules.build();
var anObject = {
		propertiesSet : {
			object1Color : {
				white : 1
			},
		},
		matched : myMatchFunction,
		notmatched : null
	};
rulesEngine.addObject(onObject);
```

## _addObject(anObject) - static function

Remark: to be called with jamrules variables.

Add an object to the list of objects to test against rules.
This function differs from addObject in the way that all the jamrules will share the objects added this way.
So, you include once your objects in the first jamrules object and then they will be processed by all the other rules.

### parameters  
* anObject: a object to test in jamrule 

### Example
```javascript
var anObject = {
		propertiesSet : {
			object1Color : {
				white : 1
			},
		},
		matched : myMatchFunction,
		notmatched : null
	};
jamrules._addObject(onObject);
```

## createRulesSet(aRulesGroup, ruleEvents) 
Creates a rule set.
### parameters  
* aRulesGroup: name of the rules set to create
* ruleEvents: [array] (option) a list of one or several property names used in the configurator. The rules set will be processed if a property of the configurator changes when using "selectConfigurationPropertyValue" function (see selectConfigurationPropertyValue). 

### Example
```javascript
rulesEngine.createRulesSet("SameTrousers");
...
rulesEngine.createRulesSet("SameTrousers",["aProperty1","aProperty2"]);

```

## addRule(aRulesGroup, aRuleName, aRuleTest)
Add a new "and" rule in aRulesGroup.

### parameters  
* aRulesGroup: a rule set name
* aRuleName: a rule to define in the rules set
* aRuleTest: a boolean test to evaluate

### Example
```javascript
rulesEngine.addRule("SameColorTrousersPack","O2Trouser",'ObjectPropertiesSameValue("object1","object2")');
```

## compileRules
Initialize the rule engine - to do before action and after adding the rules

### Example

```javascript
// prepare the rule engine
rulesEngine.compileRules();
```

## runRulesEngine
Run the rules engine.

### Example
```javascript
rulesEngine.runRulesEngine();
```

## selectConfigurationPropertyValue(aPropertyName,aPropertyValue,aStatus, doTest)
Set a property/property value status in the rules configurator

### parameters  
* **aPropertyName**: name of the property that has changed
* **aProperyValue**: value of the property
* **aStatus**: <boolean>  <default:false> (option) status of the property for this property value set or not
* **doTest**: <boolean> <default:true> (option) if false, configure the configurator but does not run the rules engine test

###Remarks
If "doTest" is set, the rules engine will process -only- the rules sets that have configured the "aPropertyName" in the "ruleEvents" parameter of createRulesSet function.

### Example
```javascript

	rulesEngine.createRulesSet("SameTrousers",["object1"]);
	rulesEngine.addRule("SameTrousers","Trouser",'MatchProperty("object1")');
	....
	//as 'object1' is defined in the "SameTrousers" rules set, the following line will configure the "object1" property and see the rule set "SameTrousers" processed
	rulesEngine.selectConfigurationPropertyValue("object1","trouser",1);
	...
	//no rule set to process... just configure the property in the configurator
	rulesEngine.selectConfigurationPropertyValue("object1","trouser",1,false);
	...
	//will process all the rules sets
	rulesEngine.runRulesEngine();
```


# The Available Matching Functions

## MatchProperty(aPropertyName)
Tests if at least a property value of a property is shared between the configuration and the object

### parameters  
* aPropertyName: a property name

### returns
Returns true if any property value for a given aPropertyName is set in the profile object and in the configuration property set

### Example

* object.priority.priority1=1
* object.technician.technician1=1
* configuration.priority.priority1=1
* configuration.priority.priority2=0
* configuration.technician.technician1=0
* configuration.technician.technician2=1
* MatchProperty('priority') -> match
* MatchProperty('technician') -> no match

## MatchPropertyValue(aPropertyName,aPropertyValue)
Tests if a given property value is set for configuration and the object 

### parameters  
* aPropertyName: a property name
* aPropertyValue: a value of aPropertyName 

### returns
Returns true if the configuration for the aPropertyName.aPropertyValue == the one defined for the current objectProfile being tested

### Example
* object.priority.priority1=1
* object.technician.technician1=1
* configuration.priority.priority1=1
* configuration.technician.technician1=0
* MatchPropertyValue('priority','priority1') -> match
* MatchPropertyValue('technician','technician1') -> no match

## MatchPropertiesSameValue(aConfigurationPropertyName,anObjectPropertyName,aPropertyValue)
Tests if a property value of a property is set for the configurator and the object

### parameters  

* aConfigurationPropertyName: a configuration property name
* anObjectPropertyName: a object property Name
* aPropertyValue: [option] a value that should match. if undefined, test if at least one of the property values of property is set in Object and in configuration

### returns

Returns true if aPropertyValue in aConfigurationPropertyName and in anObjectPropertyName are both set.

### Example

*  object.priority.priority1=1
*  configuration.priority.priority1=0
*  configuration.activity.priority1=1
*  configuration.strawberry.priority2=1
*  MatchPropertiesSameValue('activity','priority','priority1') -> match
*  MatchPropertiesSameValue('strawberry','priority','priority1') -> no match
*  MatchPropertiesSameValue('activity','priority') -> match
*  MatchPropertiesSameValue('strawberry','priority') -> no match

## MatchPropertiesSameValues(aConfigurationPropertyName,anObjectPropertyName)
tests the property values set for the configurator's property and the object's property and if they are the same between the two

### parameters  

* aConfigurationPropertyName: a configuration property name
* anObjectPropertyName: a object property Name

### returns

Returns true if all properties values of aConfigurationPropertyName and of anObjectPropertyName are both set

### Example

*  object.priority.priority1=1
*  configuration.priority.priority1=0
*  configuration.activity.priority1=1
*  configuration.strawberry.priority2=1
*  MatchPropertiesSameValues('activity','priority') -> match
*  MatchPropertiesSameValues('strawberry','priority','priority1') -> no match

## MatchProperties(aConfigurationPropertyName,anObjectPropertyName)
Tests if at least a property value exists and is set between the configurator property and the object property

### parameters  
* aConfigurationPropertyName: a configuration property name
* anObjectPropertyName: a object property Name

### returns
returns true if it exists a value of aConfigurationPropertyName that is the same that in anObjectPropertyName

### Example
*  object.priority.priority1=1
*  configuration.priority.priority1=0
*  configuration.activity.priority1=1
*  configuration.strawberry.priority2=1
*  MatchProperties('activity','priority') -> match
*  MatchProperties('strawberry','priority') -> no match

## ObjectPropertySet(aPropertyName,aPropertyValue,valueSet)
tests if the property in theObjectPropertySett has its value set

### parameters  

* aPropertyName: an element property name
* aPropertyValue: a value of aPropertyName 
* valueSet: [0|1(default)]

### returns

Returns true if the configuration for the aPropertyName.aPropertyValue == valueSet

### Example

## ConfigurationPropertySet(aPropertyName,aPropertyValue,valueSet)
tests if the property in the configurator has its value set

### parameters  

* aPropertyName: an element property name
* aPropertyValue: a value of aPropertyName 
* valueSet: [0|1(default)]

### returns

Returns true if the configuration for the aPropertyName.aPropertyValue == valueSet

### Example

## ObjectPropertiesSameValue(aPropertyName1,aPropertyName2,aPropertyValue)
Tests if the property in the element has the same value as an other element property

### parameters  

* aPropertyName1: an element property name
* aPropertyName2: an other element property name
* aPropertyValue: a value of aPropertyName 

### returns

Returns true if the configuration for the aPropertyName.aPropertyValue == valueSet

### Example

## ObjectPropertiesSameValues(aPropertyName1,aPropertyName2)
Tests if the property in the element has the same values as an other element property

### parameters  

* aPropertyName1: an element property name
* aPropertyName2: an other element property name

### returns

Returns boolean

### Example

## ConfigurationPropertiesSameValue(aPropertyName1,aPropertyName2,aPropertyValue)
tests if the property in the configuration has the same value as an other configuration property

### parameters  

* aPropertyName1: an element property name
* aPropertyName2: an other element property name
* aPropertyValue: a value of aPropertyName 

### returns

Returns true if the configuration for the aPropertyName.aPropertyValue == valueSet

### Example

## ConfigurationPropertiesSameValues(aPropertyName1,aPropertyName2)
Tests if the property in the element has the same values as an other element property

### parameters  

* aPropertyName1: an element property name
* aPropertyName2: an other element property name

### returns

Returns boolean

### Example

## MatchExternalRule(aRule)
Tests the given rule and return true/false according to the test.

### parameters  

aRule: a statement to evaluate during the rule test

you can use these variables to access to the properties of the configurator or of the object
* propertiesObjectProfile : properties of the current object being tested
* propertiesConfiguration : properties set in the configurator

you can use the other matching functions prefixing them with "this.<matchingFunction>"
ex: this.MatchPropertiesSameValue('strawberry','priority','priority1')

### returns

Returns boolean

### Example

* object.priority.priority1=1
* object.technician.technician1=1
* configuration.priority.priority1=1
* configuration.technician.technician1=0
* MatchExternalRule('propertiesObjectProfile\[priority\]==propertiesConfiguration\[priority\]') -> match
* MatchExternalRule('propertiesObjectProfile\[technician\]\[technician1\]==propertiesConfiguration\[technician\]\[technician1\]') -> not match

# Install JamRules

  * download JamRules from [github](https://github.com/intersel/jamrules) where you'd like in your project
  * include the following javascript libraries (provided in the 'extlib' directory)
```html
		<script type="text/javascript" src="../extlib/jQuery/jquery-2.2.4.js"></script>
		<script type="text/javascript" src="../extlib/iFSM/extlib/jquery.dorequesttimeout.js"></script>
		<script type="text/javascript" src="../extlib/iFSM/extlib/jquery.attrchange.js"></script>
		<script type="text/javascript" src="../extlib/iFSM/iFSM.js"></script>
		<script type="text/javascript" src="../extlib/jQuery-MD5/jquery.md5.js"></script>
		<script type="text/javascript" src="../jamrules.js"></script>
```
  * include JamRules
  
```html
  <script type="text/javascript" src="../jamrules.js"></script>
```

You're done!

# Library Dependencies

JamRules needs to include the following javascript libraries and here's what they do:
* jQuery (>= 1.10) `<script type="text/javascript" src="extlib/jQuery/jquery-3.1.1.js"></script>`
* [iFSM by intersel](https://github.com/intersel/iFSM/). 
  * This library manages finite state machines and needs these libraries:
    * doTimeout by ["Cowboy" Ben Alman](http://benalman.com/projects/jquery-dotimeout-plugin/)
	  * this library brings some very usefull feature on the usual javascript setTimeout function like Debouncing, Delays & Polling Loops, Hover Intent...
	  * `<script type="text/javascript" src="extlib/iFSM/extlib/jquery.dorequesttimeout.js"></script>`
    * attrchange by Selvakumar Arumugam](http://meetselva.github.io/attrchange/) 
	  * a simple jQuery function to bind a listener function to any HTML object on attribute change
	  * `<script type="text/javascript" src="../extlib/iFSM/extlib/jquery.attrchange.js"></script>`
* [jquery.MD5](https://github.com/placemarker/jQuery-MD5)
  * gives the MD5 function used in jamrules 
  * `<script type="text/javascript" src="extlib/jQuery-MD5/jquery.md5.js"></script>`
  
# Official website

# FAQ
## How to get why the rule did not match

You can get the reasons why the engine did not match by accessing to the following reason property :

```javascript
var notmatched=function(aJamRules){
	var reason = aJamRules.myRulesEngine.opts.reason; //array of strings with the rules that did not match
}
```



# Contact
If you have any ideas, feedback, requests or bug reports, you can reach me at github@intersel.org, 
or via my website: http://www.intersel.fr
