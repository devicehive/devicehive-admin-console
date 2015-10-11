app.Views.authHeader = Backbone.Marionette.ItemView.extend({
    template: 'auth-header',
    initialize: function(options) {
        this.user = options.user;
    },
    serializeData: function() {
        return {userLogin: this.user.get('login')};
    },
    events: {
        "click a": "clickHandler"
    },
    clickHandler: function(e) {
        e.preventDefault();
        $el = $(e.target);
        Backbone.history.navigate($el.data('path'), { trigger: true });
    }
});
