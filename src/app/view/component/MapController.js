Ext.define('Koala.view.component.MapController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-component-map',

    requires: [
        "Koala.view.window.TimeSeriesWindow",
        "Koala.view.window.BarChart"
    ],

    pendingRequest: null,

    /**
     *
     */
    onHoverFeatureClick: function(olFeat) {
        var me = this;
        if(olFeat.get('layer').get('name') === 'Kartodiagramm') {
            me.openBarChartWindow(olFeat);
        } else if(olFeat.get('layer').get('name') === 'Messstationen'){
            me.openTimeseriesWindow(olFeat);
        } else {
            me.openGetFeatureInfoWindow(olFeat);
        }
    },

    /**
     * This is finally a complete OVERRIDE of the getToolTipHtml function from
     * the base class Basepackage.view.component.Map!
     */
    getToolTipHtml: function(layers, features){
        var innerHtml = '';
        var treeSelection = Ext.ComponentQuery
            .query("base-panel-legendtree")[0].getSelection();

        Ext.each(layers, function(layer, index, allItems){
            var hoverfield = layer.get('hoverfield');
            innerHtml += '<b>'+layer.get('name')+'</b>';
            Ext.each(features, function(feat){
                // we check for existing feature first as there maybe strange
                // situations (e.g. when zooming while hovering)
                // where feat is undefined and feat.get would throw an error
                if(feat && feat.get('layer') === layer){
                    innerHtml += '<br />' + feat.get(hoverfield) + '<br />';
                }
            });
            if(treeSelection.length === 0){
                return false;
            }
            if(!(index+1 === allItems.length)){
                innerHtml += '<br />';
            }
        });

        return innerHtml;
    },

    /**
    *
    */
    openBarChartWindow: function(olFeat) {
       var me = this;
       var olLayer = olFeat.get('layer');
       win = Ext.create("Koala.view.window.BarChart");
       win.getController().createOrUpdateChart(olLayer, olFeat);

       // show the window itself
       win.show();
   },

    /**
     *
     */
    openTimeseriesWindow: function(olFeat) {
        var me = this;
        var win = Ext.ComponentQuery.query('window[name=timeserieswin]')[0];
        var olLayer = olFeat.get('layer');

        // create the window if it doesn't exist already
        if (!win) {
            win = me.createTimeSeriesChartWindow();
        }

        win.getController().createOrUpdateChart(olLayer, olFeat);

        // show the window itself
        win.show();
    },

    /**
    *
    */
   openGetFeatureInfoWindow: function(olFeat) {
       var me = this;
       var win = Ext.ComponentQuery.query('window[name=getfeatureinfowin]')[0];

       // create the window if it doesn't exist already
       if (!win) {
//           win = Ext.create("Koala.view.window.GetFeatureInfoWindow");
       }
//       win.show();
   },

    /**
     *
     */
    createTimeSeriesChartWindow: function() {
        var win = Ext.create("Koala.view.window.TimeSeriesWindow");
        return win;
    },

    // THE FOLLOWING METHODS WILL SIMPLY CALL THE CORRESPONDING METHODS
    // OF THE VIEW. THIS WILL USUALLY BY CODE THAT IS IMPLEMENTED IN
    // Basepackage.view.component.Map
    // We have to implement this as we are using defaultListenerScope=false
    // in Koala.view.component.Map
    /**
     *
     */
    addHoverVectorLayerInteraction: function() {
        var me = this;
        var view = me.getView();

        view.addHoverVectorLayerInteraction();
    },

    /**
     *
     */
    onFeatureClicked: function(olEvt) {
        var me = this;
        var view = me.getView();

        view.onFeatureClicked(olEvt);
    },

    /**
     *
     */
    addHoverVectorLayerSource: function() {
        var me = this;
        var view = me.getView();

        view.addHoverVectorLayerSource();
    },

    /**
     *
     */
    addHoverVectorLayer: function() {
        var me = this;
        var view = me.getView();

        view.addHoverVectorLayer();
    },

    /**
     *
     */
    clearPendingRequests: function() {
        var me = this;
        var view = me.getView();

        view.clearPendingRequests();
    },

    /**
     *
     */
    requestAsynchronously: function(url, cb) {
        var me = this;
        var view = me.getView();

        view.requestAsynchronously(url, cb);
    },

    /**
     */
    onPointerRest: function(evt){
        var me = this;
        var view = me.getView();

        view.onPointerRest(evt);
    },

    /**
     *
     */
    showHoverFeature: function(layer, features) {
        var me = this;
        var view = me.getView();

        view.showHoverFeature(layer, features);
    },

    /**
     *
     */
    showHoverToolTip: function(evt, layer, features) {
        var me = this;
        var view = me.getView();

        view.showHoverToolTip(evt, layer, features);
    }
});