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
Ext.define('Koala.controller.ElanScenario', {
    extend: 'Ext.app.Controller',
    alias: 'controller.elanscenario',

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
        var button = Ext.ComponentQuery.query('elanscenariobutton')[0];
        if (!success) {
            button.setState(Koala.view.widget.ElanScenarioButton.states.EVENTS_NONE);
        } else {
            if (button.getState() !== Koala.view.widget.ElanScenarioButton.states.EVENTS_CHANGED) {
                button.setState(Koala.view.widget.ElanScenarioButton.states.EVENTS_OLD);
            }
        }
    },

    /**
     * Handles update of elan events
     * @param {string} elanId Event id
     * @param {boolean} routineMode True if its a routine event
     */
    handleElanEventsUpdated: function(elanId, routineMode) {
        var button = Ext.ComponentQuery.query('elanscenariobutton')[0];
        var window = Ext.getCmp('elanwindowid');
        if (routineMode) {
            button.setState(Koala.view.widget.ElanScenarioButton.states.EVENTS_NONE);
        } else {
            button.setState(Koala.view.widget.ElanScenarioButton.states.EVENTS_CHANGED);
            //If window is shown
            if (window) {
                //Mark event as changed
                window.eventChanged(elanId);
                window.update();
            } else {
                // Save changes for the next window
                if (!this.changes[elanId]) {
                    this.changes.push(elanId);
                }
            }
        }
    },

    /**
     * Handles update of the local storage
     */
    handleLocalElanStorageUpdated: function() {
        var window = Ext.ComponentQuery.query('elanscenariowindow')[0];
        if (window) {
            window.update();
        }
    },

    /**
     * Button handler that show the event window
     * @param {} button
     */
    showElanScenarios: function(button) {
        var win = Ext.getCmp('elanwindowid');
        if (!win) {
            win = Ext.create('Koala.view.window.ElanScenarioWindow', {
                changes: this.changes
            });
            win.show();
        } else {
            win.update();
            win.isVisible() ? win.focus(): win.show();
        }
        button.setState(Koala.view.widget.ElanScenarioButton.states.EVENTS_OLD);

    }
});
