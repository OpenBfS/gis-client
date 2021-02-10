Ext.Loader.syncRequire([
    'Koala.view.container.FleetRoutingResultController'
]);

describe('Koala.view.container.FleetRoutingResultController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.FleetRoutingResultController).to.not.be(undefined);
        });

        it('can be created', function() {
            var ctrl = new Koala.view.container.FleetRoutingResultController();
            expect(ctrl).to.not.be(undefined);
        });
    });
});
