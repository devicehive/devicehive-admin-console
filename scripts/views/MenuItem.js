//MenuItem model should be pushed
app.Views.MenuItem = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    events: {
        "click a": "move"
    },
    move: function() {
        var path = this.$el.find(".navigation-link").attr("data-path");
        Backbone.history.navigate(path, { trigger: true });
    },
    initialize: function () {
        this.bindTo(this.model, "change:selected", this.render);
        this.bindTo(app.User, "change", this.render);
    },
    beforeRender: function () {
        this.$el.addClass("menu-item");
        if(this.model.get("selected"))
            this.$el.addClass("selected");
        else 
            this.$el.removeClass("selected");

        this.$el.toggleClass("hidden", !app.hasRole(this.model.get("roles")));
    },
    template: "menu-item-template"
});