Ext.Loader.syncRequire([
    'Koala.view.container.styler.ScaleDenominatorController'
]);

describe('Koala.view.container.styler.ScaleDenominatorController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.styler.ScaleDenominatorController).to.not.be(undefined);
        });
    });
});
