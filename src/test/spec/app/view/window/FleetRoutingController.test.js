Ext.Loader.syncRequire([
    'Koala.view.window.FleetRoutingController'
]);

describe('Koala.view.window.FleetRoutingController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.FleetRoutingController).to.not.be(undefined);
        });
    });
});
