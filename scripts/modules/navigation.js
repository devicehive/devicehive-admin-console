app.module("Modules.Navigation", function (navigation, app) {
    //private members

    var navigationCollection = null;
    var adminNavigationCollection = null;
    var menuView = null;
    var adminMenuView = null;

    //events handlers
    var registerResource = function (resourcePath, resourceName, roles) {
        var newItem = new app.Models.MenuItem({ path: resourcePath, name: resourceName, roles: roles });
        // add menu items to admin collection if admin role required to access the item
        if (roles && roles.indexOf && roles.indexOf(app.Enums.UserRole.Administrator) >= 0) {
            adminNavigationCollection.add(newItem);
        } else {
            navigationCollection.add(newItem);
        }
    };

    var navigatedTo = function (resourcePath) {
        navigationCollection.each(function (menuItem) {
            if (resourcePath.indexOf(menuItem.get("path")) == 0 || (menuItem.get("path") == "networks" && resourcePath == ""))
                menuItem.set("selected", true);
            else
                menuItem.set("selected", false);
        });
        adminNavigationCollection.each(function(menuItem) {
            if (resourcePath.indexOf(menuItem.get("path")) == 0) {
                menuItem.set('selected', true);
                menuView.adminVisible = true;
                menuView.render();
            } else {
                menuItem.set('selected', false);
            }
        });
    };

    app.bind("initialize:before", function (options) {
        Backbone.history = new Backbone.History;
        Backbone.history.on("navigatedTo", navigatedTo);
        app.vent.on("addResource", registerResource);
    });

    app.addInitializer(function (options) {
        navigationCollection = new app.Models.MenuItemsCollection();
        adminNavigationCollection = new app.Models.MenuItemsCollection();
        menuView = new app.Views.Menu({ userCollection: navigationCollection, adminCollection: adminNavigationCollection });
        app.Regions.menuArea.show(menuView);
        //when new item added call navigatedTo to refresh main menu view
        navigationCollection.bind("add", function () {
            if (Backbone.history.started)
                navigatedTo(Backbone.history.getFragment());
        });
    });
});