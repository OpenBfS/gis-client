Ext.define('Koala.view.button.TimeReferenceController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-button-timereference',

    setTitleBind: function(btn) {
        var current = btn.getCurrent();
        var staticNs = Koala.view.button.TimeReference;
        var bindProp = current === staticNs.UTC ? '{textUtc}' : '{textLocal}';
        btn.setBind({
            text: bindProp
        });
        btn.blur();
    }

});
