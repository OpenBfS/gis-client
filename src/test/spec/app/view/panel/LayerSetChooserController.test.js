Ext.Loader.syncRequire([
    'Koala.view.panel.LayerSetChooserController'
]);

describe('Koala.view.panel.LayerSetChooserController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.LayerSetChooserController).to.not.be(undefined);
        });
    });
});
