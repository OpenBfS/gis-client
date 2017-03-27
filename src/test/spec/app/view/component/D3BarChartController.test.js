Ext.Loader.syncRequire([
    'Koala.view.component.D3BarChartController'
]);

describe('Koala.view.component.D3BarChartController', function() {

    afterEach(function() {
        delete Koala.Application;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.view.component.D3BarChartController).to.not.be(undefined);
        });
    });
});
