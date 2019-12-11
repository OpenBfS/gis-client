/* Copyright (C) 2019 by Bundesamt fuer Strahlenschutz
 * Software engineering by Intevation GmbH
 *
 * This file is Free Software under the GNU GPL (v>=3)
 * and comes with ABSOLUTELY NO WARRANTY! Check out
 * the documentation coming with IMIS-Labordaten-Application for details.
 */

 /**
  * Controller listening to new ElanScenarios and controlling the scenario button and window
  */
Ext.define('Koala.view.controller.ElanScenarioController', {
    extend: 'Ext.app.Controller',
    alias: 'controller.k-controller-elanscenariocontroller',

    requires: [
        'Koala.util.DokpoolRequest'
        // ,
        // 'Koala.view.button.ElanScenarioButton',
        // 'Koala.view.window.ElanScenarioWindow'
    ],

    listen: {
        component: {
            'button[action=elanscenarios]': {
                click: 'showElanScenarios'
            }
        },
        global: {
            'elanEventsReceived': 'handleElanEventsReceived',
            'elanEventsUpdated': 'handleElanEventsUpdated',
            'localElanStorageUpdated': 'handleLocalElanStorageUpdated'
        }
    },

    /**
     * Array saving changes until the window is shown
     */
    changes: [],

    /**
     * Handles the reception of elan events.
     * @param {boolean} success True if request was successfull
     */
    handleElanEventsReceived: function(success) {
        window.console.log('controller: handleElanEventsReceived');
        var button = Ext.ComponentQuery.query('k-button-elanscenariobutton')[0];
        if (!success) {
            button.setState(Koala.view.button.ElanScenarioButton.states.EVENTS_NONE);
        } else {
            if (button.getState() !== Koala.view.button.ElanScenarioButton.states.EVENTS_CHANGED) {
                button.setState(Koala.view.button.ElanScenarioButton.states.EVENTS_OLD);
            }
        }
    },

    /**
     * Handles update of elan events
     * @param {[string]} elanIds Ids of changed events
     * @param {boolean} routineMode True if there is only an event
     */
    handleElanEventsUpdated: function(elanIds, routineMode) {
        window.console.log('controller: handleElanEventsUpdated');
        var me = this;
        var button = Ext.ComponentQuery.query('k-button-elanscenariobutton')[0];
        var win = Ext.getCmp('elanwindowid');
        if (routineMode) {
            button.setState(Koala.view.button.ElanScenarioButton.states.EVENTS_NONE);
        } else {
            button.setState(Koala.view.button.ElanScenarioButton.states.EVENTS_CHANGED);
            //If window is shown
            if (win) {
                //Mark event as changed
                elanIds.forEach(function(elanId) {
                    win.eventChanged(elanId);
                });
                win.updateContent();
            } else {
                // Save changes for the next window
                elanIds.forEach(function(elanId) {
                    if (!Ext.Array.contains(me.changes, elanId)) {
                        me.changes.push(elanId);
                    }
                });
            }
        }
    },

    /**
     * Handles update of the local storage
     */
    handleLocalElanStorageUpdated: function() {
        window.console.log('controller: handleLocalElanStorageUpdated');
        var win = Ext.getCmp('elanwindowid');
        if (win) {
            win.updateEventList();
        }
    },

    /**
     * Button handler that show the event window
     * @param {} button
     */
    showElanScenarios: function(button) {
        var win = Ext.getCmp('elanwindowid');
        if (!win) {
            //If window does not exist: create and update
            win = Ext.create('Koala.view.window.ElanScenarioWindow', {
                changes: this.changes
            });
            win.updateContent();
            win.show();
        } else {
            //If window is visible and has changes
            if (win.isVisible()) {
                if (win.hasChanges()) {
                    win.updateContent();
                }
            } else {
                //If windows is hidden
                win.show();
                win.updateContent();
            }
        }
        button.setState(Koala.view.button.ElanScenarioButton.states.EVENTS_OLD);
    }
});
