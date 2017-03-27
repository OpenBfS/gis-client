Ext.Loader.syncRequire([
    'Koala.view.form.LayerFilterController'
]);

describe('Koala.view.form.LayerFilterController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.form.LayerFilterController).to.not.be(undefined);
        });
    });
});
