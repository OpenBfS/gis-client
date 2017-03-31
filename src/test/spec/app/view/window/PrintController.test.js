Ext.Loader.syncRequire([
    'Koala.view.window.PrintController'
]);

describe('Koala.view.window.PrintController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.PrintController).to.not.be(undefined);
        });
    });
});
