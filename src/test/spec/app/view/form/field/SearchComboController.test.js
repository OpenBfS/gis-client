Ext.Loader.syncRequire([
    'Koala.view.form.field.SearchComboController'
]);

describe('Koala.view.form.field.SearchComboController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.field.SearchComboController).to.not.be(undefined);
        });
    });
});
