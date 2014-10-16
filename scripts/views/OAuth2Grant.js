//model is an app.Models.DeviceClass
app.Views.OAuth2IssueGrant = Backbone.Marionette.CompositeView.extend({
    initialize: function (options) {
        console.log('init options %o', options);
        this.oauth = options.oauth;
        this.networksCollection = options.networksCollection;
    },
    onRender: function (p) {
        console.log('onRender p %o', p);
    },
    template: "oauth-issue-grant",
    serializeData: function (p) {
        console.log('serialize p %o', p);
        var data = {
            oauth: this.oauth.toJSON(),
            networksCollection: this.networksCollection.toJSON()
            };
        return data;
    }
});
// 
// //collection is an app.Models.DeviceClassesCollection
// app.Views.DeviceClasses = Backbone.Marionette.CompositeView.extend({
    // events: {
        // "click .add": "addNewClass"
    // },
    // itemView: app.Views.DeviceClassesListItem,
    // template: "device-class-template",
    // emptyView: Backbone.Marionette.ItemView.extend(
        // {
            // render: function () {
                // this.$el.html("<td colspan='6'>there are no device classes has been registered yet. Create first one!</td>");
                // return this;
            // },
            // tagName: "tr"
        // }),
    // itemViewContainer: "tbody",
    // addNewClass: function () {
        // this.collection.add(new app.Models.DeviceClass());
    // }
// });
// 
