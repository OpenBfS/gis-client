/* Copyright (c) 2015-2016 terrestris GmbH & Co. KG
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
 * @class Koala.view.panel.LayerSetChooser
 */
Ext.define("Koala.view.panel.LayerSetChooser", {
    extend: "BasiGX.view.panel.LayerSetChooser",
    xtype: 'k-panel-layersetchooser',

    requires: [
        'Koala.view.panel.LayerSetChooserController',
        'Koala.util.Layer'
    ],

    controller: 'k-panel-layersetchooser',

    cls: 'k-panel-layersetchooser',

    minWidth: 150,
    minHeight: 170,
    width: 410,
    height: 300,

    closable: true,
    closeAction: 'hide',

    viewModel: {
        data: {
            title: 'Layer-Set Auswahl'
        }
    },

    tools: [{
        type:'help',
        //TODO: move to app-locale
        tooltip: 'Hilfe',
        callback: function() {
            var helpWin = Ext.ComponentQuery.query('k-window-help')[0];
            if(!helpWin){
                helpWin = Ext.create('Koala.view.window.HelpWindow').show();
                helpWin.on('afterlayout', function() {
                    var helpWinController = this.getController();
                    helpWinController.setTopic('layerSelection');
                });
            } else {
                BasiGX.util.Animate.shake(helpWin);
                var helpWinController = helpWin.getController();
                helpWinController.setTopic('layerSelection');
            }
        }
    }],

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
        var me = this;

        // try to load layerprofile from appContext
        var appContext = BasiGX.view.component.Map.guess().appContext;
        var path = [
            'data',
            'merge',
            'urls',
            'layerset'
        ];
        var layerSetUrl;
        if (me.showLayerProfiles) {
            path[path.indexOf('layerset')] = 'layerprofile';
            layerSetUrl = Koala.util.Object.getPathOr(appContext, path, 'classic/resources/layerprofile.json');
        } else {
            layerSetUrl = Koala.util.Object.getPathOr(appContext, path, 'classic/resources/layerset.json');
        }

        var tplIfStr = me.showLayerProfiles ?
            '<tpl if="isLayerProfile">' :
            '<tpl if="!isLayerProfile">';
        var tplIfEndStr = '</tpl>';
        me.items = [{
            xtype: 'basigx-view-layerset',
            tpl: [
                '<tpl for=".">',
                tplIfStr,
                '  <div class="thumb-wrap">',
                '    <div class="thumb">',
                '<tpl if="thumb.indexOf(\'http\') &gt;= 0">',
                '      <img src="{thumb}" />',
                '<tpl else>',
                '      <img src="classic/resources/img/themes/{thumb}" />',
                '</tpl>',
                '    </div>',
                '    <span>{text}</span>',
                '  </div>',
                tplIfEndStr,
                '</tpl>'
            ],
            layerSetUrl: layerSetUrl
        }];

        me.callParent();

        // add listeners
        me.down('textfield[name=filter]').addListener({
            buffer: 200,
            change: 'filterLayerSetsByText'
        });
    }
});
