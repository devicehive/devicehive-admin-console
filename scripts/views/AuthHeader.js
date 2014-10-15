app.Views.authHeader = Backbone.Marionette.ItemView.extend({
    template: 'auth-header',
    initialize: function(user) {
        this.userLogin = user.get('login');
    },
    serializeData: function() {
        return {userLogin: this.userLogin};
    },
    onRender: function() {
        console.log('render auth header');
    },
    events: {
        "click a": "clickHandler"
    },
    clickHandler: function(e) {
        console.log('click handler option %o', e);
        e.preventDefault();
        $el = $(e.target);
        Backbone.history.navigate($el.data('path'), { trigger: true });
    }
});