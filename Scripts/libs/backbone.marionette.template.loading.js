Backbone.Marionette.TemplateCache.prototype.loadTemplate = function (templateId, callback) {
    var that = this;
    var url = app.rootUrl + "/scripts/templates/" + templateId + ".html";

    $.get(url, function (templateHtml) {
        var template = that.compileTemplate($(templateHtml).html());
        callback(template);
    });
};