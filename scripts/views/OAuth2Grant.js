//model is an app.Models.DeviceClass
app.Views.OAuth2IssueGrant = Backbone.Marionette.ItemView.extend({
    events: {
        'submit form': 'requestGrant' 
    },
    initialize: function (options) {
        console.log('OAuth2IssueGrant init options %o this %o', options, this);
        this.oauth = options.oauth;
        this.networksCollection = options.networksCollection;
        this.scopeCollection = options.scopeCollection;
        var self = this;
        this.networksCollection.on('reset', function() {
            self.render();
        });
    },
    onRender: function() {
        var $el = this.$el;
        var $form = $el.find('form');
        $el.find('#cb-limit-networks').on('change', function(e) {
            $this = $(this);
            $el.find('#oauth-network-list').toggleClass('ui-helper-hidden', !$this.prop('checked'));
            if ( !$this.prop('checked') ) {
                $el.find('#oauth-network-list input[type=checkbox]').prop('checked', false);
            }
        });
    },
    template: "oauth-issue-grant",
    serializeData: function (p) {
        console.log('serialize p %o', p);
        var data = {
            oauth: this.oauth.toJSON(),
            networksCollection: this.networksCollection.toJSON(),
            scopeCollection: this.scopeCollection.toJSON()
            };
        return data;
    },
    requestGrant: function(e) {
        console.log('issue grant callback, event %o', e);
        e.preventDefault();
        var $el = this.$el;
        var networkIds = _.map($el.find('form input[name=network-id]:checked'), function(item){
            console.log('item %o', item);
            return Number($(item).val());
        });
        console.log('network ids %o', networkIds);
        app.OAuth2.requestGrant(networkIds);
    }
});
