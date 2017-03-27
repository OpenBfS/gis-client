Ext.Loader.syncRequire([
    'Koala.view.container.styler.FilterController'
]);

describe('Koala.view.container.styler.FilterController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.styler.FilterController).to.not.be(undefined);
        });
    });
});
