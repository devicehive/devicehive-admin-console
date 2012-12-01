//MenuItemCollection should be pushed
app.Views.Menu = Backbone.Marionette.CollectionView.extend({
    tagName: "ul",
    onRender: function () {
        this.$el.addClass("main-menu");
    },
    itemView: app.Views.MenuItem
});