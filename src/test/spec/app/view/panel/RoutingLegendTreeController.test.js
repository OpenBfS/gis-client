Ext.Loader.syncRequire([
    'Koala.view.panel.RoutingLegendTreeController',
    'BasiGX.plugin.Hover'
]);

describe('Koala.view.panel.RoutingLegendTreeController', function() {
    describe('Basics', function() {
        beforeEach(function() {
            sinon.stub(Ext.ComponentQuery, 'query');
            Ext.ComponentQuery.query.returns([]);
        });

        afterEach(function() {
            Ext.ComponentQuery.query.restore();
        });

        it('is defined', function() {
            expect(Koala.view.panel.RoutingLegendTreeController).to.not.be(undefined);
        });

        it('repaints layer filter indications on first expand', function() {
            var ctrl = new Koala.view.panel.RoutingLegendTreeController();
            sinon.stub(Koala.util.Layer, 'repaintLayerFilterIndication');
            ctrl.onFirstExpand();
            expect(Koala.util.Layer.repaintLayerFilterIndication.calledOnce).to.be(true);
            Koala.util.Layer.repaintLayerFilterIndication.restore();
        });

        it('repaints layer filter indications on legend item drop', function() {
            var ctrl = new Koala.view.panel.RoutingLegendTreeController();
            sinon.stub(Koala.util.Layer, 'repaintLayerFilterIndication');
            ctrl.onLegendItemDrop();
            expect(Koala.util.Layer.repaintLayerFilterIndication.calledOnce).to.be(true);
            Koala.util.Layer.repaintLayerFilterIndication.restore();
        });

        it('binds utc btn toggle handlers', function() {
            var ctrl = new Koala.view.panel.RoutingLegendTreeController();
            var mock = {};
            mock.on = sinon.stub();
            Ext.ComponentQuery.query.returns([mock]);
            ctrl.bindUtcBtnToggleHandler();
            expect(mock.on.calledOnce).to.be(true);
        });

        it('unbinds utc btn toggle handlers', function() {
            var ctrl = new Koala.view.panel.RoutingLegendTreeController();
            var mock = {};
            mock.un = sinon.stub();
            Ext.ComponentQuery.query.returns([mock]);
            ctrl.unbindUtcBtnToggleHandler();
            expect(mock.un.calledOnce).to.be(true);
        });

        it('can set routing', function() {
            var ctrl = new Koala.view.panel.RoutingLegendTreeController();
            sinon.stub(ctrl, 'redirectTo');
            var mock = {};
            var mockRec = {};
            var mockLayer = TestUtil.getMockedGetter({});
            mockLayer.get.withArgs('routeId').returns('750c82be-57f7-11e7-907b-a6006ad3dba0');
            mockLayer.getVisible = sinon.stub();
            mockRec.getOlLayer = sinon.stub().returns(mockLayer);
            mock.each = function(fn) {
                fn(mockRec);
            };
            ctrl.setRouting(mock);
            expect(ctrl.redirectTo.calledOnce).to.be(true);
        });

        function testSelectionChange(withSelection) {
            var ctrl = new Koala.view.panel.RoutingLegendTreeController();
            var view = {};
            var store = {};
            var rec = {};
            var layer = TestUtil.getMockedGetter({});
            rec.getOlLayer = sinon.stub().returns(layer);
            store.each = function(fn) {
                fn(rec);
            };
            view.getStore = sinon.stub().returns(store);
            view.scrollTo = sinon.stub();
            ctrl.setView(view);
            var records = [];
            if (withSelection) {
                records.push(rec);
            }
            ctrl.onSelectionChange(undefined, records);
            expect(rec.getOlLayer.called).to.be(true);
        }

        it('handles selection change no selection', function() {
            testSelectionChange(false);
        });

        it('handles selection change with selection', function() {
            testSelectionChange(true);
        });
    });
});
