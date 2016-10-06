Ext.define('Koala.model.StyleSymbolizer', {
    extend: 'Koala.model.Base',

    fields: [{
        name: 'olStyle',
        type: 'auto',
        defaultValue: new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.4)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#3399CC',
                    width: 1.25
                }),
                radius: 5
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.4)'
            }),
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 1.25
            })
        })
    },{
        name: 'symbolType',
        type: 'string'
    }]

});
