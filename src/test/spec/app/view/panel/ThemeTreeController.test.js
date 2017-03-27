Ext.Loader.syncRequire([
    'Koala.view.panel.ThemeTreeController'
]);

describe('Koala.view.panel.ThemeTreeController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.ThemeTreeController).to.not.be(undefined);
        });
    });
});
