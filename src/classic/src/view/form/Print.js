/*global setTimeout*/
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
/**
 * @class Koala.view.form.Print
 */
Ext.define("Koala.view.form.Print", {
    extend: "BasiGX.view.form.Print",
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
        irixUrl: '/irix-servlet',
        serverUploadSuccessTitle: "",
        serverUploadSuccess: "",
        serverErrorTitle: "",
        serverError: "",
        disablePopupBlockerTitle: "",
        disablePopupBlocker: "",
        unexpectedResponseTitle: "",
        unexpectedResponse: ""
    },

    initComponent: function() {
        this.callParent();

        /**
         * necessary to override the BasiGXs bind.
         */
        this.setBind();

        var appContext = BasiGX.view.component.Map.guess().appContext;
        if(appContext && appContext.data.merge.urls["irix-servlet"]){
            this.setIrixUrl(appContext.data.merge.urls["irix-servlet"]);
        }

        var appCombo = this.down('combo[name=appCombo]');
        appCombo.setFieldLabel('Printapp');
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
                    BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER
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
        if(irixCheckBox.getValue()){
            var irixJson = {};
            var mapfishPrint = [];

            if(view.isValid()){
                spec.outputFormat = format;
                mapfishPrint[0] = spec;
                irixJson = this.setUpIrixJson(mapfishPrint);
                url = this.getIrixUrl();
                Ext.Ajax.request({
                    url: url,
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    jsonData: irixJson,
                    scope: view,
                    success: view.irixPostSuccessHandler,
                    failure: view.genericPostFailureHandler
                });
            }
        } else {
            var startTime = new Date().getTime();
            Ext.Ajax.request({
                url: view.getUrl() + app + '/report.' + format,
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                jsonData: Ext.encode(spec),
                scope: view,
                success: function(response) {
                    var data = Ext.decode(response.responseText);
                    view.setLoading(format + ' wird vorbereitet.');
                    view.downloadWhenReady(startTime, data);
                },
                failure: view.genericPostFailureHandler
            });
        }

    },

    /**
     */
    genericPostFailureHandler: function(response) {
        var msg = this.getServerError();
        msg = Ext.String.format(msg, response.status || 'n.a.');
        Ext.Msg.show({
            title: this.getServerErrorTitle(),
            message: msg,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
    },

    /**
     */
    irixPostSuccessHandler: function(response, options) {
        var me = this;
        var irixJson = options.jsonData;
        var chosenRequestType = irixJson['request-type'];
        var uploadOnly = 'upload';
        var repondTypes = ['respond', 'upload/respond'];
        var expectResponse = Ext.Array.contains(
                repondTypes, chosenRequestType
            );

        if (chosenRequestType === uploadOnly) {
            Ext.Msg.show({
                title: me.getServerUploadSuccessTitle(),
                message: me.getServerUploadSuccess(),
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
            });
        } else if (expectResponse) {
            var content = response.responseText;
            if (content) {
                var w;
                var success = false;
                try {
                    w = window.open(
                        'data:application/octet-stream;charset=utf-8,' +
                        encodeURIComponent(content)
                    );
                    success = true;
                } catch(e) {
                    Ext.log.warn(e);
                    try {
                        w = window.open();
                    } catch(e2) {
                        Ext.log.warn(e2);
                    }
                    if (w && 'focus' in w && 'document' in w) {
                         w.document.write(content);
                         w.document.close();
                         w.focus();
                         success = true;
                    }
                }
                if (!success) {
                    Ext.Msg.show({
                        title: me.getDisablePopupBlockerTitle(),
                        message: me.getDisablePopupBlocker(),
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO
                    });
                }
            } else {
                Ext.Msg.show({
                    title: me.getUnexpectedResponseTitle(),
                    message: me.getUnexpectedResponse(),
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.WARNING
                });
            }
        }
    },

    /**
     */
    downloadWhenReady: function(startTime, data){
        var me = this;
        var elapsedMs = (new Date().getTime() - startTime);
        var format = me.down('combo[name="format"]')
            .getValue();

        me.setLoading(format + ' wird vorbereitet: '+ elapsedMs/1000 + 's');

        if (elapsedMs > 30000) {
            Ext.raise('Download aborted after ' + elapsedMs/1000 + ' seconds.');
        } else {
            setTimeout(function () {
                Ext.Ajax.request({
                    url: me.getUrl() + 'status/' + data.ref + '.json',
                    success: function(response) {
                        var statusData = Ext.decode(response.responseText);
                        if(statusData.done){
                            me.setLoading(false);
                            var dlBtn = me.down('button[name="downloadPrint"]');
                            dlBtn.link = me.getUrl() + 'report/' + data.ref;
                            dlBtn.show();
                            var fields = dlBtn.up('k-form-print').query('field');
                            Ext.each(fields, function(field){
                                field.on('change', function(){
                                    dlBtn.hide();
                                });
                            });
                        } else {
                            me.downloadWhenReady(startTime, data);
                        }
                    },
                    failure: function(response) {
                        Ext.raise('server-side failure with status code '
                            + response.status);
                    }
                });
            }, 500);
        }
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
                } else{
                    irixFieldset.hide();
                }
            }
        });

        genericFieldset.add(irixCheckbox);
    },

    addIrixFieldset: function(){
        var me = this;
        var fs = me.down("k-form-irixfieldset");
        var formContainer = me.down('[name="formContainer"]');
        var checkBox = me.down('[name="irix-fieldset-checkbox"]');

        if (!fs) {
            var irixFieldset = Ext.create('Koala.view.form.IrixFieldSet',{
                flex: 2
            });
            formContainer.add(irixFieldset);
        } else {
            checkBox.setValue(false);
        }

    },

    setUpIrixJson: function(mapfishPrint){
        var me = this;
        var irixJson = {};
        irixJson.irix = me.formItemToJson(me.down("k-form-irixfieldset"));
        // the generic serialisation needs a little bit shuffeling
        irixJson = me.adjustIrixSerialisation(irixJson);
        // always add the printapp to the top-lvel for irix:
        irixJson.printapp = me.down('[name="appCombo"]').getValue();
        irixJson['mapfish-print'] = mapfishPrint;
        return irixJson;
    },

    /**
     * Certain fields must live inside the irix fieldset, as they only make
     * sense for this type of "print"; yet their serialisation cannot live in
     * dedicted irix-object, as it is e.g. expected on the top-level. This
     * method will adjust a JSON (e.g. from formItemToJson), and shuffle certain
     * key / value pairs around: currently only 'request-type'.
     *
     * @param {object} irixJson The JSON for the IRIX service, a representation
     *     of the form.
     * @return {object} The adjusted serialisation.
     */
    adjustIrixSerialisation: function(irixJson){
        var irix = irixJson.irix;
        // move requestType or request-type out of irix object to top-level
        var correctRequestTypeKey = 'request-type';
        // For backwards compatibility, we iterate over two variants
        var keysReqestType = ['requestType', correctRequestTypeKey];
        if (irix) {
            var reqType;
            Ext.each(keysReqestType, function(keyRequestType){
                if (keyRequestType in irix) {
                    // if both were present, the dashed version will win.
                    reqType = irix[keyRequestType];
                    // delete the one under key 'irix'
                    delete irixJson.irix[keyRequestType];
                    // set on top-level.
                    irixJson[correctRequestTypeKey] = reqType;
                }
            });
        }
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
