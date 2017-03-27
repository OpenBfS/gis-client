Ext.Loader.syncRequire([
    'Koala.view.form.ImportLocalDataController'
]);

describe('Koala.view.form.ImportLocalDataController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.ImportLocalDataController).to.not.be(undefined);
        });
    });
});
