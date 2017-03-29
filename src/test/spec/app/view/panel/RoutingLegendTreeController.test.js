Ext.Loader.syncRequire([
    'Koala.view.panel.RoutingLegendTreeController'
]);

describe('Koala.view.panel.RoutingLegendTreeController', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.RoutingLegendTreeController).to.not.be(undefined);
        });
    });
});
