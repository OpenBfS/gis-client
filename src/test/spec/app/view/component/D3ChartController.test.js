Ext.Loader.syncRequire([
    'Koala.view.component.D3ChartController',
    'Koala.view.component.D3Chart',
    'Koala.util.ChartAxes'
]);

describe('Koala.view.component.D3ChartController', function() {
    describe('Basics', function() {
        var ctrl;

        beforeEach(function() {
            // mock layer
            var layer = TestUtil.getMockedGetter({});

            var view = Ext.create(Koala.view.component.D3Chart.create(layer));
            ctrl = new Koala.view.component.D3ChartController();
            ctrl.setView(view);

            // mock minimum reqs for drawing a chart
            view.el = TestUtil.getMockedElement();
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
            ctrl.deleteShapeContainerSvg();
            expect(true).to.be(true);
        });

        it('can delete everything', function() {
            expect(ctrl.deleteEverything.bind(ctrl)).withArgs({config: {id: 1}}).to.not.throwException();
        });

        it('does not draw chart without data', function() {
            ctrl.onBoxReady();
            ctrl.fireEvent('chartdataprepared');
            sinon.spy(ctrl, 'drawChart');
            expect(ctrl.drawChart.calledOnce).to.not.be(true);
        });
    });
});
