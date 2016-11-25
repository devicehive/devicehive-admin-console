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
//model is an app.Models.DeviceClass
app.Views.OAuth2IssueGrant = Backbone.Marionette.ItemView.extend({
    events: {
        'submit form': 'requestGrant' 
    },
    initialize: function (options) {
        this.oauth = options.oauth;
        this.networksCollection = options.networksCollection;
        this.scopeCollection = options.scopeCollection;
        var self = this;
        this.networksCollection.on('reset', function() {
            self.render();
        });
    },
    onRender: function() {
        var $el = this.$el;
        var $form = $el.find('form');
        $el.find('#cb-limit-networks').on('change', function(e) {
            $this = $(this);
            $el.find('#oauth-network-list').toggleClass('ui-helper-hidden', !$this.prop('checked'));
            if ( !$this.prop('checked') ) {
                $el.find('#oauth-network-list input[type=checkbox]').prop('checked', false);
            }
        });
    },
    template: "oauth-issue-grant",
    serializeData: function () {
        var data = {
            oauth: this.oauth.toJSON(),
            networksCollection: this.networksCollection.toJSON(),
            scopeCollection: this.scopeCollection.toJSON()
            };
        return data;
    },
    requestGrant: function(e) {
        e.preventDefault();
        var $el = this.$el;
        var networkIds = _.map($el.find('form input[name=network-id]:checked'), function(item){
            return Number($(item).val());
        });
        app.OAuth2.requestGrant(networkIds);
    }
});
