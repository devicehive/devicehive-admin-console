app.Views.Menu = Backbone.Marionette.ItemView.extend({
    template: 'menu-template',
    events: {
        "click a": "move"
    },
    adminVisible: false,
    move: function(e) {
        var link = $(e.target);
        var type = link.attr("data-type");
        if (type == 'admin') {
            this.adminVisible = !this.adminVisible;
            this.render();
            return;
        }
        var path = link.attr("data-path");
        Backbone.history.navigate(path, { trigger: true });
    },
    serializeData: function() {
        var data = {
            main: this.userCollection.toJSON(),
            admin: this.adminCollection.toJSON(),
            options: {adminVisible: this.adminVisible}
        };
        return data;
    },
    initialize: function(options) {
        var self = this;
        this.adminCollection = options.adminCollection;
        this.userCollection = options.userCollection;
        console.log('init this %o', this);
        this.userCollection.on('change', function() {
            self.render();
        });
        this.adminCollection.on('change', function() {
            self.render();
        });
    }
});
