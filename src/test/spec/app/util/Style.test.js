Ext.Loader.syncRequire(['Koala.util.Style']);

describe('Koala.util.Style', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Style).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {
        describe('#isLogicalFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Style.isLogicalFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.isLogicalFilter).to.be.a(Function);
            });
            it('returns true if "logicOps" is in filter', function() {
                var filter = {
                    logicOps: {
                        peter: 'paul'
                    }
                };
                expect(Koala.util.Style.isLogicalFilter(filter)).to.be.ok();
            });
            it('returns false if "logicOps" is not in filter', function() {
                var filter = {
                    peter: 'paul'
                };
                expect(Koala.util.Style.isLogicalFilter(filter)).to.not.be.ok();
            });
        });

        describe('#isSpatialFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Style.isSpatialFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.isSpatialFilter).to.be.a(Function);
            });
            it('returns true if "spatialOps" is in filter', function() {
                var filter = {
                    spatialOps: {
                        peter: 'paul'
                    }
                };
                expect(Koala.util.Style.isSpatialFilter(filter)).to.be.ok();
            });
            it('returns false if "isSpatialFilter" is not in filter', function() {
                var filter = {
                    peter: 'paul'
                };
                expect(Koala.util.Style.isSpatialFilter(filter)).to.not.be.ok();
            });
        });

        describe('#isComparisonFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Style.isComparisonFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.isComparisonFilter).to.be.a(Function);
            });
            it('returns true if "comparisonOps" is in filter', function() {
                var filter = {
                    comparisonOps: {
                        peter: 'paul'
                    }
                };
                expect(Koala.util.Style.isComparisonFilter(filter)).to.be.ok();
            });
            it('returns false if "comparisonOps" is not in filter', function() {
                var filter = {
                    peter: 'paul'
                };
                expect(Koala.util.Style.isComparisonFilter(filter)).to.not.be.ok();
            });
        });

        describe('#symbolTypeFromVectorLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Style.symbolTypeFromVectorLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.symbolTypeFromVectorLayer).to.be.a(Function);
            });
            it('returns a symboltype string from a vectorlayer', function() {
                var pointFeature = new ol.Feature({
                    geometry: new ol.geom.Point([1, 1])
                });
                var multiLineFeature = new ol.Feature({
                    geometry: new ol.geom.MultiLineString(
                        [[1, 1], [2, 2]],
                        [[3, 3], [4, 4]]
                    )
                });
                var source = new ol.source.Vector({
                    features: [pointFeature]
                });
                var vectorLayer = new ol.layer.Vector({
                    source: source
                });
                var symboltype = Koala.util.Style.symbolTypeFromVectorLayer(vectorLayer);
                expect(symboltype).to.be('Point');
                source.clear();
                source.addFeature(multiLineFeature);
                symboltype = Koala.util.Style.symbolTypeFromVectorLayer(vectorLayer);
                expect(symboltype).to.be('Line');
            });
        });

        describe('#getAttributekeysFromVectorLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Style.getAttributekeysFromVectorLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.getAttributekeysFromVectorLayer).to.be.a(Function);
            });
            it('returns the attribute keys from a vectorlayer', function() {
                var pointFeature = new ol.Feature({
                    geometry: new ol.geom.Point([1, 1]),
                    peter: 'paul',
                    ingrid: 'dieter'
                });
                var source = new ol.source.Vector({
                    features: [pointFeature]
                });
                var vectorLayer = new ol.layer.Vector({
                    source: source
                });
                var attributeKeys = Koala.util.Style.getAttributekeysFromVectorLayer(vectorLayer);
                expect(attributeKeys).to.eql(['geometry', 'peter', 'ingrid']);
            });
        });

        describe('#applyKoalaStyleToLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Style.applyKoalaStyleToLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.applyKoalaStyleToLayer).to.be.a(Function);
            });
        });

        describe('#getTextStylePlaceholder', function() {
            it('is defined', function() {
                expect(Koala.util.Style.getTextStylePlaceholder).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.getTextStylePlaceholder).to.be.a(Function);
            });
        });

        describe('#resolveTextStylePlaceholder', function() {
            it('is defined', function() {
                expect(Koala.util.Style.resolveTextStylePlaceholder).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.resolveTextStylePlaceholder).to.be.a(Function);
            });
        });

        describe('#evaluateScaleDenom', function() {
            it('is defined', function() {
                expect(Koala.util.Style.evaluateScaleDenom).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.evaluateScaleDenom).to.be.a(Function);
            });
        });

        describe('#evaluateFilter', function() {
            it('is defined', function() {
                expect(Koala.util.Style.evaluateFilter).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Style.evaluateFilter).to.be.a(Function);
            });
        });
    });
});
