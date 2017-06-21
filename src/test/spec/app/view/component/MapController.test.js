Ext.Loader.syncRequire([
    'Koala.view.component.MapController',
    'BasiGX.view.component.Map'
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
            var feat = {};
            var layer = {};
            layer.getProperties = sinon.stub().returns({});
            layer.get = sinon.stub().returns({});
            feat.get = sinon.stub()
                .returns({})
                .withArgs('layer')
                .returns(layer);

            controller.setView(view);
            controller.onHoverFeatureClick([feat]);
        });
    });

});
