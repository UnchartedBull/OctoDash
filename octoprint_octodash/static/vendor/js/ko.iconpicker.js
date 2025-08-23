ko.bindingHandlers.iconpicker = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        //initialize iconpicker with some optional options
        var options = allBindingsAccessor().iconpickerOptions || {};
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).attr("data-selected", value);
		$(element).val(value);
        $(element).iconpicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "iconpickerSelected", function (event) {
            var observable = valueAccessor();
            observable(event.iconpickerValue);
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $(element).iconpicker("destroy");
        });

    },
    //update the control when the view model changes
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).attr("data-selected", value);
		$(element).val(value);
    }
};