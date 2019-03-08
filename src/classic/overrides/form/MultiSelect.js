/**
 * A control that allows selection of multiple items in a list.
 */
Ext.define('Koala.overrides.form.MultiSelect', {
    override: 'Ext.ux.form.MultiSelect',

    setupItems: function() {
        var me = this;

        me.boundList = new Ext.view.BoundList(Ext.apply({
            anchor: 'none 100%',
            border: 1,
            multiSelect: true,
            store: me.store,
            displayField: me.displayField,
            disabled: me.disabled,
            tabIndex: 0,
            navigationModel: {
                type: 'default'
            },
            selectionModel: {
                mode: 'SIMPLE'
            }
        }, me.listConfig));

        me.boundList.getNavigationModel().addKeyBindings({
            pageUp: me.onKeyPageUp,
            pageDown: me.onKeyPageDown,
            scope: me
        });

        me.boundList.getSelectionModel().on('selectionchange', me.onSelectChange, me);

        // Boundlist expects a reference to its pickerField for when an item is selected (see Boundlist#onItemClick).
        me.boundList.pickerField = me;

        // Only need to wrap the BoundList in a Panel if we have a title.
        if (!me.title) {
            return me.boundList;
        }

        // Wrap to add a title
        me.boundList.border = false;

        return {
            xtype: 'panel',
            isAriaRegion: false,
            border: true,
            anchor: 'none 100%',
            layout: 'anchor',
            title: me.title,
            tbar: me.tbar,
            items: me.boundList
        };
    }
});
