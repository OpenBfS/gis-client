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

    changes: [],

    closeAction: 'method-hide',

    /**
     * Object containing event objects and display html strings
     */
    eventObjs: {},

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
        key: {
            //Field was modified
            unchanged: '<b>$VALUE</b>: ',
            //Field is unmodified
            changed: "<div style='color:red; margin: 0;'><b>$VALUE</b>: "
        },
        //Used for event values
        value: {
            unchanged: '$VALUE <br>',
            changed: "$VALUE<br></div>"
        }
    },

    /**
     * Keys to be displayed in the event window
     */
    displayValues: ['modified', 'modified_by',
            'OperationMode.title', 'id', 'description', 'TimeOfEvent',
            'ScenarioPhase.title', 'ScenarioPhase.Location'],

    /**
     * Key that contains the event title
     */
    titleProperty: 'title',

    height: 550,

    layout: 'fit',

    width: 450,

    bind: {
        title: '{windowTitle}'
    },

    initComponent: function() {
        var me = this;
        this.bbar = ['->', {
            xtype: 'button',
            bind: {
                text: '{close}'
            },
            handler: function(button) {
                me.close();
            }
        }];
        this.eventObjs = Koala.util.LocalStorage.getDokpoolEvents();
        this.callParent(arguments);
    },

    initItems: function() {
        var me = this;

        this.items = [{
            xtype: 'panel',
            layout: 'fit',
            margin: '5 5 5 5',
            html: 'No events',
            scrollable: true
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
     * Get fields of an event that changed since last update
     * @param {Object} event Event object
     * @return {Array} Array containing the names of the changed fields
     */
    getChanges: function(event) {
        var me = this;
        var changes = [];
        var id = event.id;
        me.displayValues.forEach(function(key) {
            if (me.eventObjs[id] == null
                || me.getPropertyByString(me.eventObjs[id], key) == null
                || me.getPropertyByString(me.eventObjs[id], key) !==me.getPropertyByString(event, key)) {
                changes.push(key);
            }
        });
        return changes;
    },

    /**
     * Get object property by string
     * @param {Object} o Object to get property from
     * @param {String} s String path
     * @return {} Property
     */
    getPropertyByString: function(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1');
        s = s.replace(/^\./, '');
        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
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
        var scenarioString = '';

        //Add title
        var title = scenario[me.titleProperty];
        scenarioString += me.displayTemplate.title.replace('$VALUE', title);

        //Check if Scenario was changed
        var changeString = me.viewModel.get('unchangedText');
        var changeTemplate = me.displayTemplate.change.unchanged;
        if (Ext.Array.contains(me.changes, scenario.id)) {
            window.console.log(me);
            changeString = 'changedText';
            changeTemplate = me.displayTemplate.change.changed;
        }
        scenarioString += changeTemplate.replace('$VALUE', changeString);

        //Check for changes since last update
        var changedFields = Ext.Array.contains(me.changes, scenario.id) ?
                me.getChanges(scenario): [];

        //Add display values
        Ext.Array.each(this.displayValues, function(key) {
            var value = me.getPropertyByString(scenario, key);//scenario[key];
            value = value != null ? value: '';
            //TODO: Insert proper string
            var keyString = key;
            var boolTRUE = me.viewModel.get('true');
            var boolFALSE = me.viewModel.get('false');
            if (typeof value === 'boolean') {
                value = value? boolTRUE: boolFALSE;
            }

            //Choose template
            var keyTpl;
            var valTpl;
            if (Ext.Array.contains(me.changes, scenario.id)
                && Ext.Array.contains(changedFields, key)) {
                keyTpl = me.displayTemplate.key.changed;
                valTpl = me.displayTemplate.value.changed;
            } else {
                keyTpl = me.displayTemplate.key.unchanged;
                valTpl = me.displayTemplate.value.unchanged;
            }
            scenarioString += keyTpl.replace('$VALUE', keyString);
            scenarioString += valTpl.replace('$VALUE', value);
        });
        return scenarioString;
    },

    // /**
    //  * Update window content and call show
    //  */
    // show: function() {
    //     this.updateContent();
    //     this.callParent(arguments);
    // },

    /**
     * Sort an object holding events by modified date
     * @param {Object} newEvents Event object
     * @return {Array} Array containing object ids, sorted by modified date, asc.
     */
    sortEventsByModifiedDate: function(newEvents) {
        return Ext.Array.sort(Ext.Object.getKeys(newEvents),function(a, b) {
            if (newEvents[a]['modified'] > newEvents[b]['modified']) {
                return -1;
            } else if (newEvents[a]['modified'] < newEvents[b]['modified']) {
                return 1;
            }
            return 0;
        });
    },

    /**
     * Updates the event list without updating its content.
     * Can be used to remove a now inactive event without reseting
     * change markers.
     */
    updateEventList: function() {
        var me = this;
        var content = '';
        var newEvents = me.eventObjs;

        //Check if an event has been removed
        var eventKeys = Koala.util.LocalStorage.getDokpoolEventKeys();
        Ext.Object.each(newEvents, function(key) {
            if (!Ext.Array.contains(eventKeys, key)) {
                delete newEvents[key];
            }
        });

        //Sort events by modified date
        var displayOrder = me.sortEventsByModifiedDate(newEvents);

        if (!newEvents || newEvents === '') {
            content = me.viewModel.get('emptyText');
        }
        displayOrder.forEach(function(key, index, array) {
            var value = me.eventObjs[key].displayText;
            content += value + '<br />';
        });
        this.down('panel').setHtml(content);
    },

    /**
     * Update the window content using the localStorage module.
     * Note: The event content itself is not refresh using the remote server
     * @param {boolean} preserveChanges If true, changes are not cleared
     */
    updateContent: function(preserveChanges) {
        var me = this;
        var content = '';
        var newEvents = Koala.util.LocalStorage.getDokpoolEvents();

        //Sort events by modified date
        var displayOrder = me.sortEventsByModifiedDate(newEvents);

        if (!newEvents || newEvents === '') {
            content = me.viewModel.get('emptyText');
        }
        Ext.Object.each(newEvents, function(key, value, object) {
            var text = me.parseElanObject(value);
            newEvents[key].displayText = text;
        });
        displayOrder.forEach(function(key, index, array) {
            var value = newEvents[key].displayText;
            content += value + '<br />';
        });
        this.down('panel').setHtml(content);
        me.eventObjs = newEvents;
        if (preserveChanges != true) {
            this.changes = [];
        }
    }

});
