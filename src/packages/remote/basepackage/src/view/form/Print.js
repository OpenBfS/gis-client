/*global Ext, ol, GeoExt*/
/*jshint curly:true, eqeqeq:true, latedef:true, newcap:true, noarg:true, undef:true, trailing:true, maxlen:80*/
/**
 *      _                             _        _          
 *    _| |_ ___  _ _  _ _  ___  ___ _| |_ _ _ <_> ___     
 *     | | / ._>| '_>| '_>/ ._><_-<  | | | '_>| |<_-<     
 *     |_| \___.|_|  |_|  \___./__/  |_| |_|  |_|/__/     
 *                                                        
 *   _                                 _                  
 *  | |_  ___  ___ ___  ___  ___  ___ | |__ ___  ___  ___ 
 *  | . \<_> |<_-</ ._>| . \<_> |/ | '| / /<_> |/ . |/ ._>
 *  |___/<___|/__/\___.|  _/<___|\_|_.|_\_\<___|\_. |\___.
 *                     |_|                      <___'     
 *
 * Print FormPanel
 * 
 * Used to show an Mapfish Print v3 compatible print panel
 * 
 */
Ext.define("Basepackage.view.form.Print",{
    extend: "Ext.form.Panel",
    xtype: "base-form-print",

    requires: [
        "Ext.window.Toast",
        "Ext.form.action.StandardSubmit",

        "GeoExt.data.MapfishPrintProvider"
    ],

    defaultListenerScope: true,

    viewModel: {
        data: {
            title: 'Drucken',
            labelDpi: 'DPI',
            printButtonSuffix: 'anfordern',
            printFormat: 'pdf',
            genericFieldSetTitle: 'Einstellungen'
        }
    },

    bind:{
        title: '{title}'
    },

    maxHeight: 250,

    autoScroll:true,

    config: {
        url: null,
        store: null
    },

    borderColors: [
        '#FF5050',
        '#00CCFF',
        '#FFFF99',
        '#CCFF66'
    ],

    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    bodyPadding: '0 5px 0 0',

    extentLayer: null,

    provider: null,

    defaultType: 'textfield',

    initComponent: function(){
        var store;
        var url = this.getUrl();

        if(!url){
            this.html = 'No Url provided!';
            this.callParent();
            return;
        }

        this.callParent();

        var appsStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            proxy: {
                type: 'jsonp',
                url: url + 'apps.json',
                callbackKey: 'jsonp'
            },
            listeners: {
                load: function(store, records) {
                    var rawValues = [];
                    Ext.each(records, function(rec){
                        rawValues.push(rec.raw);
                    });
                    this.down('combo[name=appCombo]').setStore(rawValues);
                },
                scope: this
            }
        });
        this.add({
            xtype: 'combo',
            name: 'appCombo',
            allowBlank: false,
            forceSelection: true,
            store: appsStore,
            listeners: {
                select: 'onAppSelected',
                scope: this
            }
        });

        this.on('afterrender', this.addExtentLayer, this);
        this.on('afterrender', this.addParentCollapseExpandListeners, this);

    },

    bbar: [{
        xtype: 'button',
        name: 'createPrint',
        bind:{
            text: '{printFormat:uppercase} {printButtonSuffix}'
        },
        formBind: true,
        handler: function(){
            var spec = {};
            var view = this.up('base-form-print');
            var mapComponent = view.getMapComponent();
            var mapView = mapComponent.getMap().getView();
            var layout = view.down('combo[name="layout"]').getValue();
            var format = view.down('combo[name="format"]').getValue();
            var attributes = {};
            var projection = mapView.getProjection().getCode();
            var rotation = mapView.getRotation();

            var printLayers = 
                Ext.Array.filter(mapComponent.getLayers().getArray(),
                function(layer) {
                    if (layer.checked &&
                        layer.get('name') &&
                        layer.get('name') !== "hoverVectorLayer") {
                        return true;
                    } else {
                        return false;
                    }
                });

            var serializedLayers = 
                GeoExt.data.MapfishPrintProvider.getSerializedLayers(
                    printLayers
            );
            var fieldsets =
                view.query('fieldset[name!="generic-fieldset"] fieldset');

            Ext.each(fieldsets, function(fs){
                var name = fs.name;
                // TODO double check when rotated
                var featureBbox = fs.extentFeature.getGeometry().getExtent();
                var dpi = fs.down('[name="dpi"]').getValue();

                attributes[name] = {
                    bbox: featureBbox,
                    dpi: dpi,
                    // TODO Order of Layers in print seems to be reversed.
                    layers: serializedLayers.reverse(),
                    projection: projection,
                    rotation: rotation
                };

            }, this);

            // Get all Fields except the DPI Field
            // TODO This query should be optimized or changed into some
            // different kind of logic
            var additionalFields =view.query(
                'fieldset[name!="generic-fieldset"]>field[name!=dpi]'
            );
            Ext.each(additionalFields, function(field){
                if(field.getName() === 'legend') {
                    attributes.legend = view.getLegendObject();
                } else if (field.getName() === 'scalebar') {
                    attributes.scalebar = view.getScaleBarObject();
                } else if (field.getName() === 'northArrow') {
                    attributes.scalebar = view.getNorthArrowObject();
                } else {
                    attributes[field.getName()] = field.getValue();
                }
            }, this);

            var url = view.getUrl();
            var app = view.down('combo[name=appCombo]').getValue();
            spec.attributes = attributes;
            spec.layout = layout;
            var submitForm = Ext.create('Ext.form.Panel', {
                standardSubmit: true,
                url: url +app + '/buildreport.' + format,
                method: 'POST',
                items: [
                    {
                        xtype: 'textfield',
                        name: 'spec',
                        value: Ext.encode(spec)
                    }
                ]
            });
            submitForm.submit();
        },
        disabled: true
    }],

    listeners: {
        collapse: 'cleanupPrintExtent',
        resize: 'renderAllClientInfos'
    },

    addParentCollapseExpandListeners: function(){
        var parent = this.up();
        parent.on({
            collapse: 'cleanupPrintExtent',
            expand: 'renderAllClientInfos',
            scope: this
        });
    },

    /**
     *
     */
    addExtentLayer: function(){
        var layer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        Ext.ComponentQuery.query('gx_map')[0].addLayer(layer);
        this.extentLayer = layer;
    },

    getMapComponent: function(){
        return Ext.ComponentQuery.query('gx_component_map')[0];
    },

    onPrintProviderReady: function(provider){
        var view = this;
        this.addGenericFieldset(provider);
    },

    onAppSelected: function(appCombo){
        this.provider = Ext.create('GeoExt.data.MapfishPrintProvider', {
            url: this.getUrl() + appCombo.getValue() + '/capabilities.json',
            listeners: {
                ready: 'onPrintProviderReady',
                scope: this
            }
         });
    },

    removeGenericFieldset: function(){
        var view = this;
        var fs = view.down('[name="generic-fieldset"]');
        if (fs) {
            view.remove(fs);
        }
    },

    addGenericFieldset: function(provider){
        var view = this;
        var fs = view.down('[name="generic-fieldset"]');
        if (fs) {
            fs.removeAll();
        } else {
            view.add({
                xtype: 'fieldset',
                bind: {
                    title: '{genericFieldSetTitle}'
                },
                name: 'generic-fieldset',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                }
            });
        }
        this.addLayoutCombo(provider);
        this.addFormatCombo(provider);
    },

    addFormatCombo: function(provider){
        var fs = this.down('fieldset[name=generic-fieldset]');
        var formatStore = provider.capabilityRec.get('formats');
        var formatCombo = {
            xtype: 'combo',
            name: 'format',
            displayField: 'name',
            editable: false,
            forceSelection: true,
            queryMode: 'local',
            valueField: 'name',
            store: formatStore,
            bind: {
                value: '{printFormat}'
            }
        };
        fs.add(formatCombo);
    },

    addLayoutCombo: function(provider){
        var fs = this.down('fieldset[name=generic-fieldset]');
        var layoutStore = provider.capabilityRec.layouts();
        var layoutCombo = {
            xtype: 'combo',
            name: 'layout',
            displayField: 'name',
            editable: false,
            forceSelection: true,
            queryMode: 'local',
            valueField: 'name',
            store: layoutStore,
            listeners: {
                change: this.onLayoutSelect,
                scope: this
            }
        };
        layoutCombo = fs.add(layoutCombo);
        layoutCombo.select(layoutStore.getAt(0));
    },

    // TODO REMOVE EXTENT
    onLayoutSelect: function(combo, layoutname){
        var view = this,
            attributesFieldset = view.down('fieldset[name=attributes]'),
            layoutRec = combo.findRecordByValue(layoutname),
            attributeFieldset;

        view.remove(attributesFieldset);

        // add the layout attributes fieldset:
        attributeFieldset = view.add({
            xtype: 'fieldset',
            title: 'Eigenschaften',
            name: 'attributes',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            }
        });

        layoutRec.attributes().each(function(attribute, cnt){
            this.addAttributeFields(attribute, attributeFieldset);
        }, this);

        this.renderAllClientInfos();
        view.down('button[name="createPrint"]').enable();
    },

    getMapAttributeFields: function (attributeRec) {
        var clientInfo = attributeRec.get('clientInfo');
        var mapTitle = attributeRec.get('name') + ' (' +
            clientInfo.width + ' × ' +
            clientInfo.height + ')';
        var fs = {
            xtype: 'fieldset',
            clientInfo: Ext.clone(clientInfo),
            title:  mapTitle,
            name: attributeRec.get('name'),
            items: {
                xtype: 'combo',
                name: 'dpi',
                editable: false,
                forceSelection: true,
                bind: {
                    fieldLabel: '{labelDpi}'
                },
                queryMode: 'local',
                labelWidth: 40,
                grow: true,
                value: clientInfo.dpiSuggestions[0],
                store: clientInfo.dpiSuggestions
            }
        };
        return fs;
    },

    getCheckBoxAttributeFields: function (attributeRec) {
        return {
            xtype: 'checkbox',
            name: attributeRec.get('name'),
            checked: true,
            fieldLabel: attributeRec.get('name'),
            boxLabel: '…verwenden?'
        };
    },

    getNorthArrowAttributeFields: function (attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },

    getLegendAttributeFields: function (attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },

    getScalebarAttributeFields: function (attributeRec) {
        return this.getCheckBoxAttributeFields(attributeRec);
    },

    getStringField: function (attributeRec) {
        return {
            xtype: 'textfield',
            name: attributeRec.get('name'),
            fieldLabel: attributeRec.get('name'),
            allowBlank: false
        };
    },

    addAttributeFields: function(attributeRec, fieldset){
        var view = this;
        var olView = this.getMapComponent().getMap().getView();

        var attributeFields;
        switch (attributeRec.get('type')) {
            case "MapAttributeValues":
                attributeFields = this.getMapAttributeFields(attributeRec);
                olView.on('propertychange', this.renderAllClientInfos, this);
                break;
            case "NorthArrowAttributeValues":
                attributeFields =
                    this.getNorthArrowAttributeFields(attributeRec);
                break;
            case "ScalebarAttributeValues":
                attributeFields = this.getScalebarAttributeFields(attributeRec);
                break;
            case "LegendAttributeValue":
                attributeFields = this.getLegendAttributeFields(attributeRec);
                break;
            case "String":
                attributeFields = this.getStringField(attributeRec);
                break;
            case "DataSourceAttributeValue":
                Ext.toast('Data Source not ye supported');
                attributeFields = this.getStringField(attributeRec);
                break;
            default:
                break;
        }

        if (attributeFields) {
            fieldset.add(attributeFields);
        }
    },

    /**
     * TODO: NB: Enhance performance! This method seems to be called too often!
     */
    renderAllClientInfos: function(){
        var view = this;
        if (view._renderingClientExtents || view.getCollapsed() !== false) {
            return;
        }
        view._renderingClientExtents = true;

        view.extentLayer.getSource().clear();

        var fieldsets = view.query(
            'fieldset[name!="generic-fieldset"] fieldset'
        );
        Ext.each(fieldsets, function(fieldset){
            var feat = GeoExt.data.MapfishPrintProvider.renderPrintExtent(
                    this.getMapComponent(), view.extentLayer,
                    fieldset.clientInfo
            );
            fieldset.extentFeature = feat;
        }, this);
        delete view._renderingClientExtents;
    },

    cleanupPrintExtent: function(){
        var view = this;
        view.extentLayer.getSource().clear();
    },

    getLegendObject: function() {
        var view = this;
        var layerStore = this.getMapComponent().getStore();
        var classes = [];

        layerStore.each(function(rec){
            var name = rec.get('text');
            var layer = rec.getOlLayer();
            var source = layer.getSource();
            if (source instanceof ol.source.TileWMS) {
                var url = source.getUrls()[0];
                var iconString = url + "?" +
                    "TRANSPARENT=TRUE&" +
                    "VERSION=1.1.1&" +
                    "SERVICE=WMS&" +
                    "REQUEST=GetLegendGraphic&" +
                    "EXCEPTIONS=application%2Fvnd.ogc.se_xml&" +
                    "FORMAT=image%2Fgif&" +
                    "SCALE=6933504.262556662&" +
                    "LAYER=";
                    iconString += source.getParams().LAYERS;
                classes.push({
                    icons: [iconString],
                    name: name
                });
            }
        }, this);

        var legendObj = {
                classes: classes,
                name: ""
        };

        return legendObj;
    },

    getNorthArrowObject: function() {
        // TODO
        var northArrowObject = {};

        return northArrowObject;
    },

    getScaleBarObject: function() {
        // TODO
        var scaleBarObj = {};

        return scaleBarObj;
    },

    getLayoutRec: function(){
        var combo = this.down('combo[name="layout"]');
        var value = combo.getValue();
        var rec = combo.findRecordByValue(value);
        return rec;
    }
});
