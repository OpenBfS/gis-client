Ext.Loader.syncRequire(['Koala.view.form.LayerFilterController']);

describe('Koala.view.form.LayerFilterController', function() {
    describe('Basics', function() {
        beforeEach(function() {
            sinon.stub(Ext.ComponentQuery, 'query');
            var mapComponent = {};
            var map = {};
            map.getLayers = sinon.stub().returns([{metadata: {}}]);
            mapComponent.getMap = sinon.stub().returns(map);
            mapComponent.addLayer = sinon.stub();
            Ext.ComponentQuery.query.returns([mapComponent]);
        });

        afterEach(function() {
            Ext.ComponentQuery.query.restore();
        });

        it('is defined', function() {
            expect(Koala.view.form.LayerFilterController).to.not.be(undefined);
        });

        it('can be created', function() {
            var ctrl = new Koala.view.form.LayerFilterController();
            expect(ctrl).to.not.be('undefined');
        });

        it('can refresh layers', function() {
            var ctrl = new Koala.view.form.LayerFilterController();
            expect(ctrl.refreshLayers.bind(ctrl)).to.not.throwException();
        });

        it('properly overwrites value filters', function() {
            var ctrl = new Koala.view.form.LayerFilterController();
            var newFilters = [{type: 'other'}, {type: 'value'}];
            var oldFilters = [{type: 'other'}, {type: 'value', other: 'newvalue'}];
            ctrl.overwriteValueFilters(oldFilters, newFilters);
            expect(newFilters[1].other).to.be('newvalue');
        });

        it('can change filters for layers', function() {
            var ctrl = new Koala.view.form.LayerFilterController();
            var view = TestUtil.getMockedElement();
            var layer = TestUtil.getMockedGetter({});
            var win = TestUtil.getMockedElement();
            view.getLayer = sinon.stub().returns(layer);
            view.up = sinon.stub().returns(win);
            layer.getSource = sinon.stub().returns({});
            layer.setSource = sinon.stub();
            sinon.stub(Koala.util.Layer, 'getOriginalMetadata');
            sinon.stub(Koala.util.Layer, 'repaintLayerFilterIndication');
            Koala.util.Layer.getOriginalMetadata.returns({});
            sinon.stub(Koala.util.Layer, 'layerFromMetadata');
            Koala.util.Layer.layerFromMetadata.returns(layer);
            view.getLayer = sinon.stub().returns(layer);
            view.getFilters = sinon.stub().returns([]);
            ctrl.setView(view);
            sinon.stub(ctrl, 'updateMetadataLegendTree');
            sinon.stub(ctrl, 'deselectThemeTreeItems');
            expect(ctrl.changeFilterForLayer.bind(ctrl)).to.not.throwException();
            Koala.util.Layer.getOriginalMetadata.restore();
            Koala.util.Layer.layerFromMetadata.restore();
            Koala.util.Layer.repaintLayerFilterIndication.restore();
            ctrl.updateMetadataLegendTree.restore();
            ctrl.deselectThemeTreeItems.restore();
        });

        it('can submit filters', function() {
            var ctrl = new Koala.view.form.LayerFilterController();
            var view = TestUtil.getMockedElement();
            var layer = TestUtil.getMockedGetter({});
            view.getMetadata = sinon.stub().returns({});
            view.getFilters = sinon.stub().returns([]);
            sinon.stub(Koala.util.Layer, 'layerFromMetadata');
            Koala.util.Layer.layerFromMetadata.returns(layer);
            ctrl.setView(view);
            sinon.stub(ctrl, 'deselectThemeTreeItems');
            expect(ctrl.submitFilter.bind(ctrl)).to.not.throwException();
            Koala.util.Layer.layerFromMetadata.restore();
            ctrl.deselectThemeTreeItems.restore();
        });

        it('can update filters for autorefresh', function() {
            sinon.stub(Koala.util.Date, 'getTimeReferenceAwareMomentDate');
            Koala.util.Date.getTimeReferenceAwareMomentDate.returns(moment());
            var ctrl = new Koala.view.form.LayerFilterController();
            var filters = [{
                type: 'pointintime',
                maxdatetimeinstant: moment('2015-01-01').toISOString()
            }, {
                type: 'timerange',
                maxdatetimeinstant: moment('2015-01-01').toISOString()
            }];
            ctrl.updateFiltersForAutorefresh(filters);
            Koala.util.Date.getTimeReferenceAwareMomentDate.restore();
            expect(filters[0].effectivedatetime.isSameOrBefore(moment));
            expect(filters[1].effectivemaxdatetime.isSameOrBefore(moment));
        });

        it('can add layers without filters', function() {
            var ctrl = new Koala.view.form.LayerFilterController();
            var view = TestUtil.getMockedElement();
            var layer = TestUtil.getMockedGetter({});
            sinon.stub(Koala.util.Layer, 'layerFromMetadata');
            sinon.stub(ctrl, 'deselectThemeTreeItems');
            Koala.util.Layer.layerFromMetadata.returns(layer);
            sinon.spy(Koala.util.Layer, 'addOlLayerToMap');
            view.getMetadata = sinon.stub();
            ctrl.setView(view);
            ctrl.submitNoFilter();
            expect(Koala.util.Layer.addOlLayerToMap.called).to.be(true);
            Koala.util.Layer.layerFromMetadata.restore();
            ctrl.deselectThemeTreeItems.restore();
        });

        it('can deselect theme tree items', function() {
            Ext.ComponentQuery.query.returns([]);
            var ctrl = new Koala.view.form.LayerFilterController();
            expect(ctrl.deselectThemeTreeItems.bind(ctrl)).to.not.throwException();
        });

        it('disables utc button', function() {
            var ctrl = new Koala.view.form.LayerFilterController();
            var btn = {};
            btn.disable = sinon.stub();
            Ext.ComponentQuery.query.returns(btn);
            ctrl.onBeforeRenderLayerFilterForm();
            expect(btn.disable.calledOnce).to.be(true);
        });

        it('enables utc button', function() {
            var ctrl = new Koala.view.form.LayerFilterController();
            var btn = {};
            btn.enable = sinon.stub();
            Ext.ComponentQuery.query.returns(btn);
            ctrl.onBeforeDestroyLayerFilterForm();
            expect(btn.enable.calledOnce).to.be(true);
        });
    });
});
