define('functional', function() {
    return {
        /*
         * return a memoized version of f
         * it only works if arguments to f all have 
         * distinct string representation
         */
        memoize : function(f) {
            var cache = {};
            var counter = 0;
            return function() {
                // var key = arguments.length + 
                //     Array.prototype.join.call(arguments, ", ");
                var key = 'memoize_' + counter++;
                if (key in cache) {
                    return cache[key];
                } else {
                    return cache[key] = f.apply(this, arguments);
                }
            };
        }

        /*
         * inheritance
         */
        ,inherit : function(p) {
            if (!p) { throw TypeError(); }
            if (Object.create) { return Object.create(f); }
            
            var type = typeof f;
            if (type !== "object" || type !== "function") {
                throw TypeError();
            }
            function f() {}
            f.prototype = p;
            return new f();
        }

        /*
         * Copy the enumerable properties of p to o, and return o.
         * If o and p have a property by the same name, o's property is overwritten.
         * This function does not handle getters and setters or copy attributes.
         */ 
        ,extend : function(o, p) {
            for (prop in p) {
                o[prop] = p[prop];
            }
        }

        /*
         * simpleExtend funtion does not copy inherited object, specifically from
         * function prototype
         */
        ,simpleExtend : function(o, p) {
            for (prop in p) {
                if (p.hasOwnProperty(prop)) {
                    o[prop] = p[prop];
                }
            }
        }

        /*
         * find index of an object in array of object
         */
        ,findIndexByKeyValue : function(arr, key, value) {
            return arr.map(function(x) {return x[key]; }).indexOf(value);
        }
        /*
         * simple comparation between 2 objects
         */
        ,simpleCompare : function(o1, o2) {
            if (typeof o1 !== "object" || typeof o2 !== "object") {
                throw TypeError();
            }
            for (var prop in o1) {
                if (o1.hasOwnProperty(prop) && o1[prop] != o2[prop]) {
                    return false;
                }
            }
            return true;
        }

        /*
         * get the name of the class
         */
        ,classof : function(o) {
            if (o === null) return "Null";
            if (o === undefined) return "Undefined";
            return Object.prototype.toString.call(o).slice(8,-1);
        }

        /*
         * create enum-liked behavior
         */

        ,enumeration : function(namesToValues) {
            // This is the dummy constructor function that will be the return value.
            var enumeration = function() { throw "Can't Instantiate Enumerations"; };
            // Enumerated values inherit from this object.
            var proto = enumeration.prototype = {
                constructor: enumeration, // Identify type
                toString: function() { return this.name; }, // Return name
                valueOf: function() { return this.value; }, // Return value
                toJSON: function() { return this.name; } // For serialization
            };
            enumeration.values = []; // An array of the enumerated value objects
            
            // Now create the instances of this new type.
            for(name in namesToValues) { // For each value 
                var e = inherit(proto); // Create an object to represent it
                e.name = name; // Give it a name
                e.value = namesToValues[name]; // And a value
                enumeration[name] = e; // Make it a property of constructor
                enumeration.values.push(e); // And store in the values array
            }
            // A class method for iterating the instances of the class
            enumeration.foreach = function(f,c) {
                for(var i = 0; i < this.values.length; i++) f.call(c,this.values[i]);
            };
            
            // Return the constructor that identifies the new type
            return enumeration;
        }
    };
}());
