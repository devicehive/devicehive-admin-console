/*
  DeviceHive Admin Console business logic

  Copyright (C) 2016 DataArt

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  */
(function () {
    //escape all strings in an object. And all strings in child objects.
    var deepEscape = function (object) {
    	var copy;
    	if(_.isArray(object))
         	copy = [];
        else
         	copy = {};
         	
        _.each(object, function (val, key) {
            if (_.isString(val))
                copy[key] = _.escape(val);
            else if (_.isObject(val) && !_.isEmpty(val))
                copy[key] = deepEscape(val);
            else
                copy[key] = val;
        });
        return copy;
    };

    /* override toJSON to avoid xss*/
    Backbone.Model.prototype.toJSON = function (options) {
        var obj = $.extend(true, {}, _.clone(this.attributes));
        var escape = false;

        if (_.isObject(options) && options.escape == true)
            escape = true;

        if (escape) 
            return deepEscape(obj);

        return obj;
    };

    /*use safe toJSON in default marionette views*/
    Backbone.Marionette.View.prototype.serializeData = function () {
        var data;

        if (this.model) {
            data = this.model.toJSON({ escape: true });
        }
        else if (this.collection) {
            data = { items: this.collection.toJSON({ escape: true }) };
        }

        data = this.mixinTemplateHelpers(data);

        return data;
    };
})();

//this stuff used to implement getters and setters: https://github.com/berzniz/backbone.getters.setters
(function() {
    var oldset = Backbone.Model.prototype.set;
    var oldget = Backbone.Model.prototype.get;

    Backbone.Model.prototype.getters = { };
    Backbone.Model.prototype.setters = { };
    Backbone.Model.prototype.set = function(key, value, options) {
        var attrs, attr;

        // Normalize the key-value into an object
        if (_.isObject(key) || key == null) {
            attrs = key;
            options = value;
        } else {
            attrs = { };
            attrs[key] = value;
        }

        // Go over all the set attributes and call the setter if available
        for (attr in attrs) {
            if (_.isFunction(this.setters[attr])) {
                attrs[attr] = this.setters[attr].call(this, attrs[attr]);
            }
        }

        return oldset.call(this, attrs, options);
    };

    Backbone.Model.prototype.get = function(attr) {
        // Call the getter if available
        if (_.isFunction(this.getters[attr])) {
            return this.getters[attr].call(this);
        }

        return oldget.call(this, attr);
    };
})();

/*trigger event after on backbone.history.navigate*/

(function() {
    var oldnavigate = Backbone.History.prototype.navigate;
    
    Backbone.History.prototype.navigate = function(fragment, options) {
        oldnavigate.call(this,fragment, options);
        this.trigger("navigatedTo",fragment);
    };
})();