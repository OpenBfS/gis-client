
Ext.define("Koala.view.form.field.LanguageCombo",{
    extend: "Ext.form.field.ComboBox",
    xtype: "k-form-field-languagecombo",
    requires: [
        "Koala.store.Language",
        
        "Koala.view.form.field.LanguageComboController",
        "Koala.view.form.field.LanguageComboModel"
    ],

    controller: "k-form-field-languagecombo",
    viewModel: {
        type: "k-form-field-languagecombo"
    },
    
    fields: ['code', 'name'],
    queryMode: 'local',
    displayField: 'name',
    valueField: 'code',
    autoSelect: true,
    forceSelection: true,
    editable: false,
    //width: 60,
    grow: true,
    store: {
        type: 'k-language'
    },
    bind: {
        value: '{defaultLanguage}'
    }
});
