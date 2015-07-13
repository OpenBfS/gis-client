Ext.define("Koala.view.form.Print",{
    extend: "Basepackage.view.form.Print",
    xtype: "k-form-print",

    requires: [
        "Koala.view.form.PrintModel"
    ],

    viewModel: {
        type: "k-form-print"
    },

    maxHeight: null,
    maxWidth: '200px',

    initComponent: function() {
        this.callParent();

        /**
         * necessary to override the BasePackages bind.
         */
        this.setBind();

        var appCombo = this.down('combo[name=appCombo]');
        appCombo.setFieldLabel('Printapp');
//        appCombo.on('select', this.addIrixFieldset, this);
    },

    addIrixFieldset: function(){
        var fs = this.down('[name="irix-fieldset"]');
        if (!fs) {
            this.add({
                xtype: 'fieldset',
                title: 'IRIX',
                name: 'irix-fieldset',
                layout: 'anchor',
                // Doesn't work in ExtJS Beta.
//                checkboxToggle: true,
//                checkboxName: 'irix-fieldset-checkbox',
                collapsible: true,
                collapsed: true,
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    xtype: 'textfield',
                    name: 'Title',
                    fieldLabel: 'Titel'
                },{
                    xtype: 'textfield',
                    name: 'User',
                    fieldLabel: 'Benutzer'
                }, {
                    xtype: 'fieldset',
                    title: 'Identification',
                    items: [{
                        xtype: 'textfield',
                        name: 'OrganisationReporting',
                        fieldLabel: 'OrganisationReporting'
                    },{
                        xtype: 'textfield',
                        name: 'ReportContext',
                        fieldLabel: 'ReportContext'
                    }, {
                        xtype: 'fieldset',
                        title: 'OrganisationContact',
                        items: [{
                            xtype: 'textfield',
                            name: 'OrganisationReporting',
                            fieldLabel: 'OrganisationReporting'
                        },{
                            xtype: 'textfield',
                            name: 'ReportContext',
                            fieldLabel: 'ReportContext'
                        }]
                    }]
                },{
                    xtype: 'fieldset',
                    title: 'DokpoolMeta',
                    items: [{
                        xtype: 'textfield',
                        name: 'Purpose',
                        fieldLabel: 'Purpose'
                    },{
                        xtype: 'textfield',
                        name: 'DokpoolContentType',
                        fieldLabel: 'DokpoolContentType'
                    },{
                        xtype: 'checkbox',
                        checked: true,
                        name: 'IsElan',
                        fieldLabel: 'IsElan',
                        boxLabel: ' '
                    },{
                        xtype: 'checkbox',
                        checked: true,
                        name: 'IsDoksys',
                        fieldLabel: 'IsDoksys',
                        boxLabel: ' '
                    },{
                        xtype: 'checkbox',
                        checked: true,
                        name: 'IsRodos',
                        fieldLabel: 'IsRodos',
                        boxLabel: ' '
                    },{
                        xtype: 'checkbox',
                        checked: true,
                        name: 'IsRei',
                        fieldLabel: 'IsRei',
                        boxLabel: ' '
                    },{
                        xtype: 'textfield',
                        name: 'NetworkOperator',
                        fieldLabel: 'NetworkOperator'
                    },{
                        xtype: 'textfield',
                        name: 'SampleTypeId',
                        fieldLabel: 'SampleTypeId'
                    },{
                        xtype: 'textfield',
                        name: 'SampleType',
                        fieldLabel: 'SampleType'
                    },{
                        xtype: 'textfield',
                        name: 'Dom',
                        fieldLabel: 'Dom'
                    },{
                        xtype: 'textfield',
                        name: 'DataType',
                        fieldLabel: 'DataType'
                    },{
                        xtype: 'textfield',
                        name: 'LegalBase',
                        fieldLabel: 'LegalBase'
                    },{
                        xtype: 'textfield',
                        name: 'MeasuringProgram',
                        fieldLabel: 'MeasuringProgram'
                    },{
                        xtype: 'textfield',
                        name: 'Status',
                        fieldLabel: 'Status'
                    },{
                        xtype: 'textfield',
                        name: 'SamplingBegin',
                        fieldLabel: 'SamplingBegin'
                    },{
                        xtype: 'textfield',
                        name: 'SamplingEnd',
                        fieldLabel: 'SamplingEnd'
                    }]
                }]
            });

            // fixes layout bug
            this.setWidth(this.getWidth());
        }

    }
});
