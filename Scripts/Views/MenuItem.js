//MenuItem model should be pushed
app.Views.MenuItem = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    triggers: {
        "click": "move"
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

        var requiredRoles = this.model.get("roles");
        this.$el.toggle(
            app.isLoggedIn() && (requiredRoles == null || _.indexOf(requiredRoles, app.User.get("role")) != -1));
    },
    template: "menu-item-template"
});