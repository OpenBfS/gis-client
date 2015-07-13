/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('Koala.Application', {
    extend: 'Ext.app.Application',
    xtype: 'k-application',

    name: 'Koala',

    statics: {
        /**
         * Return the current timereference for the application or undefined if
         * we cannot determine the desired.
         */
        getTimereference: function() {
            var btn = Ext.ComponentQuery.query('k-button-timereference')[0];
            if (!btn) {
                Ext.log.error('Could not find a timereference button');
                return;
            }
            return btn.getCurrent();
        },
        /**
         * Return whether the current time reference is UTC.
         */
        isUtc: function(){
            var btnClass = Koala.view.button.TimeReference;
            return this.getTimereference() === btnClass.UTC;
        },
        /**
         * Return whether the current time reference is local.
         */
        isLocal: function(){
            return !this.isUtc();
        }
    },

    listen: {
        controller: {
            '#': {
                unmatchedroute: 'onUnmatchedRoute'
            }
        }
    },

    onUnmatchedRoute: function(hash) {
        console.log('Unmatched', hash);
    },

    /**
     * Sets visibility depending to URL (routes).
     */
    onLayerTree: function(treeLayers){
        var layerTreeIds = treeLayers.split(",");
        var layertreeStore = Ext.ComponentQuery.query('base-panel-legendtree')[0].
                getStore();

        layertreeStore.each(function(rec){
            var recLayerTreeId = rec.getOlLayer().get('treeId');
            var shouldBeChecked = Ext.Array.contains(layerTreeIds, recLayerTreeId);
            rec.set('checked', shouldBeChecked);
        });
    },

    routes: {
        'treeLayers/:treeLayers': 'onLayerTree'
    },

    stores: [
        // TODO: add global / shared stores here
    ],

    launch: function () {
        // TODO - Launch the application
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
