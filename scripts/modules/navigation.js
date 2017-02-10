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
app.module("Modules.Navigation", function (navigation, app) {
    //private members

    var fullCollection = null;
    var navigationCollection = null;
    var menuView = null;

    //events handlers
    var registerResource = function (resourcePath, resourceName, roles) {
        var newItem = new app.Models.MenuItem({ path: resourcePath, name: resourceName, roles: roles });
        fullCollection.add(newItem);
    };

    var rebuildNavigation = function (){
        var allowed = fullCollection.filter(function(item){
            //console.log("Filtering Menu", item.get('roles'), app.User.get("role"), item.get('path'));
            return !item.get('roles') || app.hasRole(item.get('roles'));
        });

        navigationCollection.reset(allowed);
    };

    var navigatedTo = function (resourcePath) {
        resourcePath = resourcePath || "";
        navigationCollection.each(function (menuItem) {
            menuItem.set(
                "selected",
                resourcePath.indexOf(menuItem.get("path")) == 0
                || (menuItem.get("path") == "devices" && resourcePath == "")
            );
        });

    };

    app.bind('launch', rebuildNavigation);

    app.bind("initialize:before", function (options) {
        Backbone.history = new Backbone.History;
        Backbone.history.on("navigatedTo", navigatedTo);
        app.vent.on("addResource", registerResource);
    });

    app.addInitializer(function (options) {
        fullCollection = new app.Models.MenuItemsCollection();
        navigationCollection = new app.Models.MenuItemsCollection();

        menuView = new app.Views.Menu({ collection: navigationCollection});
        app.Regions.menuArea.show(menuView);
        //when new item added call navigatedTo to refresh main menu view
        navigationCollection.bind("add", function () {
            if (Backbone.history.started)
                navigatedTo(Backbone.history.getFragment());
        });
        navigationCollection.bind("change", rebuildNavigation);
    });
});
