Ext.define('Koala.view.grid.MetadataSearchController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-grid-metadatasearch',

    requires: [
        "Koala.view.window.MetadataInfo"
    ],

    addToMap: function(grid, rowIndex, colIndex, btn, evt, record, row){
        var layer;

        // TODO This has to get more dynamical as usually not every layers name
        // is "WMS"
        // TODO Added WMS are randomly visible or not, ignoring the property
        if(record.get('serviceType').includes('WMS')){
            layer = new ol.layer.Tile({
                name: record.get('name'),
                treeId: Ext.String.createVarName(record.get('name')),
                source: new ol.source.TileWMS({
                    url: record.get('source'),
                    params: {
                        LAYERS: "WMS"
                    }
                }),
                legendUrl: this.getLegendUrlFromRecord(record),
                visible: true
            });
        } else if (record.get('serviceType').includes('WFS')){
            Ext.toast({
                html: 'WFS hinzufügen noch nicht implementiert.',
                title: 'Hinweis',
                align: 'b'
            });
            return;
        }
        Ext.toast({
            html: 'Der Layer <b>' + record.get('name') + '</b> wurde der Karten hinzugefügt.',
            title:'Hinweis',
            align:'b'
        });
        var mapComponent =  Ext.ComponentQuery.query('k-component-map')[0];
        mapComponent.addLayer(layer);
    },

    getInfo: function(grid, rowIndex, colIndex, btn, evt, record, row){
        Ext.create('Koala.view.window.MetadataInfo', {
            title: record.get('name'),
            layout: 'fit',
            record: record
        }).show();
    },

    getLegendUrlFromRecord: function(record){
        var legendURL = record.get('source') +
            '?service=' + record.get('serviceType').split(' ')[0] +
            '&version=' + record.get('serviceType').split(' ')[1] +
            '&request=GetLegendGraphic&layer=WMS&width=40&height=40&format=image/png';
        return legendURL;
    }
});
