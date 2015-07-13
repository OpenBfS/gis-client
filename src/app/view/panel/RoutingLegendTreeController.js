Ext.define('Koala.view.panel.RoutingLegendTreeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.k-panel-routing-legendtree',

    /**
     * 
     */
    setRouting: function(store){
        var layers =[];
        store.each(function(rec){
            if(rec.get('checked')){
                if(rec.getOlLayer().get('treeId')){
                    layers.push(rec.getOlLayer().get('treeId'));
                }
            }
        });
        this.redirectTo('treeLayers/'+ layers.toString());
    },

    onSelectionChange: function(selectionModel, selectedRecords, eOpts){
        var store = this.getView().getStore();

        // Sets topic to false on every not selected layer that has an hoverfield
        if(selectedRecords.length > 0){
            store.each(function(layerRec){
                if(layerRec.getOlLayer().get('hoverfield')){
                    layerRec.getOlLayer().set('topic', false);
                }
            });
            // Sets topic to true for the selected layers that have an hoverfield
            Ext.each(selectedRecords, function(selectedRecord){
                var olLayer = selectedRecord.getOlLayer();
                if(olLayer && olLayer.get('hoverfield')){
                    olLayer.set('topic', true);
                }
            });
        // Sets topic to true on every layer that has an hoverfield, if none is selected
        } else {
            store.each(function(layerRec){
                if(layerRec.getOlLayer().get('hoverfield')){
                    layerRec.getOlLayer().set('topic', true);
                }
            });
        }
    }
});
