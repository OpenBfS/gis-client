Ext.define('Koala.view.container.styler.SymbolizerModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.container.styler.symbolizer',
    data: {
        name: 'SLDStyler',
        title: 'Symbol',
        symbolizer: null,
        olStyle: null,
        symbolType: null,
        windowTitle: 'Edit Symbol',
        symbolizerFieldSetHtml: 'Click symbol to edit',
    }

});
