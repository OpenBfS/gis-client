/* Copyright (C) 2019 by Bundesamt fuer Strahlenschutz
 * Software engineering by Intevation GmbH
 *
 * This file is Free Software under the GNU GPL (v>=3)
 * and comes with ABSOLUTELY NO WARRANTY! Check out
 * the documentation coming with IMIS-Labordaten-Application for details.
 */

/**
 * Button which changes its style depending on its current state.
 */
Ext.define('Koala.view.button.ElanScenarioButton', {
    extend: 'Ext.button.Button',
    xtype: 'k-button-elanscenariobutton',

    viewModel: {
        type: 'k-button-elanscenariobutton'
    },

    statics: {
        /**
         * Available states
         */
        states: {
            /**
             * New events were received or current events changed
             */
            EVENTS_CHANGED: 0,
            /**
             * Current events were already ready read by the user
             */
            EVENTS_OLD: 1,
            /**
             * No Events are available
             */
            EVENTS_NONE: 2
        }
    },

    /**
     * Class used if new or updated events arrive
     */
    changedCls: 'x-lada-elan-button-new',

    /**
     * Icon used if new or updated events arrived
     */
    changedIcon: 'x-fa fa-exclamation-triangle',

    /**
     * Icon used if no new or updated events arrived
     */
    oldIcon: 'x-fa fa-check',

    /**
     * {Koala.view.button.ElanScenarioButton.states}
     * Current state
     */
    state: null,

    bind: {
        text: '{elanscenarios}'
    },

    /**
     * Init function
     */
    initComponent: function() {
        this.callParent(arguments);
        if (this.state) {
            this.setState();
        } else {
            this.setState(Koala.view.button.ElanScenarioButton.states.EVENTS_NONE);
        }
    },

    /**
     * Get the current state
     * @return The current state
     */
    getState: function() {
        return this.state;
    },

    /**
     * Set the current state and change style accordingly.
     * If in invalid state is passed, the current state is set to EVENTS_NONE.
     * @param {Koala.view.button.ElanScenarioButton.states} state The new state
     */
    setState: function(state) {
        var states = Koala.view.button.ElanScenarioButton.states;
        switch (state) {
            case states.EVENTS_CHANGED:
                window.console.log('EVENTS_CHANGED');
                this.show();
                this.setIconCls(this.changedIcon);
                this.addCls(this.changedCls);
                break;
            case states.EVENTS_OLD:
                window.console.log('EVENTS_OLD');
                this.show();
                this.removeCls(this.changedCls);
                this.setIconCls(this.oldIcon);
                break;
            case states.EVENTS_NONE:
                window.console.log('EVENTS_NONE');
                this.hide();
                break;
            default:
                window.console.log('EVENTS_NONE');
                window.console.log('Unknown event state: ' + state);
                state = states.EVENTS_NONE;
        }
        this.state = state;
    }
});
