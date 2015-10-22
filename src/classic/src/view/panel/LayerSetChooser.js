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
Ext.define("Koala.view.panel.LayerSetChooser", {
    extend: "BasiGX.view.panel.LayerSetChooser",
    xtype: 'k-panel-layersetchooser',

    requires: [
        'Koala.view.panel.LayerSetChooserController',
        'Koala.util.Layer'
    ],

    controller: 'k-panel-layersetchooser',

    minWidth: 150,
    minHeight: 170,

    viewModel: {
        data: {
            title: 'Layer-Set Auswahl'
        }
    },

    layerSetUrl: 'classic/resources/layerset.json',

    /**
     * flag used to indicate which items should be displayed through template
     */
    showLayerProfiles: false,

    listeners: {
        afterrender: 'registerMenuBehaviour',
        select: 'handleLayerSetSelect',
        itemdblclick: 'handleLayerSetDblClick',
        selectionchange: 'handleLayerSetSelectionchange'
    },

    /**
     *
     */
    initComponent: function() {
        var me = this,
            tree = Ext.ComponentQuery.query('k-panel-themetree')[0];
        me.items = [{
            xtype: 'basigx-view-layerset',
            tpl: [
                  '<tpl for=".">',
                    me.showLayerProfiles ? '<tpl if="isLayerProfile">' :
                      '<tpl if="!isLayerProfile">',
                      '<div class="thumb-wrap">',
                          '<div class="thumb">',
                                  '<tpl if="thumb.indexOf(\'http\') &gt;= 0">',
                                      '<img src="{thumb}" />',
                                  '<tpl else>',
                                      '<img src="classic/resources/img/themes/{thumb}" />',
                                  '</tpl>',
                          '</div>',
                          '<span>{text}</span>',
                      '</div>',
                      '</tpl>',
                  '</tpl>'
            ],
            layerSetUrl: me.layerSetUrl
        }];

        me.callParent(arguments);

        // add listeners
        me.down('textfield[name=filter]').addListener({
            buffer: 200,
            change: 'filterLayerSetsByText'
        });
        if (tree && !me.showLayerProfiles) {
            tree.on('select', function(treepanel, item) {
                me.currentTask = new Ext.util.DelayedTask(function(){
                    me.singleTreeClick(item);
                });
              me.currentTask.delay(200);
            });
            tree.on('itemdblclick', function(treepanel, item) {
                me.currentTask.cancel();
                if (item.isLeaf()) {
                    Koala.util.Layer.addLayerByUuid(item.get('uuid'));
                } else {
                    Ext.each(item.children, function(layer) {
                        Koala.util.Layer.addLayerByUuid(layer.uuid);
                    });
                }
            });
        }
    },
    /**
     *
     */
    singleTreeClick: function(rec) {
        if (rec.isLeaf()) {
            Koala.util.Layer.showChangeFilterSettingsWinByUuid(rec.get('uuid'));
        }
    }
});
