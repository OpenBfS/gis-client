Ext.Loader.syncRequire([
    'Koala.view.grid.RoutingTimeWindow'
]);

describe('Koala.view.grid.RoutingTimeWindow', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.grid.RoutingTimeWindow).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.grid.RoutingTimeWindow');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });

    });

});
