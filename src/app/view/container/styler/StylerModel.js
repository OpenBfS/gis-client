Ext.define('Koala.view.container.styler.StylerModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.container.styler.styler',
    data: {
        /**
         * An ol.layer.Layer
         */
        layer: null,
        /**
         * An Koala.model.Style
         */
        style: null,
        /**
         * The geometryType 'point', 'polygon' or 'line'
         */
        geometryType: null,
        missingOrInvalidLayerName: 'layerName is required and must be a ' +
            'fully qualified layername.',
        genericError: 'An unspecified error occured',
        failedToFetch: 'The current styling could not be obtained',
        titlePrefix: 'Styling ',
        btnTextReloadCurrentStyle: 'Reset to original style',
        btnTextApplyAndSave: 'Save style',
        dspLayerName: ''
    }

});
