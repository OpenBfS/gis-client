Ext.define('Koala.view.container.styler.GeoStylerModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.container.styler.geostyler',
    data: {
        /**
         * An ol.layer.Layer
         */
        layer: null,
        /**
         * A GeoStyler-Style
         */
        style: {
            name: 'Default Style',
            rules: [
                {
                    name: 'Rule 1',
                    symbolizers: [
                        {
                            kind: 'Mark',
                            wellKnownName: 'circle'
                        }
                    ]
                }

            ]
        },
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
        dspLayerName: '',
        saveStyle: '',
        styleNotConvertedMsg: '',
        downloadStyleMsgTitle: '',
        downloadFilenameText: '',
        filenameNotValidText: '',
        outputFormatText: '',
        downloadStyleMsgButtonYes: '',
        downloadStyleMsgButtonNo: ''
    }

});
