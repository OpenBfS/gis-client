Ext.Loader.syncRequire([
    'Koala.view.component.D3BarChartController',
    'Koala.view.component.D3BarChart',
    'Koala.view.component.D3BaseController',
    'Koala.util.ChartAxes'
]);

describe('Koala.view.component.D3BarChartController', function() {
    describe('Basics', function() {
        var ctrl;
        beforeEach(function() {
            // mock layer
            var layer = TestUtil.getMockedGetter({});
            layer.get.returns({
                chartFieldSequence: 'test'
            });
            var feat = TestUtil.getMockedGetter({});

            var view = Ext.create(Koala.view.component.D3BarChart.create(layer, feat));
            ctrl = view.getController();

            // mock minimum reqs for drawing a chart
            view.el = TestUtil.getMockedElement();
            view.getAxes = sinon.stub().returns({
                bottom: {
                    min: 1,
                    max: 2,
                    scale: 'ordinal'
                },
                left: {
                    min: 1,
                    max: 2
                }
            });
        });

        it('is defined', function() {
            expect(Koala.view.component.D3BarChartController).to.not.be(undefined);
        });

        it('should construct properly', function() {
            expect(ctrl).to.not.be(undefined);
        });

        it('should have a view', function() {
            var cmp = ctrl.getView();
            expect(cmp).to.not.be(undefined);
            expect(cmp.getId()).to.not.be(undefined);
        });
    });
});
