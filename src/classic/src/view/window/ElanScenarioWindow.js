/* Copyright (C) 2019 by Bundesamt fuer Strahlenschutz
 * Software engineering by Intevation GmbH
 *
 * This file is Free Software under the GNU GPL (v>=3)
 * and comes with ABSOLUTELY NO WARRANTY! Check out
 * the documentation coming with IMIS-Labordaten-Application for details.
 */

/**
 * Singleton window showing elan scenario information.
 */
Ext.define('Koala.view.window.ElanScenarioWindow', {
    extend: 'Ext.window.Window',
    xtype: 'k-window-elanscenarios',

    requires: [
    ],

    controller: 'k-window-elanscenarios',

    viewModel: {
        type: 'k-window-elanscenarios'
    },

    /**
     * Component id. Should not be changed, as there should only be one event window which
     * can be updated.
     */
    id: 'elanwindowid',

    closeAction: 'method-hide',

    height: 475,

    layout: 'fit',

    width: 450,

    bind: {
        title: '{windowTitle}'
    },

    listeners: {
        close: 'updateContent'
    },

    initComponent: function() {
        var me = this;
        this.bbar = ['->', {
            xtype: 'button',
            bind: {
                text: '{close}'
            },
            handler: function() {
                me.close();
            }
        }];
        this.callParent(arguments);
        this.getController().eventObjs = Koala.util.LocalStorage.getDokpoolEvents();
        var languageCombo = Ext.ComponentQuery.query('k-form-field-languagecombo')[0];
        languageCombo.on('applanguagechanged', function() {
            me.getController().updateContent();
        });
    },

    initItems: function() {
        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            margin: '5 5 5 5',
            html: 'No events',
            scrollable: true
        }];
        this.callParent(arguments);
    }

});
