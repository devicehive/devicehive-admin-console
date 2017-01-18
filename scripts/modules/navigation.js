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