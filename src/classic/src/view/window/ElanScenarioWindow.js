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
    //alias: 'window.k-window-elanscenarios',

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

    changes: [],

    closeAction: 'method-hide',

    /**
     * Object containing event html strings
     */
    eventStrings: {},
    /**
     * Html templates to be used for various entries.
     * The String $VALUE will be replaced by scenario content
     */
    displayTemplate: {
        //Used for title string
        title: "Ereignis:<p style='font-size: 2em; margin: 5px 0 10px 0;'> $VALUE</p>",
        //Use for string that marks the event as changed or unchanged
        change: {
            changed: "<div style='color:red; margin: 0;'>$VALUE<br></div>",
            unchanged: '$VALUE<br>'
        },
        //Used for event keys
        key: '<b>$VALUE</b>: ',
        //Used for event values
        value: '$VALUE <br>'
    },

    /**
     * Keys to be displayed in the event window
     */
    displayValues: ['modified', 'modified_by',
            'Exercise', 'id', 'description', 'TimeOfEvent',
            'ScenarioPhase.title', 'ScenarioPhase.Location'],

    /**
     * Key that contains the event title
     */
    titleProperty: 'title',

    height: 550,

    layout: 'fit',

    title: 'Dokpool-Messenger',

    width: 450,

    bind: {
        title: '{title}'
    },

    initComponent: function() {
        //var i18n = Lada.getApplication().bundle;
        var me = this;
        //this.title = i18n.getMsg('title.elanscenarios');
        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            margin: '5 5 5 5',
            html: 'No events',
            scrollable: true
        }];
        this.bbar = ['->', {
            xtype: 'button',
            bind: {
                text: '{close}'
            },
            //text: i18n.getMsg('close'),
            handler: function(button) {
                me.close();
            }
        }];
        this.callParent(arguments);
    },

    /**
     * Saves event that have been changed
     * @param {String} eventId Event ID that has changed
     */
    eventChanged: function(eventId) {
        this.changes.push(eventId);
    },

    /**
     * Check if this window has pending changes that has not been shown
     * @return true If changes are pending.
     */
    hasChanges: function() {
        return this.changes.length > 0;
    },

    /**
     * Parse elan object and create a String representation
     * @param {Object} scenario Scenario object
     * @return String represenation
     */
    parseElanObject: function(scenario) {
        var me = this;
        //var i18n = Lada.getApplication().bundle;
        var scenarioString = '';

        //Add title
        var title = scenario[me.titleProperty];
        scenarioString += me.displayTemplate.title.replace('$VALUE', title);

        //Check if Scenario was changed
        //var changeString = i18n.getMsg('elan.unchanged');
        var changeString = me.getViewModel().get('unchangedText');
        var changeTemplate = me.displayTemplate.change.unchanged;
        if (Ext.Array.contains(me.changes, scenario.id)) {
            //changeString = i18n.getMsg('elan.changed');
            changeString = me.getViewModel().get('changedText');
            changeTemplate = me.displayTemplate.change.changed;
        }
        scenarioString += changeTemplate.replace('$VALUE', changeString);

        //Add display values
        Ext.Array.each(this.displayValues, function(key) {
            var value = scenario[key];
            value = value != null ? value: '';
            //var keyString = i18n.getMsg('elan.' + key);
            var keyString = me.getViewModel().get('elan' + key);
            if (typeof value === 'boolean') {
                //value = value? i18n.getMsg('true'): i18n.getMsg('false');
                value = value? me.getViewModel().get('true'): me.getViewModel().get('false');
            }
            scenarioString += me.displayTemplate.key.replace('$VALUE', keyString);
            scenarioString += me.displayTemplate.value.replace('$VALUE', value);
        });
        return scenarioString;
    },

    /**
     * Update window content and call show
     */
    show: function() {
        this.update();
        this.callParent(arguments);
    },

    /**
     * Updates the event list without updating its content.
     * Can be used to remove a now inactive event without reseting
     * change markers.
     */
    updateEventList: function() {
        var me = this;
        var content = '';
        var newEvents = Koala.util.LocalStorage.getDokpoolEvents();
        var newEventStrings = {};
        if (!newEvents || newEvents === '') {
            //content = i18n.getMsg('window.elanscenario.emptytext');
            content = me.getViewModel().get('emptytext');
        }
        Ext.Object.each(newEvents, function(key, value, object) {
            newEventStrings[key] = me.eventStrings[key];
        });
        me.eventStrings = newEventStrings;
        Ext.Object.each(me.eventStrings, function(key, value, object) {
            content += value + '<br />';
        });
        this.down('panel').setHtml(content);
    },

    /**
     * Update the window content using the localStorage module.
     * Note: The event content itself is not refresh using the remote server
     * @param {boolean} preserveChanges If true, changes are not cleared
     */
    update: function(preserveChanges) {
        var me = this;
        //var i18n = Lada.getApplication().bundle;
        var content = '';
        var newEvents = Koala.util.LocalStorage.getDokpoolEvents();
        if (!newEvents || newEvents === '') {
            //content = i18n.getMsg('window.elanscenario.emptytext');
            content = me.getViewModel().get('emptytext');
        }
        Ext.Object.each(newEvents, function(key, value, object) {
            var text = me.parseElanObject(value);
            me.eventStrings[key] = text;
        });
        Ext.Object.each(me.eventStrings, function(key, value, object) {
            content += value + '<br />';
        });
        this.down('panel').setHtml(content);
        if (preserveChanges != true) {
            this.changes = [];
        }
    }

});
