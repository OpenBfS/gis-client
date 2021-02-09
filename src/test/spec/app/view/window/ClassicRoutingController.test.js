Ext.Loader.syncRequire([
    'Koala.view.window.ClassicRoutingController'
]);

describe('Koala.view.window.ClassicRoutingController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.ClassicRoutingController).to.not.be(undefined);
        });
    });
});
