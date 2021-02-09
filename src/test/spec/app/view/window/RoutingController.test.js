Ext.Loader.syncRequire([
    'Koala.view.window.RoutingController'
]);

describe('Koala.view.window.RoutingController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.RoutingController).to.not.be(undefined);
        });
    });
});
