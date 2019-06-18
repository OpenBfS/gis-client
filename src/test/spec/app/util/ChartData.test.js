Ext.Loader.syncRequire([
    'Koala.util.ChartData'
]);

describe('Koala.view.component.D3ChartController', function() {
    describe('Basics', function() {

        it('can convert intervals to seconds', function() {
            var Data = Koala.util.ChartData;
            expect(Data.getIntervalInSeconds(1, 'seconds')).to.be(1);
            expect(Data.getIntervalInSeconds(1, 'minutes')).to.be(60);
            expect(Data.getIntervalInSeconds(1, 'hours')).to.be(3600);
            expect(Data.getIntervalInSeconds(1, 'days')).to.be(86400);
            expect(Data.getIntervalInSeconds(1, '')).to.be(false);
            expect(Data.getIntervalInSeconds).to.throwException();
        });

    });
});
