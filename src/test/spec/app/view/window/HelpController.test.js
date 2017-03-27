Ext.Loader.syncRequire([
    'Koala.view.window.HelpController'
]);

describe('Koala.view.window.HelpController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.HelpController).to.not.be(undefined);
        });
    });
});
