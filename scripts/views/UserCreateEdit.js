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
        if (_.isUndefined(this.model)) {
            this.model = new app.Models.User();
        } else {
            if(this.model.attributes.googleLogin == null) {
                this.model.attributes.googleLogin = "";
            }
            if(this.model.attributes.facebookLogin == null) {
                this.model.attributes.facebookLogin = "";
            }
            if(this.model.attributes.githubLogin == null) {
                this.model.attributes.githubLogin = "";
            }
        }
    },
    save: function () {
        var login = this.$el.find("#login").val();
        var role = parseInt(this.$el.find("#role :selected").val());
        var status = parseInt(this.$el.find("#status :selected").val());
        var data = this.$el.find("#data").val();
        if (!this.model.setStrData(data)) { return; }
        var googleLogin = this.$el.find("#googleLogin").val();
        if (_.isEmpty(googleLogin)) {
            googleLogin = null;
        }
        var facebookLogin = this.$el.find("#facebookLogin").val();
        if (_.isEmpty(facebookLogin)) {
            facebookLogin = null;
        }
        var githubLogin = this.$el.find("#githubLogin").val();
        if (_.isEmpty(githubLogin)) {
            githubLogin = null;
        }
        var options = {
            login: login,
            role: role,
            status: status,
            googleLogin: googleLogin,
            facebookLogin: facebookLogin,
            githubLogin: githubLogin
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
        if (_.has(base, "data") && !_.isNull(base.data))
            base["data"] = JSON.stringify(base.data);
        else
            base["data"] = "";
        base.Statuses = app.Enums.UserStatus;
        base.Roles = app.Enums.UserRole;
        base.saveButtonText = this.model.isNew() ? "create" : "save";
        base.HeadingText = this.model.isNew() ? "Creating new user" : "Editing user " + base.login;

        return base;
    },

    onRender: function() {
        if (app.config.googleConfig) {
            this.$el.find(".google-identity-login").removeClass('ui-helper-hidden');
        }
        if (app.config.facebookConfig) {
            this.$el.find(".facebook-identity-login").removeClass('ui-helper-hidden');
        }
        if (app.config.githubConfig) {
            this.$el.find(".github-identity-login").removeClass('ui-helper-hidden');
        }
    },
    onShow: function() {
        // scroll to make edit form visible, focus on first input field
        this.$el[0].scrollIntoView(true);
        this.$el.find('input[type=text]').first().focus();
    }
});

