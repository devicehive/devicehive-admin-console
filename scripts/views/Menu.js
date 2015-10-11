app.Views.Menu = Backbone.Marionette.ItemView.extend({
    template: 'menu-template',
    events: {
        "click a": "move"
    },
    move: function(e) {
        var link = $(e.target);
        var path = link.attr("data-path");
        Backbone.history.navigate(path, { trigger: true });
    },

    initialize: function(options) {
        var self = this;
        this.collection = options.collection;
        this.collection.on('change', function() {
            self.render();
        });
    }
});
