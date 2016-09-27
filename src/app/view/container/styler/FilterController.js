Ext.define('Koala.view.container.styler.FilterController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.filter',

    onBoxReady: function() {
        var viewModel = this.getViewModel();
        var filterFromRule = viewModel.get('rule').getFilter();
        viewModel.set('filter', filterFromRule);
        this.setFilterComponents();
        this.applyListeners();
    },

    applyListeners: function(){
        var view = this.getView();
        var viewModel = this.getViewModel();
        var fields = view.query('field');

        Ext.each(fields, function(field){
            field.on('change', function(){
                var values = {};
                Ext.each(fields, function(f){
                    if(f.name !== "useFilterCheckbox"){
                        values[f.name] = f.getValue();
                    }
                });

                view.fireEvent('filterchanged', viewModel.get('filter'));
            });
        });
    },

    attributeComboBoxReady: function(combo){
        var styler = combo.up('k_container_styler_styler');
        var store = combo.getStore();

        var layer = this.getViewModel().get('layer');
        var attributeKeys = Koala.util.Style.getAttributeKeysFromVetorLayer(layer);
        Ext.Array.remove(attributeKeys, 'geometry');

        combo.setStore(attributeKeys)
    },

    setFilterComponents: function() {
        var me = this;
        var viewModel = this.getViewModel();
        var filter = viewModel.get('filter');
        var stylerUtil = Koala.util.Style;

        if(filter){
            if (stylerUtil.isComparisonFilter(filter)) {
                this.addComparisonFilter(filter);
            } else if (stylerUtil.isSpatialFilter(filter)) {
                this.addSpatialFilter(filter);
            } else if (stylerUtil.isLogicalFilter(filter)) {
                this.addLogicalFilter(filter);
            }
        }
    },

    addComparisonFilter: function(filter) {
        var me = this;
        var view = me.getView();
        var combo = view.down('combo[name="operatorCombo"]');
        var fieldset = view.down('fieldset[name="comparison-fieldset"]');

        // If we load a filter from an SLD we have to fill up the value fields
        if(filter){
            var operator = filter.comparisonOps.name.localPart;
            combo.setValue(operator);
            fieldset.expand();
        }
    },

    operatorComboChanged: function(combo, newValue){
        var view = this.getView();
        var viewModel = this.getViewModel();
        var filter = viewModel.get('filter');

        var attributeCombo = view.down(
                'combobox[name="attributeCombo"]');
        var literalNumberField1 = view.down(
                'numberfield[name="literalNumberField1"]');
        var literalNumberField2 = view.down(
                'numberfield[name="literalNumberField2"]');
        var literalTextField = view.down('textfield[name="literalTextField"]');
        var literalValues;

        switch(newValue) {
        case "PropertyIsEqualTo":
        case "PropertyIsNotEqualTo":
        case "PropertyIsLike":
        case "PropertyIsNull":
            literalNumberField1.hide();
            literalNumberField2.hide();
            literalTextField.show();
            break;
        case "PropertyIsBetween":
            literalNumberField1.show();
            literalNumberField2.show();
            literalTextField.hide();
            viewModel.set('literalNumberField2Label', 'Upper boundary');
            break;
        case "PropertyIsLessThan":
        case "PropertyIsLessThanOrEqualTo":
        case "PropertyIsGreaterThan":
        case "PropertyIsGreaterThanOrEqualTo":
            literalNumberField2.show();
            literalNumberField1.hide();
            literalTextField.hide();
            viewModel.set('literalNumberField2Label', 'Value');
            break;
        default:
            break;
        }

        if(filter){
            attributeCombo.setValue(filter.get('attribute'));
        }
    },

    addSpatialFilter: function(filter) {
        return filter;
    },

    addLogicalFilter: function(filter) {
        return filter;
    }

});
