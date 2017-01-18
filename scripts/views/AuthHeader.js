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
app.Views.authHeader = Backbone.Marionette.ItemView.extend({
    template: 'auth-header',
    initialize: function(options) {
        this.user = options.user;
    },
    serializeData: function() {
        return {userLogin: this.user.get('login')};
    },
    events: {
        "click a": "clickHandler"
    },
    clickHandler: function(e) {
        e.preventDefault();
        $el = $(e.target);
        Backbone.history.navigate($el.data('path'), { trigger: true });
    }
});
