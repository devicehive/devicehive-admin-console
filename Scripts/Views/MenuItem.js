//MenuItem model should be pushed
app.Views.MenuItem = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    triggers: {
        "click": "move"
    },
    initialize: function () {
        this.bindTo(this.model, "change:selected", this.render);
    },
    beforeRender: function () {
        this.$el.addClass("menu-item");
        
        if(this.model.get("selected"))
            this.$el.addClass("selected");
        else 
            this.$el.removeClass("selected");
        
    },
    template: "menu-item-template"
});