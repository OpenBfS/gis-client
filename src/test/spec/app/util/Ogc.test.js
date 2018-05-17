Ext.Loader.syncRequire(['Koala.util.Ogc']);

describe('Koala.util.Ogc', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Ogc).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {

        describe('#getDateTimeRangeFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Ogc.getDateTimeRangeFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Ogc.getDateTimeRangeFilter).to.be.a(Function);
            });
            it('returns a property is between filter', function() {
                var got = Koala.util.Ogc.getDateTimeRangeFilter('20180101T130000Z', '20180102T130000Z', 'thetime');
                expect(got.indexOf('PropertyIsBetween') !== -1).to.be(true);
                expect(got.indexOf('20180101T130000Z') !== -1).to.be(true);
                expect(got.indexOf('20180102T130000Z') !== -1).to.be(true);
                expect(got.indexOf('thetime') !== -1).to.be(true);
            });
        });

        describe('#getPointInTimeFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Ogc.getPointInTimeFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Ogc.getPointInTimeFilter).to.be.a(Function);
            });
            it('returns a point in time filter', function() {
                var got = Koala.util.Ogc.getPointInTimeFilter('20180101T130000Z', 'thetime');
                expect(got.indexOf('PropertyIsEqualTo') !== -1).to.be(true);
                expect(got.indexOf('20180101T130000Z') !== -1).to.be(true);
                expect(got.indexOf('thetime') !== -1).to.be(true);
            });
        });

        describe('#getWfsFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Ogc.getWfsFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Ogc.getWfsFilter).to.be.a(Function);
            });
            it('returns a chart data wfs filter', function() {
                var layer = {
                    metadata: {
                        layerConfig: {
                            olProperties: {
                                rodosLayer: true
                            }
                        }
                    },
                    get: function() {
                        return {};
                    }
                };
                var got = Koala.util.Ogc.getWfsFilter(layer, null, null, null, layer);
                expect(got.indexOf('PropertyIsBetween') !== -1).to.be(true);
            });
        });

    });
});
