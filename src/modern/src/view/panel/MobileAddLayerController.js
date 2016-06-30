Ext.define('Koala.view.panel.MobileAddLayerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-mobileaddlayer',

    /**
     * Will be called with the 'get layers' button. Issues a GetCapabilities
     * request and sets up handlewrs for reacting on the response.
     */
    requestGetCapabilities: function(){
        var me = this;
        var view = this.getView();
        var form = view.down('formpanel');
        // if (form.isValid()) {
            // view.setLoading(true);
            view.setMasked({
                xtype: 'loadmask',
                message: 'Loading'
            });
            me.removeAddLayersComponents();
            var values = form.getValues();
            var url = values.url;
            delete values.url;

            Ext.Ajax.request({
                url: url,
                method: 'GET',
                params: values,
                scope: me,
                success: me.onGetCapabilitiesSuccess,
                failure: me.onGetCapabilitiesFailure
            });
        // }
    },

    /**
     * Remove the checkboxes ffor layxers from previous requests, and also the
     * interact-toolbar.
     */
    removeAddLayersComponents: function() {
        var me = this;
        var view = this.getView();
        var fs = view.down('[name=fs-available-layers]');
        var tb = view.down('toolbar[name=interact-w-available-layers]');
        fs.removeAll();
        if (tb) {
            view.remove(tb);
        }
    },

    /**
     * Called if we could successfully query for the capabiliteis of a WMS, this
     * methdo will examine the answer and eventually set up a fieldset for all
     * the layers that we have found in the server's answer.
     *
     * @param response {XMLHttpRequest} The response of the request.
     */
    onGetCapabilitiesSuccess: function(response) {
        var me = this;
        var view = this.getView();
        var viewModel = me.getViewModel();
        var parser = viewModel.get('parser');
        var result;
        try {
            result = parser.read(response.responseText);
        } catch(ex) {
            console.log(viewModel.get('errorCouldntParseResponse'));
        }
        var compatibleLayers = me.isCompatibleCapabilityResponse(result);
        if (!compatibleLayers) {
            console.log(viewModel.get('errorIncompatibleWMS'));
        }
        me.fillAvailableLayersFieldset(compatibleLayers);
        me.updateControlToolbarState();
        view.setMasked(false);
    },

    /**
     * Called if we could not successfully query for the capabiliteis of a WMS.
     *
     * @param response {XMLHttpRequest} The response of the request.
     */
    onGetCapabilitiesFailure: function() {
        var view = this.getView();
        view.setMasked(false);
        console.log(this.getViewModel().get('errorRequestFailed'));
    },

    /**
     * Checks if the passed capabilities object (from the #parser) is
     * compatible. It woill return an array of layers if we could determine any,
     * and the boolean value `false` if not.
     *
     * @param {Object} capabilities The GetCapabbilties object as it is returned
     *     by our parser.
     * @return {ol.layer.Tile[]|boolean} Eitehr an array of comüatible layers or
     *     `false`.
     */
    isCompatibleCapabilityResponse: function (capabilities) {
        var me = this;
        var view = this.getView();
        if (!capabilities) {
            return false;
        }
        var version = capabilities.version;
        if (version !== '1.1.1' && version !== '1.3.0') {
            return false;
        }
        var compatible = [];
        var map = BasiGX.util.Map.getMapComponent().getMap();
        var mapProj = map.getView().getProjection().getCode();

        // same in both versions
        var layers = capabilities.Capability.Layer.Layer;
        var url = capabilities.Capability.Request.GetMap.
            DCPType[0].HTTP.Get.OnlineResource;

        var includeSubLayer = view.getIncludeSubLayer();

        Ext.each(layers, function(layer){
            var olLayer = me.getOlLayer(layer, version, mapProj, url);
            if (olLayer) {
                compatible.push(olLayer);
            }

            if (includeSubLayer && Ext.isArray(layer.Layer)) {
                Ext.each(layer.Layer, function(subLayer) {
                    var subOlLayer = me.getOlLayer(
                        subLayer, version, mapProj, url
                    );
                    if (subOlLayer) {
                        compatible.push(subOlLayer);
                    }
                });
            }
        });

        return compatible.length > 0 ? compatible : false;
    },

    /**
     * A utility method that creates an ol.layer.Tile with a ol.source.TileWMS
     * from the properties of a layer from a getCapabilities response.
     *
     * @param {Object} capLayer A layer from a GetCapabilities response
     * @param {String} version The WMS version.
     * @param {String} mapProj The map projection as string.
     * @param {String} url The WMS URL.
     * @return {ol.layer.Tile} The created layer or `undefined`.
     */
    getOlLayer: function(capLayer, version, mapProj, url) {
        // This really should not matter, as ol3 can reproject in the client
        // At least it shoudl be configurable
        if (version === '1.3.0' &&
            Ext.isArray(capLayer.CRS) &&
            !Ext.Array.contains(capLayer.CRS, mapProj)) {
            // only available for 1.3.0
            return;
        }
        var style = capLayer.Style;
        var olSource = new ol.source.TileWMS({
            url: url,
            params: {
                LAYERS: capLayer.Name,
                STYLES: style ? style[0].Name : '',
                VERSION: version
            }
        });
        var olLayer = new ol.layer.Tile({
            topic: true,
            name: capLayer.Title,
            source: olSource,
            legendUrl: style ? style[0].LegendURL[0].OnlineResource : null
        });
        return olLayer;
    },

    /**
     * Takes an array of OpenLayers layers (as gathered by the method to fetch
     * them from the capabilities object #isCompatibleCapabilityResponse) and
     * updates the avaialable layers fieldset with matching entries.
     *
     * @param {ol.layer.Tile[]} layers The layers for which the we shall fill
     *     the fieldset.
     */
    fillAvailableLayersFieldset: function(layers){
        var me = this;
        var view = this.getView();
        me.removeAddLayersComponents();
        var fs = view.down('[name=fs-available-layers]');
        var checkBoxes = [];
        var candidatesInitiallyChecked = view.getCandidatesInitiallyChecked();

        Ext.each(layers, function(layer){
            checkBoxes.push({
                xtype: 'checkboxfield',
                label: layer.get('name'),
                labelWidth: '80%',
                checked: candidatesInitiallyChecked,
                olLayer: layer
            });
        });
        fs.add(checkBoxes);

        var tbItems = [];

        if (view.getHasCheckAllBtn()) {
            tbItems.push({
                xtype: 'button',
                name: 'check-all-layers',
                bind: {
                    text: '{checkAllLayersBtnText}'
                },
                handler: me.checkAllLayers,
                scope: me
            });
        }

        if (view.getHasUncheckAllBtn()) {
            tbItems.push({
                xtype: 'button',
                name: 'uncheck-all-layers',
                bind: {
                    text: '{uncheckAllLayersBtnText}'
                },
                handler: me.uncheckAllLayers,
                scope: me
            });
        }

        tbItems.push({
            xtype: 'button',
            name: 'add-checked-layers',
            bind: {
                text: '{addCheckedLayersBtnText}'
            },
            handler: me.addCheckedLayers,
            scope: me
        });

        view.down('formpanel').add({
            xtype: 'toolbar',
            name: 'interact-w-available-layers',
            items: tbItems
        });
    },

    /**
     * Updates the disabled state of the buttons to control the layer
     * checkboxes (e.g. check all, uncheck all, add selected).
     */
    updateControlToolbarState: function() {
        var me = this;
        var view = this.getView();
        var fs = view.down('[name=fs-available-layers]');
        var allCbs = fs.query('checkboxfield');
        var allChecked = fs.query('[checked=true]');
        var allDisabled = fs.query('[disabled=true]');
        var checkAllBtn = view.down('[name=check-all-layers]');
        var uncheckAllBtn = view.down('[name=uncheck-all-layers]');
        var addBtn = view.down('[name=add-checked-layers]');
        if (allCbs.length === 0) {
            // no checkboxes, also no control toolbar, return
            return;
        }
        if (allDisabled.length === allCbs.length) {
            // all checkboxes are disabled, all controls can be disabled
            addBtn.setDisabled(true);
            if (checkAllBtn) {
                checkAllBtn.setDisabled(true);
            }
            if (uncheckAllBtn) {
                uncheckAllBtn.setDisabled(true);
            }
            return;
        }
        if (allChecked.length > 0) {
            // at least one checkbox is checked
            addBtn.setDisabled(false);
        } else {
            // not even one is checked
            addBtn.setDisabled(true);
        }

        if (checkAllBtn) {
            if (allCbs.length === allChecked.length) {
                // all are checked already
                checkAllBtn.setDisabled(true);
            } else {
                checkAllBtn.setDisabled(false);
            }
        }
        if (uncheckAllBtn) {
            if (allChecked.length === 0) {
                // not a single one is checked
                uncheckAllBtn.setDisabled(true);
            } else {
                uncheckAllBtn.setDisabled(false);
            }
        }
    },

    /**
     * Examines the available layers fieldset, and adds all checked layers to
     * the map.
     */
    addCheckedLayers: function() {
        var me = this;
        var view = this.getView();
        var fs = view.down('[name=fs-available-layers]');
        var checkboxes = fs.query('checkboxfield');
        var map = BasiGX.util.Map.getMapComponent().getMap();
        Ext.each(checkboxes, function(checkbox) {
            if(checkbox.isChecked() && checkbox.isDisabled() !== true){
                me.fireEvent('beforewmsadd', checkbox.olLayer);
                map.addLayer(checkbox.olLayer);
                me.fireEvent('wmsadd', checkbox.olLayer);
                checkbox.setDisabled(true);
            }
        });
        me.updateControlToolbarState();
    }

});
