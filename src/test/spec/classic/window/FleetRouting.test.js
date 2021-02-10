Ext.Loader.syncRequire([
    'Koala.view.window.FleetRouting'
]);

describe('Koala.view.window.FleetRouting', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.window.FleetRouting).to.not.be(undefined);
        });

        it('can be created', function() {
            var cmp = Ext.create('Koala.view.window.FleetRouting');
            expect(cmp).to.not.be(undefined);
            expect(cmp.getController()).to.not.be(undefined);
        });
    });

    describe('References', function() {

        it('names referenced layer correctly', function() {
            var cmp = Ext.create('Koala.view.window.FleetRouting');

            expect(cmp.waypointLayerName).to.be('routing-waypoint-layer');
            expect(cmp.routeLayerName).to.be('routing-route-layer');
            expect(cmp.routeSegmentLayerName).to.be('routing-route-segment-layer');
            expect(cmp.avoidAreaLayerName).to.be('routing-avoid-area-layer');
            expect(cmp.elevationLayerName).to.be('routing-elevation-layer');
        });

        it('names referenced components correctly', function() {
            var cmp = Ext.create('Koala.view.window.FleetRouting');

            expect(cmp.routingResultPanelName).to.be('fleetrouting-result-panel');
            expect(cmp.elevationProfilePanelName).to.be('routing-elevationprofile-panel');
        });
    });
});
