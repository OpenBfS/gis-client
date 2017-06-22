Ext.Loader.syncRequire([
    'Koala.view.component.D3ChartController',
    'Koala.view.component.D3Chart'
]);

describe('Koala.view.component.D3ChartController', function() {
    describe('Basics', function() {
        var ctrl;

        beforeEach(function() {
            // mock layer
            var layer = {};
            layer.get = sinon.stub();
            layer.get.returns({});

            var view = Ext.create(Koala.view.component.D3Chart.create(layer));
            ctrl = new Koala.view.component.D3ChartController();
            ctrl.setView(view);

            // mock minimum reqs for drawing a chart
            view.el = {};
            view.el.getSize = sinon.stub().returns({width: 100, height: 100});
            view.getAxes = sinon.stub().returns({top: {min: 1, max: 2}, left: {min: 1, max: 2}});
        });

        it('is defined', function() {
            expect(Koala.view.component.D3ChartController).to.not.be(undefined);
        });

        it('should construct properly', function() {
            expect(ctrl).to.not.be(undefined);
        });

        it('should have a view', function() {
            var cmp = ctrl.getView();
            expect(cmp).to.not.be(undefined);
            expect(cmp.getId()).to.not.be(undefined);
        });

        it('should not fail to draw and redraw a chart', function() {
            ctrl.drawChart();
            expect(true).to.be(true);
            ctrl.redrawChart();
            expect(true).to.be(true);
            ctrl.resetZoom();
            expect(true).to.be(true);
            ctrl.deleteShapeContainerSvg();
            expect(true).to.be(true);
        });
    });
});
