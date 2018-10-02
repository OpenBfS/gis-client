Ext.Loader.syncRequire([
    'Koala.view.component.MapController',
    'Koala.view.component.MapModel',
    'Koala.view.component.CartoWindow',
    'Koala.view.component.CartoWindowController',
    'BasiGX.view.component.Map',
    'BasiGX.util.Animate'
]);

describe('Koala.view.component.MapController', function() {

    describe('Basics', function() {
        beforeEach(function() {
            sinon.stub(Ext.ComponentQuery, 'query');
            sinon.stub(BasiGX.util.Animate, 'shake');
        });

        afterEach(function() {
            Ext.ComponentQuery.query.restore();
            BasiGX.util.Animate.shake.restore();
        });

        it('is defined', function() {
            expect(Koala.view.component.MapController).to.not.be(undefined);
        });

        it('can be created', function() {
            var controller = new Koala.view.component.MapController();
            expect(controller).to.not.be(undefined);
        });

        it('can be called', function() {
            var controller = new Koala.view.component.MapController();
            var viewModel = new Koala.view.component.MapModel();
            var view = {};
            view.getMap = sinon.stub();
            controller.getViewModel = function() {
                return viewModel;
            };

            controller.setView(view);
            expect(controller.onHoverFeatureClick.bind(controller))
                .withArgs([]).to.not.throwException();
        });

        it('can be called with feature', function() {
            var controller = new Koala.view.component.MapController();
            var viewModel = new Koala.view.component.MapModel();
            controller.getViewModel = function() {
                return viewModel;
            };
            var view = {};
            view.getMap = sinon.stub().returns({});
            var feat = TestUtil.getMockedGetter({});
            var layer = TestUtil.getMockedGetter({});
            layer.getProperties.returns({showCartoWindow: true});
            layer.get.withArgs('name').returns('test');
            feat.get.withArgs('layer').returns(layer);
            feat.get.withArgs('id').returns('7');
            Ext.ComponentQuery.query
                .returns([{}]);

            controller.setView(view);
            controller.onHoverFeatureClick([feat]);
        });
    });

});
