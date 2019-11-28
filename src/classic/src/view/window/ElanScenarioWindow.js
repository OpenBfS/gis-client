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
    alias: 'window.elanscenariowindow',

    /**
     * Component id. Should not be changed, as there should only be one event window which
     * can be updated.
     */
    id: 'elanwindowid',

    changes: [],

    closeAction: 'method-hide',

    events: null,
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

    initComponent: function() {
        //var i18n = Koala.getApplication().bundle;
        var me = this;
        this.title = '{title.elanscenarios}';
        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            margin: '5 5 5 5',
            html: 'No events',
            scrollable: true
        }];
        this.bbar = ['->', {
            xtype: 'button',
            text: '{close}',
            handler: function(button) {
                me.close();
            }
        }];
        this.callParent(arguments);
        this.update();
    },

    /**
     * Saves event that have been changed
     * @param {String} eventId Event ID that has changed
     */
    eventChanged: function(eventId) {
        this.changes.push(eventId);
    },

    /**
     * Parse elan object and create a String representation
     * @param {Object} scenario Scenario object
     * @return String represenation
     */
    parseElanObject: function(scenario) {
        var me = this;
        //var i18n = Koala.getApplication().bundle;
        var scenarioString = '';

        //Add title
        var title = scenario[me.titleProperty];
        scenarioString += me.displayTemplate.title.replace('$VALUE', title);

        //Check if Scenario was changed
        var changeString = '{elan.unchanged}';
        var changeTemplate = me.displayTemplate.change.unchanged;
        if (Ext.Array.contains(me.changes, scenario.id)) {
            changeString = '{elan.changed}';
            changeTemplate = me.displayTemplate.change.changed;
        }
        scenarioString += changeTemplate.replace('$VALUE', changeString);

        //Add display values
        Ext.Array.each(this.displayValues, function(key) {
            var value = scenario[key];
            value = value != null ? value: '';
            var keyString = '{elan.}' + key;
            if (typeof value === 'boolean') {
                value = value? '{true}': '{false}';
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
     * Update the window content using the localStorage module.
     * Note: The event content itself is not refresh using the remote server
     */
    update: function() {
        var me = this;
        //var i18n = Koala.getApplication().bundle;
        var content = '';
        var newEvents = Koala.util.LocalStorage.getDokpoolEvents();
        if (!newEvents || newEvents === '') {
            content = '{window.elanscenario.emptytext}';
        }
        Ext.Object.each(newEvents, function(key, value, object) {
            var text = me.parseElanObject(value);
            content += text + '</br>';
        });
        this.down('panel').setHtml(content);
        this.changes = [];
    }

});
