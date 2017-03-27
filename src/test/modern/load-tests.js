/*global document*/
// This file is taken from GeoExt3
(function(doc, global) {
    var specPath = '../spec/',
        dependencies = [
            './app/basics.test.js',
            './app/util/Authentication.test.js',
            './app/util/Date.test.js',
            './app/util/Layer.test.js',
            './app/util/Object.test.js',
            './app/util/Routing.test.js',
            './app/util/String.test.js',
            './app/util/Style.test.js',
            './app/util.AppContext.test.js',
            './app/util/Fullscreen.test.js',
            './app/view/button/TimeReferenceController.test.js',
            './app/view/component/D3BarChartController.test.js',
            './app/view/component/D3BaseController.test.js',
            './app/view/component/MapController.test.js',
            './app/view/container/styler/FilterController.test.js',
            './app/view/container/styler/LabelController.test.js',
            './app/view/container/styler/RuleController.test.js',
            './app/view/container/styler/ScaleDenominatorController.test.js',
            './app/view/container/styler/StylerController.test.js',
            './app/view/container/styler/SymbolizerController.test.js',
            './app/view/form/field/LanguageComboController.test.js',
            './app/view/form/field/SearchComboController.test.js',
            './app/view/form/ImportLocalDataController.test.js',
            './app/view/form/LayerFilterController.test.js',
            './app/view/grid/MetadataSearchController.test.js',
            './app/view/grid/SpatialSearchController.test.js',
            './app/view/main/MainController.test.js',
            './app/view/panel/LayerSetChooserController.test.js',
            './app/view/panel/MultiSearchController.test.js',
            './app/view/panel/RoutingLegendTreeController.test.js',
            './app/view/panel/ThemeTreeController.test.js',
            './app/view/toolbar/HeaderController.test.js',
            './app/view/window/BarChartController.test.js',
            './app/view/window/HelpController.test.js',
            './app/view/window/MetadataInfoController.test.js',
            './app/view/window/PrintController.test.js',
            './modern/panel/Settings.test.js',
            './modern/panel/MobileLegendController.test.js',
            './modern/util/Filter.test.js'
        ],
        getScriptTag = global.TestUtil.getExternalScriptTag,
        dependencyCnt = dependencies.length,
        i = 0;

    for (; i < dependencyCnt; i++) {
        doc.write(getScriptTag(specPath + dependencies[i]));
    }
}(document, this));
