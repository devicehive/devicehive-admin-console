app.Models.MenuItem = Backbone.Model.extend({
        defaults:{selected:false}
    });

app.Models.MenuItemsCollection = Backbone.Collection.extend({
        model: app.Models.MenuItem
    }
);