# JamRules
Javascript configurator to match rules on massive number of objects

#What is JamRules
Let's say you have a set of objects with parameters and you'd like to filter them according to a configuration of these parameters and specific rules of choices... then JamRules is for you!

JamRules allows you to configure a set of parameters and a set of rules of matching, then test if objects match against the rules and the configuration.

#Example
Example: 
* I sell red and white trousers and yellow and blue shirts through different kind of packs of products:
  * packs of 2 trousers
  * packs with a trouser and shirt
  * packs with two shirts
  * etc...
* I'll give a promo coupon for packs that
  * have two trousers 
  * or have a trouser with a shirt 
  * nothing if the trousers in the pack are of different colors
  * nothing for the other kind of packs

Which packs should have a promo code?

Jamrules will be able to tell you!
You configure Jamrules configurator according to one of the pack configurations and run the test. 
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
	rulesEngine.addRule("SameColorTrousoursPack","SameColor1",'MatchPropertiesValue("object1Color","object1Color")');
	rulesEngine.addRule("SameColorTrousoursPack","SameColor2",'MatchPropertiesValue("object1Color","object2Color")');
	rulesEngine.addRule("SameColorTrousoursPack","SameColor3",'MatchPropertiesValue("object2Color","object1Color")');

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

## Add your elements to test - addElement

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
	rulesEngine.addElement(pack1);
	rulesEngine.addElement(pack2);
	rulesEngine.addElement(pack3);
```
## Create the configuration to test
```javascript
//prepare configuration for test "2 white trousers"
rulesEngine.setProperty("object1","trouser",1,false);
rulesEngine.setProperty("object2","trouser",1,false);
rulesEngine.setProperty("object1Color","white",1,false);
// will select pack1 and call its 'matched' function, 
//will not match with pack2 and pack3 and call their 'unmatched' function
rulesEngine.setProperty("object2Color","white",1); 

//prepare configuration "a white trousers and blue shirt"
rulesEngine.setProperty("object1","trouser",1,false);
rulesEngine.setProperty("object2","shirt",1,false);
rulesEngine.setProperty("object1Color","white",1,false);
rulesEngine.setProperty("object2Color","blue",1,false);
// will select pack2 and call its 'matched' function, 
//will not match with pack1 and pack3 and call their 'unmatched' function
rulesEngine.setProperty("object2Color","white",1); 
```

#Available API

##Matching functions

###function MatchProperty(aPropertyName)
tests if at least a property value of a property is shared between the configuration and the element

####parameters  
* aPropertyName: a property name

####returns
returns true if any property value for a given aPropertyName is set in the profile element and in the configuration property set

####Example

* element.priority.priority1=1
* element.technician.technician1=1
* configuration.priority.priority1=1
* configuration.priority.priority2=0
* configuration.technician.technician1=0
* configuration.technician.technician2=1
* MatchProperty('priority') -> match
* MatchProperty('technician') -> no match

###function MatchPropertyValue(aPropertyName,aPropertyValue)
tests if a given property value is set for configuration and the element 

####parameters  
* aPropertyName: a property name
* aPropertyValue: a value of aPropertyName 

####returns
returns true if the configuration for the aPropertyName.aPropertyValue == the one defined for the current elementProfile being tested

####Example
* element.priority.priority1=1
* element.technician.technician1=1
* configuration.priority.priority1=1
* configuration.technician.technician1=0
* MatchPropertyValue('priority','priority1') -> match
* MatchPropertyValue('technician','technician1') -> no match

###function MatchPropertiesValue(aConfigurationPropertyName,aElementPropertyName,aPropertyValue)
tests if a property value exists and is the same between a configurator property and the element property

####parameters  

* aConfigurationPropertyName: a configuration property name
* aElementPropertyName: a element property Name
* aPropertyValue: a value of aPropertyName

####returns

returns true if aPropertyValue in aConfigurationPropertyName and in aElementPropertyName are both set

####Example

*  element.priority.priority1=1
*  configuration.priority.priority1=0
*  configuration.activity.priority1=1
*  configuration.strawberry.priority2=1
*  MatchPropertiesValue('activity','priority','priority1') -> match
*  MatchPropertiesValue('strawberry','priority','priority1') -> no match 

###function MatchProperties(aConfigurationPropertyName,aElementPropertyName)
tests if at least a property value exists and is set between the configurator property and the element property

####parameters  
* aConfigurationPropertyName: a configuration property name
* aElementPropertyName: a element property Name

####returns
returns true if it exists a value of aConfigurationPropertyName that is the same that in aElementPropertyName

####Example
*  element.priority.priority1=1
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
*  element.priority.priority1=1
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
	* a simple jQuery function to bind a listener function to any HTML element on attribute change
	* `<script type="text/javascript" src="extlib/jquery.attrchange.js"></script>`
	
#Official website

#FAQ

#Contact
If you have any ideas, feedback, requests or bug reports, you can reach me at github@intersel.org, 
or via my website: http://www.intersel.fr