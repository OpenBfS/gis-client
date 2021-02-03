Ext.Loader.syncRequire([
    'Koala.view.grid.RoutingVehicles'
]);

describe('Koala.view.grid.RoutingVehicles', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.grid.RoutingVehicles).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.grid.RoutingVehicles');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });
    });
});
