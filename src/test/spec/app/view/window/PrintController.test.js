Ext.Loader.syncRequire([
    'Koala.view.window.PrintController'
]);

describe('Koala.view.window.PrintController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.PrintController).to.not.be(undefined);
        });
    });
});
