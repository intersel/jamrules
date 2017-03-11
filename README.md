# JamRules
Javascript configurator to match rules on massive number of objects

#What is JamRules
Let's say you have a set of objects with properties and you'd like to filter them according to a user configuration of these properties and specific rules of choices... then JamRules is for you!

JamRules allows you to configure a set of parameters and a set of rules of matching, then it will test and select your objects accordingly to your configuration and the defined rules.

#Example
Example: 
##my set of objects 

I sell red and white trousers and yellow and blue shirts through different kind of packs of 2 products:
  * packs of 2 trousers
  * packs with a trouser and shirt
  * packs with two shirts
  * etc...

For the example, we decide that an object is a "pack" with the following properties:
* property "object1" that can have the values "trouser" or "shirt"
* property "object1color" that can have the values "blue" or "yellow" or "white"
* property "object2" that can have the values "trouser" or "shirt"
* property "object2color" that can have the values "blue" or "yellow" or "white"

##my selection rules of objects

I want to give a promo coupon for packs that
  * have two trousers 
  * or have a trouser with a shirt 
  * nothing if the trousers in the pack are of different colors
  * nothing for the other kind of packs

We will translate these rules to have a coupon as following:
* object1 and object2 have to be a trouser
  * AND
    * object1color has to be different from object2color
OR
* object1 has to be a trouser
  * AND
    * object2 has to be a shirt
OR
* object1 has to be a shirt
  * AND
    * object2 has to be a trouser

Which packs should have a promo code?

Jamrules will be able to tell you!
* add the objects to test in jamrules
* configure Jamrules configurator to select some packs, like select the packs that has a white trouser and a blue shirt.
* run the test: 
  * jamrules will tell to the packs that have a white trouser and a blue shirts if they have a coupon. 
  * It will tell to the others packs that they don't match the selection or the rules.

JamRules will select the packs that match the configuration if it respects the rules in order to give them the promo code.

Of course, that's a simple example but you can imagine how rules and kind of packs can become numerous and answers may become quickly hard to give... 

Hereafter how to configure JamRules

