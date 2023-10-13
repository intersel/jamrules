# JamRules
Javascript/jQuery filtering tool that helps to filter objects among a set of objects according to rules.

# What is JamRules?
Let's say you have a set of objects with properties and you'd like to filter them according to a user configuration of criteria and specific rules of selection... then JamRules is for you!

JamRules is a Javascript/jQuery library.

With it, you configure:
  * a set of parameters/criteria of selection (filters configurator) that can be driven by checkboxes and input
  * a set of rules to find the objects according to the filters configuration
  * a set of objects to play with

Once configured, you can start the filtering process so that JamRules selects the objects that match your criteria and calls a 'selected' function on each of them, and call a 'not selected' function for the others...

![alt JamRules designed for the selection of objects](https://cloud.githubusercontent.com/assets/1048488/24730721/91d34c04-1a65-11e7-8fb8-9e47dec60691.jpg)

For example, connected to a dialog box of criteria managed with checkboxes, JamRules can be activated each time a criteria changes and so to alert the selected/unselected object of their new selection status, for instance to be displayed or not...

As an object filter library, Jamrules is your best friend! Ideal for product configurators, objects selection on criteria, ...

[See JamRules in action](https://demo.intersel.fr/jamrules/tests/filterDocsExclusive.html) (source code in test/filterDocsExclusive.html)

# How it works...
To run jamrules, you will have to:
* create a jamrules object,
* define the filter configuration
* create rules,
* add objects to test,
* run the filtering process,

## Create a Jamrules object

```javascript
//Create a jamrules object
var rulesEngine = jamrules.build();
```

## Identify the properties used to filter

The properties are data that define your object. They are used to identify the objects that answer your filtering rules.

Eg, if your objects to filter are animals, properties of an animal may be "Type" ('mammal', 'bird', 'insect', ...), "Name" ('cat', 'dog', ...), "Number of limbs" (0,2,4,8, ...), "Color" ('brown', 'green', ...), ...

Some of the properties may be used in the filtering configuration to select the objects.

Your objects needs to have a json definition, eg. :

```javascript
let myobjects = [
  {
    "type":"mammal",
    "name":"cat",
    "color":"black"
  },
  {
    "type":["mammal","carnivora"],
    "name":"dog",
    "color":"white"
  },
  //and so on
  ]
```

A same property may have several values.

Each object may have its own set of properties that may be different from the other object's sets... Up to you to define in your rules how to select or not your objects...

## Add objects

Use the function **addPropertyObjects** of your rules engine to add your objects and the behavior of the selected and not selected objects by jamRules:

```javascript
rulesEngine.addPropertyObjects(
  myobjects,
  function(){console.log('I am selected:'+this.name)},
  function(){console.log('I am NOT selected'+this.name)}
);
```

## Filtering configuration

Generally, the filtering configuration is driven by the status of checkboxes, radio buttons, input... that the user can click to select a configuration value. These input set the status of the value of a property as chosen or not.

For example, for the property "color", you could set several checkboxes, each allowing to select a color as "red", "blue", "green", ...

To configure the property values of the configurator, we use the function **selectConfigurationPropertyValue**.

```html
<label for="check_green" onclick="rulesEngine.selectConfigurationPropertyValue("color","green",$(this).children('input').value());">
  <input type="checkbox">
  Green
</label>
<label for="check_red" onclick="rulesEngine.selectConfigurationPropertyValue("color","red",$(this).children('input').value());">
  <input type="checkbox">
  Red
</label>
```

## Define the rules to select objects

A rule is a boolean test on your configuration and objects.

Rules are defined within a rule set. You can defined as rule sets as you need.

If all the rules in a rule set are valid ('and'), then the object is selected.

Hence, to be selected ("matched"), an object should match ONE rule set. If none of the rule sets are validated by the object, it is considered as "not matched"...

The rules will be based on pre-defined test functions as "is property xxx of object equal this value?" (ObjectPropertySet), "is property value is selected in the filtering configuration?" (MatchProperty), ...

So, you first define your rule set, then add rules in it, then define a second rule set, and so on...

```javascript

// rules setting
rulesEngine.createRulesSet("HasGreenColor");
	rulesEngine.addRule("HasGreenColor","lightgreen",'ObjectPropertySet("color","light green")');
	rulesEngine.addRule("HasGreenColor","darkgreen",'ObjectPropertySet("color","dark green")');
	rulesEngine.addRule("HasGreenColor","green",'ObjectPropertySet("color","green")');

```

## Test your objects against the rules...

Once done, we will be able to run our jamrules engine with **runRulesEngine**:

```Javascript
rulesEngine.runRulesEngine();
```

Any object that matches the rules will have their "Matched" function called. Any object that is not selected with the rules will have their "NotMatched" function called....


# Demos
* [filtering of animals according to filters](https://demo.intersel.fr/jamrules/tests/exampleReadMe.html) (source code in test/exampleReadMe.html)
* [filtering of documents according to filters that include (or not) the docs](https://demo.intersel.fr/jamrules/tests/filterDocsInclusive.html) (source code in test/filterDocsInclusive.html)

# Create the JamRules object: jamrules.build(options)

```Javascript

//initialisation of jamrules and its configurator
var rulesEngine = jamrules.build({
	"debug":		"<boolean>", //default: false
	"matched":	"<a function to call when the rule find a match>", // default: null
	"notmatched":	"<a function to call when the rule did not find a match>",// default: null
  "matchedFunctionName": "<property name for the 'matched' function in objects>",// default: matched
  "notmatchedFunctionName": "<property name for the 'notmatched' function in objects>"// default: notmatched
  "startProcessing": "<a function to call when rule engine starts to process rules>"// default: null
  "stopProcessing": "<a function to call when rule engine finished to process rules>"// default: null
});
```

## the options parameter
### debug
if true, the rule engine will send debug message on the console


### the "Matched" and "NotMatched" functions

The "matched" and "notmatched" functions are called whenever the rule engine matches an object profile.

Functions have the following parameters:
  * aListOfMatchedObjects: the list of objects that matched the rule
  * this refers to the rule engine object

**Remarks**: These functions are not to be confused with the ones defined on the object level...

### "matchedFunctionName" and "notmatchedFunctionName" options

These options allows to change the default property names of the object that define the 'matched' and 'notmatched' functions of it.
May be used if by any chance, these property names are used for other things...


# The JamRules Objects
In order to test objects with jamrules, you have to give it objects to test against the rules defined in the rule engine.

These objects may be any with properties...

```javascript
{
	"color": "red",
	"size": "xl",
	...
}
```

Internally, the objects are formatted in order to process the matching functions and rules, the internal format of your data in jamrules will be :

```javascript
{
	propertiesSet:{
		<propertyName1>:{<propertyValue1:<0|1>,<propertyValue2:<0|1>, ...},
		<propertyName2>:{<propertyValue1:<0|1>,<propertyValue2:<0|1>, ...},
		...
	},
	matched: <a function to call when it matches>,
	notmatched: <a function to call when it does not match>,
}
```

eg:
```javascript
{
	propertiesSet:{
		color: {red:1},
		size: {xl:1}
		...
	},
	matched: function(ruleEngine){console.log("object matched!")},
	notmatched: null,
}
```




**Remark**: The properties of the objects should be "static". The use of functions to define dynamic properties within objects is not possible.

# The JamRules Filtering Configurator
The JamRules filtering configurator is a special object that can be used in a rule to test a configuration of properties against the properties of the objects to filter.

For example, let's say we have white and black trousers.
If you'd like to get only the white trousers, you can set a configurator property "color" with a "white" property value set to 1.
Then you'll be able to test this configurator property against your objects.

The **selectConfigurationPropertyValue** function allows to create and edit such entry in the configurator.


```javascript
rulesEngine.selectConfigurationPropertyValue("color","white",1);

```

# The JamRules rules

## Rules set

When "run", Jamrules tests each objects against the defined sets of rules in their order of declaration.

It declares an object as "**matched**" as soon as **a set of rules is compliant with the object** and its properties.

Rules are defined within a "rules set" declation. A rules set is validated **when all its rules are validated to true**.

When a rule set is not ok, Jamrules tries the next rules set.

If **none of the rules sets** are validated, then the object is declared "**unmatched**".

We use the **createRulesSet** function to create a rules set, and the **addRule** function to add a rule in a rule set.

## Rules

A rule declares a test to try.

The test can use information on the object properties, the configurator or any other information you'd like...

JamRules has several matching functions ready to use as:
* ObjectPropertySet: tests the value of the property of the object currently tested
* ObjectPropertiesSameValue: tests the value of one property against another property...
* ...

There are several filtering functions that may help to test a configuration in the filtering configurator against the properties of objects:
* MatchProperty
* MatchPropertyValue
* MatchProperties
* MatchPropertiesSameValue
* MatchPropertiesSameValues
* MatchPropertySearch
* ConfigurationPropertySet
* ConfigurationPropertiesSameValue
* ConfigurationPropertiesSameValues
* MatchExternalRule



## Example
```javascript
rulesEngine.createRulesSet("SameTrousers");
rulesEngine.addRule("SameTrousers","O1Trouser",'ObjectPropertySet("object1","trouser")');
rulesEngine.addRule("SameTrousers","O2Trouser",'ObjectPropertiesSameValue("object1","object2")');
rulesEngine.createRulesSet("SameShirts",["object1","object2"]);
rulesEngine.addRule("SameShirts","O1Shirt",'ObjectPropertySet("object1","shirt")');
rulesEngine.addRule("SameShirts","O2Shirt",'ObjectPropertiesSameValue("object1","object2")');
```

# Adding Objects to test by JamRules

## addPropertyObjects(Objects <, aMatchingFunction, aNotMatchingFunction>)

Add objects to the list of objects to test against rules.

  * **Objects**: array of objects with their properties plus these optional ones:
    * **matched** (option): function to call when a rule will match for the object
    * **notmatched** (option): function to call when rules will be tested but no rules match for the object
  * **aMatchingFunction** (option): a matching function, same as to define a "matched" property in the object
  * **aNotMatchingFunction** (option): a 'not' matching function, same as to define a "notmatched" property in the object

### Example
```javascript
ruleEngine = jamrules.build();
var anObject = {
	object1Color : "white"
};
myMatchFunction = function(){alert("Hello:"+this.object1Color)};
rulesEngine.addPropertyObject(onObject,myMatchFunction);
```

## addPropertyObject(anObject<, aMatchingFunction, aNotMatchingFunction>)

Add an object to the list of objects to test against rules.

  * **anObject** with its properties plus these optional ones
    * **matched** (option): function to call when a rule will match for the object
    * **notmatched** (option): function to call when rules will be tested but no rules match for the object
  * **aMatchingFunction** (option): a matching function, same as to define a "matched" property in the object
  * **aNotMatchingFunction** (option): a 'not' matching function, same as to define a "notmatched" property in the object

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
* **anObject**: a object to test in jamrules in **jamrules format**

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
This function differs from addObject in the way that all the jamrules engines will share the objects added this way.
So, you include once your objects in the first jamrules object and then they will be processed by all the other rules.

### parameters  
* **anObject**: a object to test in jamrules

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

# Creating rules set and rules

## createRulesSet(aRulesGroup, ruleEvents)
Creates a rule set.
### parameters  
* **aRulesGroup**: name of the rules set to create
* **ruleEvents**: [array] (option) a list of one or several property names used in the configurator. The rules set will be processed if a property of the configurator changes when using "selectConfigurationPropertyValue" function (see selectConfigurationPropertyValue).

### Example
```javascript
rulesEngine.createRulesSet("SameTrousers");
...
rulesEngine.createRulesSet("SameTrousers",["aProperty1","aProperty2"]);

```

## addRule(aRulesGroup, aRuleName, aRuleTest)
Add a new "and" rule in aRulesGroup.

### parameters  
* **aRulesGroup**: a rule set name
* **aRuleName**: a rule to define in the rules set
* **aRuleTest**: a filtering function with its parameters to assess
  * eg: "[!]<filterFunction(p1[,p2,...])"

### Example
```javascript
// colortop should have the same color name than colorbottom but different from colormiddle
rulesEngine.addRule("SameColorTrousersPack","Test1",'ObjectPropertiesSameValue("colortop","colorbottom")');
rulesEngine.addRule("SameColorTrousersPack","TestNot2",'!ObjectPropertiesSameValue("colortop","colormiddle")');
```

# Run JamRules

## compileRules
Initialize the rule engine - to do before action and after adding new rules

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

# Filtering configurator

## selectConfigurationPropertyValue(aPropertyName, aPropertyValue, doTest)
Select a value in the filtering configurator as a radio would do: unselecting other values of aPropertyName.

### parameters  
* **aPropertyName**: name of the property that has changed
* **aProperyValue**: value of the property
* **doTest**: <boolean> <default:true> (option) if false, configure the configurator but does not run the rules engine test

### Remarks
If "doTest" is set, the rules engine will **run** and process -only- the rules sets that have configured the "aPropertyName" in the "ruleEvents" parameter in createRulesSet function.

aPropertyValue may be set to "*" to match any value of aPropertyName.

### Example
```javascript

	rulesEngine.createRulesSet("SameTrousers",["object1"]);
	rulesEngine.addRule("SameTrousers","Trouser",'MatchProperty("object1")');
	....
	//as 'object1' is defined in the "SameTrousers" rules set, the following line will configure the "object1" property and see the rule set "SameTrousers" processed
	rulesEngine.selectConfigurationPropertyValue("object1","trouser");
	...
	//no rule set to process... just configure the property in the configurator
	rulesEngine.selectConfigurationPropertyValue("object1","trouser",false);
	...
	//will process all the rules sets
	rulesEngine.runRulesEngine();
```

## checkConfigurationPropertyValue(aPropertyName,aPropertyValue,aStatus, doTest)
set a property/property value status in the rules configurator. It is designed for checkboxes/multiple select as it set a value as a checkbox would do.

### parameters  
* **aPropertyName**: name of the property that has changed
* **aProperyValue**: value of the property
* **aStatus**: <boolean>  <default:false> (option) status of the property for this property value set or not
* **doTest**: <boolean> <default:true> (option) if false, configure the configurator but does not run the rules engine test

### Remarks
If "doTest" is set, the rules engine will **run** and process -only- the rules sets that have configured the "aPropertyName" in the "ruleEvents" parameter in createRulesSet function.

aPropertyValue may be set to "*" to match any value of aPropertyName.

### Example
```javascript

	rulesEngine.createRulesSet("SameTrousers",["object1"]);
	rulesEngine.addRule("SameTrousers","Trouser",'MatchProperty("object1")');
	....
	//as 'object1' is defined in the "SameTrousers" rules set, the following line will configure the "object1" property and see the rule set "SameTrousers" processed
	rulesEngine.checkConfigurationPropertyValue("object1","trouser",1);
	...
	//no rule set to process... just configure the property in the configurator
	rulesEngine.checkConfigurationPropertyValue("object1","trouser",1,false);
	...
	//will process all the rules sets
	rulesEngine.runRulesEngine();
```

## resetConfigurationPropertyValues(aPropertyName)
reset a property by setting all its property values to a false status in the rules configurator

### parameters  
* **aPropertyName**: name of the property that has changed

### Remarks

### Example
```javascript
```

## resetConfigurationProperty(aPropertyName)
reset a property completely

### parameters  
* **aPropertyName**: name of the property that has changed

### Remarks

### Example
```javascript
```

# The Available filtering functions for "addRule"

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

## MatchPropertySearch(aPropertyName)
Test if a string aPropertyName is found as a property value of objects. Generally used for text input as search input.

### parameters  
* aPropertyName: a string to search in the property values of objects.
  wildcards are possible: '*' (0 or more char), '?' (0 or 1 char)
  eg: 'my*propert?' will match 'myproperty','mygivenpropert','myREDproperts'
                    won't match 'property', 'myREDproperties'
* searchMode: default:'or'
  * or: blank are considered as 'or' operator between keywords to find
  * and: blank are considered as 'and' operator with all keywords to be found in any property values
   

### returns
returns true if the pattern string(s) defined in the configurator are found in property values of object

### Example

*  object.priority.priority1=1
*  object.technician.technician1=1
*  configuration.priority['prio*']=1
*  configuration.technician['technician2']=1
*  MatchPropertySearch('priority') -> match
*  MatchPropertySearch('technician') -> no match


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
*  MatchPropertiesSameValues('strawberry','priority') -> no match

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

## MatchObjectSearch(aConfigurationPropertyName,anObjectPropertyName)
Tests if the value of a configuration property string is found in the values of object's properties
Generally used for a text input in the configuration, as search input...

### parameters  
* aPropertyValueWithWildcard: a string to search in the property values of objects.
   wildcards are possible: '*' (0 or more char), '?' (0 or 1 char)
   eg: 'my*propert?' will match 'myproperty','mygivenpropert','myREDproperts'
                     won't match 'property', 'myREDproperties'
* searchMode:
  - or (default): blank are considered as 'or' operator between keywords to find
  - and: blank are considered as 'and' operator with all keywords to be found in any property values


### returns
returns true if the pattern string(s) defined in the configurator are found in property values of object

### Example
*  object.priority.priority1=1
*  object.technician.technician1=1
*  configuration.technician.technician2=1
*  MatchObjectSearch('priority1') -> match
*  MatchObjectSearch('prior*') -> match
*  MatchObjectSearch('tec?ician') -> no match
*  MatchObjectSearch('tec*ician2') -> no match


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
// notmatched function of an element
var notmatched=function(aJamRules){
	var reason = aJamRules.myRulesEngine.opts.reason; //array of strings with the rules that did not match
}

// notmatched function of engine rule
var notmatched=function(aListOfObjects){
	var reason = this.myRulesEngine.opts.reason; //array of strings with the rules that did not match
}
```

## Can I define a match function different for each object?

Yes.

To do that, define a "matched" function like in this example:

```javascript

var myObject1 ={property1:20}
myObject1.matched=function(){
	alert("it matches this object 1"+this.property1);
}
var myObject2 ={property2:40}
myObject2.matched=function(){
	alert("it matches this object 2:"+this.property2);
}
rulesEngine.addPropertyObjects([myObject1,myObject2]);
```



# Contact
If you have any ideas, feedback, requests or bug reports, you can reach me at github@intersel.org,
or via my website: http://www.intersel.fr
