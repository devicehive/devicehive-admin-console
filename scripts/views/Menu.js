//MenuItemCollection should be pushed
app.Views.Menu = Backbone.Marionette.CollectionView.extend({
    itemView: app.Views.MenuItem
});

app.Views.MenuLayout = Backbone.Marionette.Layout.extend({
    template: 'menu-template',
    regions: {
        main: '.main-menu',
        admin: '.admin-menu'
    },
    initialize: function(options) {
        this.adminCollection = options.adminCollection;
    },
    onRender: function() {
        this.main.show(new app.Views.Menu({collection: this.collection}));
        this.admin.show(new app.Views.Menu({collection: this.adminCollection}));
    }
});
