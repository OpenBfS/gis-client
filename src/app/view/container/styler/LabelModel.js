Ext.define('Koala.view.container.styler.LabelModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.container.styler.label',

    data: {
        labelFieldSetTitle: '',
        textFieldLabel: '',
        fontFamilyFieldLabel: '',
        fontStyleFieldLabel: '',
        fontSizeFieldLabel: '',
        fontColorFieldLabel: '',
        fontStrokeColorFieldLabel: '',
        rotationFieldLabel: '',
        offsetXFieldLabel: '',
        offsetYFieldLabel: '',
        fillValue: '#000000ff',
        fontFamilyValue: 'sans-serif',
        fontStyleValue: 'normal, normal',
        fontSizeValue: '10',
        offsetXValue: 0,
        offsetYValue: 0,
        rotationValue: 0,
        strokeValue: '#ffffffff',
        textValue: 'Beispieltext'
    }

});
