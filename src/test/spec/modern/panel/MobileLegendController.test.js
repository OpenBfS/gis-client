Ext.Loader.syncRequire([
    'BasiGX.view.component.Map',
    'Koala.view.panel.MobileLegend'
]);

describe('Koala.view.panel.MobileLegendController', function() {
    var mapComponent;
    var view;
    var controller;
    beforeEach(function() {
        mapComponent = Ext.create('BasiGX.view.component.Map', {
            appContextPath: '/base/resources/appContext.json'
        });
        view = Ext.create('Koala.view.panel.MobileLegend');
        controller = view.getController();
    });
    afterEach(function() {
        mapComponent.destroy();
        view.destroy();
        controller = null;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.panel.MobileLegendController).to.not.be(undefined);
        });
    });

    describe('isLayerAllowedToSetVisible', function() {
        it('is a function', function() {
            expect(controller.isLayerAllowedToSetVisible).to.be.a('function');
        });

        it('returns true if maxVisibleLayers isn`t set on the view', function() {
            var firstLayer = mapComponent.getLayers().item(0);
            var allowed = controller.isLayerAllowedToSetVisible(firstLayer);
            expect(allowed).to.be(true);
        });

        it('returns true if the layer is allready visible', function() {
            var firstLayer = mapComponent.getLayers().item(0);
            var allowed = controller.isLayerAllowedToSetVisible(firstLayer);
            expect(allowed).to.be(true);
        });

        it('returns false if maxVisibleLayers', function() {
            var allowed;
            view.destroy();
            view = Ext.create('Koala.view.panel.MobileLegend', {
                maxVisibleLayers: 1
            });
            controller = view.getController();

            var mapLayers = mapComponent.getLayers();
            mapLayers.forEach(function(lyr) {
                lyr.setVisible(false);
            });

            var firstLayer = mapComponent.getLayers().item(0);
            var secondLayer = mapComponent.getLayers().item(1);

            allowed = controller.isLayerAllowedToSetVisible(firstLayer);
            if (allowed) {
                firstLayer.setVisible(true);
            }
            expect(allowed).to.be(true);

            allowed = controller.isLayerAllowedToSetVisible(secondLayer);
            expect(allowed).to.be(false);
        });
    });

    describe('removeLayer', function() {
        it('is a function', function() {
            expect(controller.removeLayer).to.be.a('function');
        });
        it('asks for confirmation', function() {
            var firstLayer = mapComponent.getLayers().item(0);
            // setup
            var spy = sinon.spy(Ext.Msg, 'show');

            controller.removeLayer(firstLayer);
            expect(spy.called).to.be(true);
            expect(spy.calledOnce).to.be.ok();
            expect(spy.callCount).to.be(1);

            // teardown
            Ext.Msg.show.restore();
         });
    });

    describe('changeLayerOrder', function() {
        it('is a function', function() {
            expect(controller.changeLayerOrder).to.be.a('function');
        });

        it('can move layers up', function() {
            var firstLayer = mapComponent.getLayers().item(0);
            controller.changeLayerOrder(firstLayer, 1);
            expect(mapComponent.getLayers().item(1)).to.be(firstLayer);
        });

        it('can move layers down', function() {
            var thirdLayer = mapComponent.getLayers().item(2);
            controller.changeLayerOrder(thirdLayer, -1);
            expect(mapComponent.getLayers().item(1)).to.be(thirdLayer);
        });
    });

    describe('onSliderChange', function() {
        it('is a function', function() {
            expect(controller.onSliderChange).to.be.a('function');
        });
        // The slider is created in the XTemplate which is only called on render
        // So we currently can`t add more tests here
    });

    describe('onPainted', function() {
        it('sets initial check status', function() {
            sinon.spy(controller, 'setInitialCheckStatus');
            controller.onPainted();
            expect(controller.setInitialCheckStatus.calledOnce).to.be(true);
            controller.setInitialCheckStatus.restore();
        });
    });

    describe('toggleActiveChartingLayer', function() {
        it('does nothing when not getting a layer', function() {
            controller.toggleActiveChartingLayer();
            expect(controller.activeChartingLayer).to.be(null);
        });

        it('can toggle the active charting layer', function() {
            var layer = mapComponent.getLayers().item(0);
            controller.toggleActiveChartingLayer(layer);
            expect(controller.activeChartingLayer).to.be(layer);
        });

        it('double toggle untoggles active charting layer', function() {
            var layer = mapComponent.getLayers().item(0);
            controller.toggleActiveChartingLayer(layer);
            controller.toggleActiveChartingLayer(layer);
            expect(controller.activeChartingLayer).to.be(null);
        });
    });

    describe('onLegendFilterTextClick', function() {
        it('opens filter panel on text click', function() {
            var layer = mapComponent.getLayers().item(0);
            var mockPanel = {};
            var mockForms = {};
            var mockFilter = {};
            mockFilter.destroy = sinon.stub();
            mockForms.query = sinon.stub().returns([mockFilter]);
            mockForms.setTitle = sinon.stub();
            mockForms.add = sinon.stub();
            mockForms.show = sinon.stub();
            mockPanel.down = sinon.stub().returns(mockForms);
            sinon.stub(view, 'up').returns(mockPanel);
            controller.onLegendFilterTextClick(layer);
            expect(mockFilter.destroy.calledOnce).to.be(true);
            expect(mockForms.show.calledOnce).to.be(true);
        });
    });

});
