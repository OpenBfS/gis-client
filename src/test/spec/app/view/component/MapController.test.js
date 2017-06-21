Ext.Loader.syncRequire([
    'Koala.view.component.MapController',
    'Koala.view.component.CartoWindow',
    'Koala.view.component.CartoWindowController',
    'BasiGX.view.component.Map',
    'BasiGX.util.Animate'
]);

describe('Koala.view.component.MapController', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.component.MapController).to.not.be(undefined);
        });

        it('can be created', function() {
            var controller = new Koala.view.component.MapController();
            expect(controller).to.not.be(undefined);
        });

        it('can be called', function() {
            var controller = new Koala.view.component.MapController();
            var view = {};
            view.getMap = sinon.stub();
            var layer = {};
            layer.getProperties = sinon.stub().returns({});
            layer.get = sinon.stub()
                .returns({});

            controller.setView(view);
            controller.onHoverFeatureClick([]);
        });

        it('can be called with feature', function() {
            var controller = new Koala.view.component.MapController();
            var view = {};
            view.getMap = sinon.stub().returns({});
            var feat = {};
            var layer = {};
            layer.getProperties = sinon.stub().returns({showCartoWindow: true});
            layer.get = sinon.stub().returns({});
            layer.get.withArgs('name').returns('test');
            feat.get = sinon.stub().returns({});
            feat.get.withArgs('layer').returns(layer);
            feat.get.withArgs('id').returns('7');
            sinon.stub(Ext.ComponentQuery, 'query')
                // .withArgs('k-component-map')
                .returns([{}]);
            sinon.stub(BasiGX.util.Animate, 'shake');

            controller.setView(view);
            controller.onHoverFeatureClick([feat]);
            Ext.ComponentQuery.query.restore();
            BasiGX.util.Animate.shake.restore();
        });
    });

});
