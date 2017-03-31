Ext.Loader.syncRequire([
    'Koala.view.component.D3BaseController'
]);

describe('Koala.view.component.D3BaseController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.component.D3BaseController).to.not.be(undefined);
        });
    });
});