## Demos
no demo available :-( will come quickly!

## Create the JamRules object - jamrules

```javascript
      //initialisation of jamrules and its configurator
      var rulesEngine = new jamrules($('#filterbox'),{debug:true});
```

## Create rules - createRulesSet/addRule
```javascript

	rulesEngine.createRulesSet("SameColorTrousoursPack",["object1","object2","object1Color","object2Color"]);
	//promo if 2 trousers bought
	rulesEngine.addRule("SameColorTrousoursPack","FirstTrouser",'MatchPropertyValue("object1","trouser")');
	rulesEngine.addRule("SameColorTrousoursPack","FirstTrouser",'MatchPropertyValue("object2","trouser")');
	// and have same color
	rulesEngine.addRule("SameColorTrousoursPack","SameColor1",'MatchPropertiesSameValue("object1Color","object1Color")');
	rulesEngine.addRule("SameColorTrousoursPack","SameColor2",'MatchPropertiesSameValue("object1Color","object2Color")');
	rulesEngine.addRule("SameColorTrousoursPack","SameColor3",'MatchPropertiesSameValue("object2Color","object1Color")');

	//promo if a trouser and a shirt
	rulesEngine.createRulesSet("TrouserShirtPack",["object1","object2"]);
	rulesEngine.addRule("TrouserShirtPack","O1Trouser",'MatchPropertyValue("object1","trouser")');
	rulesEngine.addRule("TrouserShirtPack","O2Shirt"	,'MatchPropertyValue("object2","shirt")');
	rulesEngine.addRule("TrouserShirtPack","O1Shirt"	,'MatchPropertyValue("object1","shirt")');
	rulesEngine.addRule("TrouserShirtPack","O2Trouser",'MatchPropertyValue("object2","trouser")');

```

## Compile the rules - compileRules

```javascript

	rulesEngine.compileRules();
```

## Add your objects to test - addObject

```javascript

	var matched=function(){
	            msg="pack has coupon";
	            alert(msg);
	}
	var notMatched=function(){
	            msg="pack has no coupon";
	            alert(msg);
	}
	var pack1={propertiesSet:
				{object1:{trouser:1}}
			,	{object2:{trouser:1}}
			,	{object1Color:{white:1}}
			,	{object2Color:{white:1}}
			,	matched:matched
			,	notmatched:notmatched
	};
	var pack2={propertiesSet:
				{object1:{trouser:1}}
			,	{object2:{shirt:1}}
			,	{object1Color:{white:1}}
			,	{object2Color:{blue:1}}
			,	matched:matched
			,	notmatched:notmatched
	};
	var pack3={propertiesSet:
				{object1:{shirt:1}}
			,	{object2:{shirt:1}}
			,	{object1Color:{yellow:1}}
			,	{object2Color:{blue:1}}
			,	matched:matched
			,	notmatched:notmatched
	};
	rulesEngine.addObject(pack1);
	rulesEngine.addObject(pack2);
	rulesEngine.addObject(pack3);
```
## Create the configuration to test
```javascript
//prepare configuration for test "2 white trousers"
rulesEngine.selectConfigurationPropertyValue("object1","trouser",1,false);
rulesEngine.selectConfigurationPropertyValue("object2","trouser",1,false);
rulesEngine.selectConfigurationPropertyValue("object1Color","white",1,false);
// will select pack1 and call its 'matched' function, 
//will not match with pack2 and pack3 and call their 'unmatched' function
rulesEngine.selectConfigurationPropertyValue("object2Color","white",1); 

//prepare configuration "a white trousers and blue shirt"
rulesEngine.selectConfigurationPropertyValue("object1","trouser",1,false);
rulesEngine.selectConfigurationPropertyValue("object2","shirt",1,false);
rulesEngine.selectConfigurationPropertyValue("object1Color","white",1,false);
rulesEngine.selectConfigurationPropertyValue("object2Color","blue",1,false);
// will select pack2 and call its 'matched' function, 
//will not match with pack1 and pack3 and call their 'unmatched' function
rulesEngine.selectConfigurationPropertyValue("object2Color","white",1); 
```

#Available API

##Matching functions

###function MatchProperty(aPropertyName)
tests if at least a property value of a property is shared between the configuration and the object

####parameters  
* aPropertyName: a property name

####returns
returns true if any property value for a given aPropertyName is set in the profile object and in the configuration property set

####Example

* object.priority.priority1=1
* object.technician.technician1=1
* configuration.priority.priority1=1
* configuration.priority.priority2=0
* configuration.technician.technician1=0
* configuration.technician.technician2=1
* MatchProperty('priority') -> match
* MatchProperty('technician') -> no match

###function MatchPropertyValue(aPropertyName,aPropertyValue)
tests if a given property value is set for configuration and the object 

####parameters  
* aPropertyName: a property name
* aPropertyValue: a value of aPropertyName 

####returns
returns true if the configuration for the aPropertyName.aPropertyValue == the one defined for the current object profile being tested

####Example
* object.priority.priority1=1
* object.technician.technician1=1
* configuration.priority.priority1=1
* configuration.technician.technician1=0
* MatchPropertyValue('priority','priority1') -> match
* MatchPropertyValue('technician','technician1') -> no match

###function MatchPropertiesSameValue(aConfigurationPropertyName,anObjectPropertyName,aPropertyValue)
tests if a property value exists and is the same between a configurator property and the object property

####parameters  

* aConfigurationPropertyName: a configuration property name
* anObjectPropertyName: a object property Name
* aPropertyValue: a value of aPropertyName

####returns

returns true if aPropertyValue in aConfigurationPropertyName and in anObjectPropertyName are both set

####Example

*  object.priority.priority1=1
*  configuration.priority.priority1=0
*  configuration.activity.priority1=1
*  configuration.strawberry.priority2=1
*  MatchPropertiesSameValue('activity','priority','priority1') -> match
*  MatchPropertiesSameValue('strawberry','priority','priority1') -> no match 

###function MatchProperties(aConfigurationPropertyName,anObjectPropertyName)
tests if at least a property value exists and is set between the configurator property and the object property

####parameters  
* aConfigurationPropertyName: a configuration property name
* anObjectPropertyName: a object property Name

####returns
returns true if it exists a value of aConfigurationPropertyName that is the same that in anObjectPropertyName

####Example
*  object.priority.priority1=1
*  configuration.priority.priority1=0
*  configuration.activity.priority1=1
*  configuration.strawberry.priority2=1
*  MatchProperties('activity','priority') -> match
*  MatchProperties('strawberry','priority') -> no match

###function ConfigurationPropertySet(aPropertyName,aPropertyValue,valueSet)
matching rule function, tests if the property in the configurator has its value set

####parameters  
* aPropertyName: a property name
* aPropertyValue: a value of aPropertyName
* valueSet: [0|1(default)]
 
####returns
returns true if the configuration for the aPropertyName.aPropertyValue == valueSet

####Example
*  object.priority.priority1=1
*  configuration.priority.priority1=0
*  configuration.activity.priority1=1
*  configuration.strawberry.priority2=1
*  MatchProperties('activity','priority') -> match
*  MatchProperties('strawberry','priority') -> no match

#Install JamRules

#LIBRARY DEPENDENCIES

To work properly, you need to include the following javascript library:
* jQuery (>= 1.10) `<script type="text/javascript" src="extlib/jquery-1.10.2.min.js"></script>`
* doTimeout by ["Cowboy" Ben Alman](http://benalman.com/projects/jquery-dotimeout-plugin/)
	* this library brings some very usefull feature on the usual javascript setTimeout function like Debouncing, Delays & Polling Loops, Hover Intent...
	* `<script type="text/javascript" src="extlib/jquery.dotimeout.js"></script>`
* attrchange by Selvakumar Arumugam](http://meetselva.github.io/attrchange/) 
	* a simple jQuery function to bind a listener function to any HTML object on attribute change
	* `<script type="text/javascript" src="extlib/jquery.attrchange.js"></script>`
	
#Official website

#FAQ

#Contact
If you have any ideas, feedback, requests or bug reports, you can reach me at github@intersel.org, 
or via my website: http://www.intersel.fr