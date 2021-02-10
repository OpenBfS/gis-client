Ext.Loader.syncRequire(['Koala.view.container.FleetRoutingResult']);

describe('Koala.view.container.FleetRoutingResult', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.container.FleetRoutingResult).to.not.be(undefined);
        });
    });

    describe('#initComponent', function() {
        it('can be initialized', function() {
            var comp = Ext.create('Koala.view.container.FleetRoutingResult');
            expect(comp).to.not.be(undefined);
        });
    });

    describe('References', function() {

        it('names referenced layer correctly', function() {
            var cmp = Ext.create('Koala.view.container.FleetRoutingResult');

            expect(cmp.waypointLayerName).to.be('routing-waypoint-layer');
            expect(cmp.routeLayerName).to.be('routing-route-layer');
            expect(cmp.routeSegmentLayerName).to.be('routing-route-segment-layer');
            expect(cmp.elevationLayerName).to.be('routing-elevation-layer');
        });

        it('names referenced components correctly', function() {
            var cmp = Ext.create('Koala.view.container.FleetRoutingResult');

            expect(cmp.elevationProfilePanelName).to.be('routing-elevationprofile-panel');
        });

        it('contains the summary grids', function() {
            var cmp = Ext.create('Koala.view.container.FleetRoutingResult');

            expect(cmp.down('[name=fleet-summary-grid]')).to.not.be(undefined);
            expect(cmp.down('[name=routing-summary-grid]')).to.not.be(undefined);
        });
    });
});
