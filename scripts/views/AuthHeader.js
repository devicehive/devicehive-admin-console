app.Views.authHeader = Backbone.Marionette.ItemView.extend({
    template: 'auth-header',
    initialize: function(user) {
        this.userLogin = user.get('login');
    },
    serializeData: function() {
        return {userLogin: this.userLogin};
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
