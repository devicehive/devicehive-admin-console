app.module("Modules.Navigation", function (navigation, app) {
    //private members

    var navigationCollection = null;
    var menuView = null;
    var statusView = null;

    //events handlers
    var registerResource = function (resourcePath, resourceName, roles) {
        var newItem = new app.Models.MenuItem({ path: resourcePath, name: resourceName, roles: roles });

        //when new item added call navigatedTo to refresh main menu view
        navigationCollection.bind("add", function () {
            if (Backbone.history.started)
                navigatedTo(Backbone.history.getFragment());
        });

        navigationCollection.add(newItem);
    };

    var navigatedTo = function (resourcePath) {
        navigationCollection.each(function (menuItem) {
            if (resourcePath.indexOf(menuItem.get("path")) == 0 || (menuItem.get("path") == "networks" && resourcePath == ""))
                menuItem.set("selected", true);
            else
                menuItem.set("selected", false);
        });
    };

    app.bind("initialize:before", function (options) {
        Backbone.history = new Backbone.History;
        Backbone.history.on("navigatedTo", navigatedTo);

        app.vent.on("addResource", registerResource);
    });

    app.addInitializer(function (options) {
        navigationCollection = new app.Models.MenuItemsCollection();

        menuView = new app.Views.Menu({ collection: navigationCollection });
        menuView.on("itemview:move", function (view) {
            var path = view.$el.find(".navigation-link").attr("data-path");
            Backbone.history.navigate(path, { trigger: true });
        });

        app.Regions.menuArea.show(menuView);
    });
});