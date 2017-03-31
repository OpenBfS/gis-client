Ext.Loader.syncRequire([
    'Koala.view.form.ImportLocalDataController',
    'Koala.view.form.ImportLocalData'
]);

describe('Koala.view.form.ImportLocalDataController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.ImportLocalDataController).to.not.be(undefined);
        });
    });
});
