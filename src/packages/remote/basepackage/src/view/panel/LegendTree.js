/*global Ext, ol*/
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
 * LegendTree Panel
 * 
 * Used to build a TreePanel with layer legends.
 * 
 */
Ext.define("Basepackage.view.panel.LegendTree",{
    extend: "GeoExt.tree.Panel",
    xtype: "base-panel-legendtree",

    requires: [
    ],

    viewModel: {
        data: {
        }
    },

    layout: 'fit',

    width: 250,

    height: 300,

    collapsible: true,

    collapsed: true,

    hideCollapseTool: true,

    collapseDirection: 'bottom',

    titleCollapse: true,

    titleAlign: 'center',

    rootVisible: false,

    allowDeselect: true,

    selModel:{
        mode: 'MULTI'
    },

    cls: 'base-legend-panel',

    /**
     * @private
     */
    initiallyCollapsed: null,

    /**
     * Take care of the collapsed configuration.
     *
     * For some reason, for the legend panel we cannot have the configuration
     *
     *     {
     *         collapsed: true,
     *         hideCollapseTool: true
     *     }
     * because the the showing on header click does not work. We have this one
     * time listener, that tells us what we originally wanted.
     */
    initComponent: function() {
        var me = this;

        if (me.collapsed && me.hideCollapseTool) {
            me.collapsed = false;
            me.initiallyCollapsed = true;
            Ext.log.info('Ignoring configuration "collapsed" and instead' +
                    ' setup a one-time afterlayout listener that will' +
                    ' collapse the panel (this is possibly due to a bug in' +
                    ' ExtJS 6)');
        }
        me.hideHeaders = true;

        me.lines = false;
        me.features = [{
            ftype: 'rowbody',
            setupRowData: function(rec, rowIndex, rowValues) {
                var headerCt = this.view.headerCt,
                    colspan = headerCt.getColumnCount(),
                    isChecked = rec.get('checked'),
                    layer = rec.data,
                    hasLegend = isChecked && !(layer instanceof ol.layer.Group),
                    legendUrl =
                        hasLegend && layer.get && layer.get('legendUrl'),
                    legendHtml = "",
                    legendHeight;

                legendHeight = layer.get('legendHeight');

                if (!legendUrl) {
                    legendUrl = "http://geoext.github.io/geoext2/" +
                        "website-resources/img/GeoExt-logo.png";
                }
                legendHtml = '<img class="base-legend" src="' + legendUrl + '"';

                if (legendHeight) {
                    legendHtml += ' height="' + legendHeight + '"';
                }

                legendHtml += ' />';

                // Usually you would style the my-body-class in CSS file
                Ext.apply(rowValues, {
                    rowBody: hasLegend ? legendHtml : "",
                    rowBodyCls: "my-body-class",
                    rowBodyColspan: colspan
                });
            }
        }];

        // call parent
        me.callParent();

        // See the comment above the constructor why we need this.
        if (me.initiallyCollapsed){
            me.on('afterlayout', function(){
                this.collapse();
            }, me, {single: true, delay: 100});
            me.initiallyCollapsed = null;
        }
    }
});
