//push app.Models.User here
app.Views.UserCreateEdit = Backbone.Marionette.ItemView.extend({
    triggers: {
        "click .close" : "onCloseClick"  
    },
    events: {
        "click .save": "save"
    },
    beforeRender: function () {
        this.$el.addClass("users-edit panel");
    },
    template: "user-create-edit-template",
    initialize: function () {
        if (_.isUndefined(this.model))
            this.model = new app.Models.User();
    },
    save: function () {
        var login = this.$el.find("#login").val();
        var role = parseInt(this.$el.find("#role :selected").val());
        var status = parseInt(this.$el.find("#status :selected").val());
        var options = {
            login: login,
            role: role,
            status: status
        };

        var pass = this.$el.find("#password").val();
        var passConf = this.$el.find("#password-confirmation").val();

        if (!_.isEmpty(pass)) {
            if (pass != passConf) {
                var message = "Pasword confirmation isn't match password";
                app.vent.trigger("notification", app.Enums.NotificationType.Error, message);
                return;
            }
            options.password = pass;
        };

        var that = this;
        this.model.save(options, { error: this.onSaveFail, success: function (model, response) { that.onSaveSuccess(model, response); }, wait:true });
    },
    onSaveSuccess: function (model, response) {
            this.trigger("onAfterUserSave", model);
    },

    onSaveFail: function (model, response) {
        app.vent.trigger("notification", app.Enums.NotificationType.Error, response);
    },

    serializeData: function () {
        var base = this.model.toJSON({ escape: true });
        base.Statuses = app.Enums.UserStatus;
        base.Roles = app.Enums.UserRole;
        base.saveButtonText = this.model.isNew() ? "create" : "save";
        base.HeadingText = this.model.isNew() ? "Creating new user" : "Editing user " + base.login;

        return base;
    }
});

