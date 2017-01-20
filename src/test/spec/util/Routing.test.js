Ext.Loader.syncRequire(['Koala.util.Routing']);

describe('Koala.util.Routing', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Routing).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {
        describe('onUnmatchedRoute', function() {
            // Should be enough as just it's existence is required.
            it('is a function', function() {
                expect(Koala.util.Routing.onUnmatchedRoute).to.be.a('function');
            });
        });

        describe('onMapRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.onMapRoute).to.be.a('function');
            });
            // TODO Can't add anymore tests here as it would require the creation
            // of the Koala.Application which is currently not possible in tests
        });

        describe('beforeLayerTreeRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.beforeLayerTreeRoute).to.be.a('function');
            });
            // TODO Can't add anymore tests here as it would require the creation
            // of the Koala.Application which is currently not possible in tests
        });

        describe('onLayerTreeRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.onLayerTreeRoute).to.be.a('function');
            });
            // TODO Can't add anymore tests here as it would require the creation
            // of the Koala.Application which is currently not possible in tests
        });

        describe('parseFiltersFromPermalink', function() {
            var parseFilter = Koala.util.Routing.parseFiltersFromPermalink;
            it('is a function', function() {
                expect(parseFilter).to.be.a('function');
            });

            var uuid = 'f917f393-fb9b-4345-99cf-8d2fcfab8d3d';
            var filtersString;
            var filters;

            beforeEach(function(){
                filters = Koala.util.Routing.permalinkFilters;
            });
            afterEach(function(){
                Koala.util.Routing.permalinkFilters = {};
            });

            it('can parse pointintime-filter', function() {
                filtersString = 'pt{t1484748614084}';
                parseFilter(uuid, filtersString);
                expect(filters[uuid]).to.be.an('object');
                expect(filters[uuid].pointintime).to.be.an('object');
                expect(filters[uuid].pointintime.effectivedatetime instanceof Date).to.be(true);
                expect(filters[uuid].pointintime.effectivedatetime.getTime()).to.eql(1484748614084);
            });

            it('can parse timerange-filter', function() {
                filtersString = 'tr{s1433116800000e1435622400000}';
                parseFilter(uuid, filtersString);
                expect(filters[uuid]).to.be.an('object');
                expect(filters[uuid].timerange).to.be.an('object');
                expect(filters[uuid].timerange.effectivemindatetime instanceof Date).to.be(true);
                expect(filters[uuid].timerange.effectivemindatetime.getTime()).to.eql(1433116800000);
                expect(filters[uuid].timerange.effectivemaxdatetime instanceof Date).to.be(true);
                expect(filters[uuid].timerange.effectivemaxdatetime.getTime()).to.eql(1435622400000);
            });

            it('can parse attribute-filter', function() {
                filtersString = 'at{Messnetz=\'triangle\'}';
                parseFilter(uuid, filtersString);
                expect(filters[uuid]).to.be.an('object');
                expect(filters[uuid].value).to.be.an('object');
                expect(filters[uuid].value.alias).to.be('Messnetz');
                expect(filters[uuid].value.effectivevalue).to.be('\'triangle\'');
            });

            it('can parse style-filter', function() {
                filtersString = 'st{point}';
                parseFilter(uuid, filtersString);
                expect(filters[uuid]).to.be.an('object');
                expect(filters[uuid].Stil).to.be.an('object');
                expect(filters[uuid].Stil.alias).to.be('Stil');
                expect(filters[uuid].Stil.effectivevalue).to.be('point');
            });

            it('can parse complex-filter', function() {
                filtersString = 'pt{t1447574400000};st{point};at{Messnetz=\'triangle\'};tr{s1433116800000e1435622400000}';
                parseFilter(uuid, filtersString);
                expect(filters[uuid]).to.be.an('object');
                expect(filters[uuid].pointintime).to.be.an('object');
                expect(filters[uuid].pointintime.effectivedatetime instanceof Date).to.be(true);
                expect(filters[uuid].pointintime.effectivedatetime.getTime()).to.eql(1447574400000);
                expect(filters[uuid].timerange.effectivemindatetime instanceof Date).to.be(true);
                expect(filters[uuid].timerange.effectivemindatetime.getTime()).to.eql(1433116800000);
                expect(filters[uuid].timerange.effectivemaxdatetime instanceof Date).to.be(true);
                expect(filters[uuid].timerange.effectivemaxdatetime.getTime()).to.eql(1435622400000);
                expect(filters[uuid].value).to.be.an('object');
                expect(filters[uuid].value.alias).to.be('Messnetz');
                expect(filters[uuid].value.effectivevalue).to.be('\'triangle\'');
                expect(filters[uuid].Stil).to.be.an('object');
                expect(filters[uuid].Stil.alias).to.be('Stil');
                expect(filters[uuid].Stil.effectivevalue).to.be('point');
            });

        });

        describe('setRouteForView', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.setRouteForView).to.be.a('function');
            });
        });

        describe('filterToPermalinkString', function() {
            var filterToString = Koala.util.Routing.filterToPermalinkString;
            it('is a function', function() {
                expect(filterToString).to.be.a('function');
            });

            var filter;
            it('can transform pointintime-filter', function() {
                filter = {
                    type: "pointintime",
                    param: "end_measure",
                    interval: "10",
                    unit: "minutes",
                    mindatetimeformat: "Y-m-dTH:i:s",
                    mindatetimeinstant: "2012-01-01T00:00:00",
                    maxdatetimeformat: "Y-m-dTH:i:s",
                    maxdatetimeinstant: "2015-11-18T23:50:00",
                    defaulttimeformat: "Y-m-dTH:i:s",
                    defaulttimeinstant: "2015-11-05T12:00:00",
                    effectivedatetime: new Date(1446721200000)
                };
                expect(filterToString(filter)).to.eql('pt{t1446721200000}');
            });

            it('can transform timerange-filter', function() {
                filter = {
                    type: "timerange",
                    param: "start_measure,end_measure",
                    interval: "1",
                    unit: "minutes",
                    maxduration: "1440",
                    mindatetimeformat: "Y-m-dTH:i:s",
                    mindatetimeinstant: "2015-01-01T00:00:00",
                    maxdatetimeformat: "Y-m-dTH:i:s",
                    maxdatetimeinstant: "2015-11-20T00:00:00",
                    defaultstarttimeformat: "Y-m-dTH:i:s",
                    defaultstarttimeinstant: "2015-08-01T00:00:00",
                    defaultendtimeformat: "Y-m-dTH:i:s",
                    defaultendtimeinstant: "2015-11-16T00:00:00",
                    effectivemindatetime: new Date(1433116800000),
                    effectivemaxdatetime: new Date(1435622400000)
                };
                expect(filterToString(filter)).to.eql('tr{s1433116800000e1435622400000}');
            });

            it('can transform value-filter', function() {
                filter = {
                    type: "value",
                    param: "style",
                    alias: "Messnetz",
                    defaultValue: "'point'",
                    allowedValues: "[{\"val\":\"'point'\",\"dsp\":\"BfS\"},{\"val\":\"'triangle'\",\"dsp\":\"KF\u00dc\"}]",
                    operator: "=",
                    allowMultipleSelect: "true",
                    encodeInViewParams: "",
                    effectivevalue: ["'triangle'"]
                };
                // debugger
                expect(filterToString(filter)).to.eql('at{Messnetz=\'triangle\'}');
            });

            it('can transform style-filter', function() {
                filter = {
                    type: "value",
                    param: "STYLES",
                    alias: "Stil",
                    defaultValue: "blue-point",
                    allowedValues: "point,blue-point",
                    operator: "=",
                    allowMultipleSelect: "false",
                    encodeInViewParams: "true",
                    effectivevalue: "point"
                };
                expect(filterToString(filter)).to.eql('st{point}');
            });
        });

    });
});
