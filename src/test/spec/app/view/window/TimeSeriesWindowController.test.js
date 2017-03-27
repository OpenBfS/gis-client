Ext.Loader.syncRequire([
    'Koala.view.window.TimeSeriesWindowController'
]);

describe('Koala.view.window.TimeSeriesWindowController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.TimeSeriesWindowController).to.not.be(undefined);
        });
    });
});
