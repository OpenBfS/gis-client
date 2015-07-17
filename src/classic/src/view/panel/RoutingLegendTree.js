Ext.define("Koala.view.panel.RoutingLegendTree",{
    extend: "Basepackage.view.panel.LegendTree",
    xtype: "k-panel-routing-legendtree",

    requires: [
        "Koala.view.panel.RoutingLegendTreeController",
        "Koala.view.panel.RoutingLegendTreeModel"
    ],

    controller: "k-panel-routing-legendtree",

    viewModel: {
        type: "k-panel-routing-legendtree"
    },

    config: {
        routingEnabled: true
    },

    /**
     *
     */
    constructor: function(cfg) {
        var me = this;

        me.callParent([cfg]);

        // configure routing
        if(me.getRoutingEnabled() === true) {
            var controller = me.getController();
            me.getStore().on('update', controller.setRouting, controller);
            me.getStore().on('datachange', controller.setRouting, controller);
        }
    },

    /**
     * Initialize the component.
     */
    initComponent: function() {
        var me = this;

        // call parent
        me.callParent();

        // See the comment above the constructor why we need this.
        if (me.initiallyCollapsed){
            me.on('afterlayout', function(){
                this.collapse();
            }, me, {single: true, delay: 100});
            me.initiallyCollapsed = null;
        }

        // configure rowexpanderwithcomponents-plugin
        me.plugins[0].hideExpandColumn = false;
    },

    rowBodyCompTemplate: {
        xtype: 'container',
        items: [ {
            xtype: 'container',
            layout: 'hbox',
            defaults: {
                margin: '0 5px 0 0'
            },
            listeners: {
                beforerender: function(comp, eOpts){
                    if(!(comp.layerRec.getOlLayer().get('treeMenu'))){
                        return false;
                    }
                }
            },
            items: [{
                xtype: 'button',
                glyph:'xf05a@FontAwesome',
                tooltip: 'Layerinformationen anzeigen',
                handler: function(btn){
                    var layer = btn.layerRec.getOlLayer();
                    Ext.toast('<b>' + layer.get('name') + '</b>', 'Layerinfo');
                }
            },{
                xtype: 'button',
                glyph:'xf0c7@FontAwesome',
                tooltip: 'Daten speichern',
                listeners: {
                    afterrender: function(comp, eOpts){
                        var layer = comp.layerRec.getOlLayer();
                        // beforerender evnet destroys layout of other buttons
                        if(!(layer.get('allowDownload'))){
                            comp.hide();
                        }
                        if(!(layer.get('downloadUrl'))){
                            comp.disable();
                        }
                    }
                },
                handler: function(btn){
                    var layer = btn.layerRec.getOlLayer();
                    
                    Ext.Msg.show({
                        title: 'Info',
                        message: 'Daten zu <b>' + layer.get('name') +
                            '</b> runterladen?',
                        buttonText: {
                            yes: "Ja",
                            no: "Nein"
                        },
                        fn: function(btnId){
                            if(btnId === "yes"){
                                window.open(layer.get('downloadUrl'),'_blank');
                            }
                        }
                    });
                }
            },{
                xtype: 'button',
                glyph:'xf00d@FontAwesome',
                tooltip: 'Layer entfernen',
                handler: function(btn){
                    var layer = btn.layerRec.getOlLayer();
                    var map = Ext.ComponentQuery.query('k-component-map')[0]
                        .getMap();

                    Ext.Msg.show({
                        title: 'Info',
                        message: 'Layer <b>' + layer.get('name') +
                            '</b> aus Karte entfernen?',
                        buttonText: {
                            yes: "Ja",
                            no: "Nein"
                        },
                        fn: function(btnId){
                            if(btnId === "yes"){
                                map.removeLayer(layer);
                            }
                        }
                    });
                }
            }, {
                xtype: 'slider',
                width: 100,
                value: 100,
                tipText: function(thumb){
                    return String(thumb.value) + '% Sichtbarkeit' ;
                },
                listeners: {
                    afterrender: function(slider){
                        var layer = slider.layerRec.getOlLayer();
                        slider.setValue(layer.getOpacity()*100);
                    },
                    change: function(slider, newValue, thumb, eOpts ){
                        var layer = slider.layerRec.getOlLayer();
                        layer.setOpacity(newValue/100);
                    }
                }
            }]
        },{
            xtype: 'image',
            margin: '5px 0 0 0',
            src: '{{record.getOlLayer().get("legendUrl")}}',
            height: '{{record.getOlLayer().get("legendHeight")}}',
            alt: '{{record.getOlLayer().get("legendUrl")}}'
        }]
    },

    listeners: {
        selectionchange: 'onSelectionChange'
    }
});
