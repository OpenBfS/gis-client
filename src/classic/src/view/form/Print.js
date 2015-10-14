/* Copyright (c) 2015 terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
Ext.define("Koala.view.form.Print", {
    extend: "Basepackage.view.form.Print",
    xtype: "k-form-print",

    requires: [
        'GeoExt.data.MapfishPrintProvider',
        'GeoExt.data.serializer.ImageWMS',
        'GeoExt.data.serializer.TileWMS',
        'GeoExt.data.serializer.Vector',

        'Koala.view.form.IrixFieldSet'
    ],

    maxHeight: null,
    maxWidth: 800,

    config: {
        irixUrl: '/irix-servlet'
    },

    initComponent: function() {
        this.callParent();

        /**
         * necessary to override the BasePackages bind.
         */
        this.setBind();

        var appContext = Basepackage.view.component.Map.guess().appContext;
        if(appContext && appContext.data.merge.urls["irix-servlet"]){
            this.setIrixUrl(appContext.data.merge.urls["irix-servlet"]);
        }

        var appCombo = this.down('combo[name=appCombo]');
        appCombo.setFieldLabel('Printapp');
        appCombo.setWidth(248);
        appCombo.getStore().sort('field1', 'ASC');
        appCombo.on('select', this.addIrixFieldset, this);

    },

    listeners: {
        genericfieldsetadded: function(){
            this.addIrixCheckbox();
        }
    },

    /**
     * Overrides the default createPrint method;
     */
    createPrint: function(){
        var view = this;
        var spec = {};
        var mapComponent = view.getMapComponent();
        var mapView = mapComponent.getMap().getView();
        var viewRes = mapView.getResolution();
        var layoutCombo = view.down('combo[name="layout"]');
        var layout = layoutCombo.getValue();
        var formatCombo = view.down('combo[name="format"]');
        var format = formatCombo.getValue();
        var attributes = {};
        var projection = mapView.getProjection().getCode();
        var rotation = mapView.getRotation();

        layoutCombo.getStore().sort('name', 'ASC');
        formatCombo.getStore().sort('field1', 'ASC');

        var printLayers = [];
        var serializedLayers = [];

        mapComponent.getLayers().forEach(function(layer){
            if(layer.get('printLayer')){
                printLayers.push(layer.get('printLayer'));
            } else {
                var isChecked = !!layer.checked;
                var hasName = isChecked && !!layer.get('name');
                var nonOpaque = hasName && (layer.get('opacity') > 0);
                var inTree = nonOpaque && (layer.get(
                    Basepackage.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER
                ) !== false); // may be undefined for certain layers

                if (isChecked && hasName && nonOpaque && inTree) {
                    if(layer instanceof ol.layer.Vector &&
                        layer.getSource().getFeatures().length < 1){
                        return false;
                    }
                    printLayers.push(layer);
                } else {
                    return false;
                }
            }
        });

        Ext.each(printLayers, function(layer){
            var source = layer.getSource();
            var serialized = {};

            var serializer = GeoExt.data.MapfishPrintProvider
                .findSerializerBySource(source);
            if (serializer) {
                serialized = serializer.serialize(layer, source, viewRes);
                serializedLayers.push(serialized);
            }
        }, this);

        var fieldsets =
            view.query('fieldset[name=attributes] fieldset');

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
        var additionalFields = view.query(
            'fieldset[name=attributes]>field[name!=dpi]'
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

        var app = view.down('combo[name=appCombo]').getValue();
        var url = view.getUrl() + app + '/buildreport.' + format;
        spec.attributes = attributes;
        spec.layout = layout;
        spec.outputFilename = layout;

        var irixCheckBox = this.down('[name="irix-fieldset-checkbox"]');
        var submitForm;

        if(irixCheckBox.getValue()){
            var irixJson = {};
            var mapfishPrint = [];

            spec.outputFormat = format;
            mapfishPrint[0] = spec;
            irixJson = this.setUpIrixJson(mapfishPrint);
            url = this.getIrixUrl();

            submitForm = Ext.create('Ext.form.Panel', {
                standardSubmit: true,
                url: url,
                method: 'POST',
                items: [{
                    xtype: 'textfield',
                    name: 'irixJson',
                    value: Ext.encode(irixJson)
                }]
            });
        } else {
            submitForm = Ext.create('Ext.form.Panel', {
                standardSubmit: true,
                url: url,
                method: 'POST',
                items: [{
                    xtype: 'textfield',
                    name: 'spec',
                    value: Ext.encode(spec)
                }]
            });
        }
        submitForm.submit();

    },

    addIrixCheckbox: function(){
        var me = this;
        var genericFieldset = me.down('fieldset[name=generic-fieldset]');
        var irixCheckbox = Ext.create('Ext.form.field.Checkbox', {
            name: 'irix-fieldset-checkbox',
            boxLabel: 'IRIX',
            handler: function(checkbox, checked){
                var irixFieldset = me.down("k-form-irixfieldset");
                if(checked){
                    irixFieldset.show();
                    me.setWidth(me.getWidth() * 3);
                } else{
                    irixFieldset.hide();
                    me.setWidth(me.getWidth() / 3);
                }
            }
        });

        genericFieldset.add(irixCheckbox);
    },

    addIrixFieldset: function(){
        var me = this;
        var fs = me.down("k-form-irixfieldset");
        var formContainer = me.down('[name="formContainer"]');

        if (!fs) {
            var irixFieldset = Ext.create('Koala.view.form.IrixFieldSet',{
                flex: 2
            });
            formContainer.add(irixFieldset);
        }

    },

    setUpIrixJson: function(mapfishPrint){
        var irixJson = {};
        irixJson.irix = this.formItemToJson(this.down("k-form-irixfieldset"));
        irixJson['mapfish-print'] = mapfishPrint;

        return irixJson;
    },

    formItemToJson: function(formItem){
        var me = this;
        var children = formItem.items.items;
        var json = {};

        Ext.each(children, function(child){
            if(child instanceof Ext.form.FieldSet ||
                child instanceof Ext.form.FieldContainer){
                json[child.name] = me.formItemToJson(child);
            } else {
                json[child.name] = child.getValue();
            }
        });

        return json;
    }
});
