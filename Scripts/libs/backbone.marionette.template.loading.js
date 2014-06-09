Backbone.Marionette.TemplateCache.prototype.loadTemplate = function (templateId, callback) {
    var url = app.rootUrl + "/Scripts/Templates/" + templateId + ".html";

    var templateHtml = "";
    $.ajax({ url: url, async: false, success: function (data) {
        templateHtml = data;
    }});
    return $(templateHtml).html();
};