Ext.Loader.syncRequire(['Koala.util.Routing', 'Koala.util.Date']);

describe('Koala.util.Routing', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Routing).to.not.be(undefined);
        });
    });

    describe('Static functions', function() {
        describe('#onUnmatchedRoute', function() {
            // Should be enough as just it's existence is required.
            it('is a function', function() {
                expect(Koala.util.Routing.onUnmatchedRoute).to.be.a('function');
            });
            it('warns for unmatched routes', function() {
                var logSpy = sinon.spy(Ext.log, 'info');
                Koala.util.Routing.onUnmatchedRoute('peter');
                expect(logSpy.calledOnce).to.be(true);
                expect(logSpy.calledWith('Unmatched route: ', 'peter')).to.be(true);
            });
        });

        describe('#onMapRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.onMapRoute).to.be.a('function');
            });
            it('sets zoom and center of the map', function() {
                //Setup
                var testObjs = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        appContextPath: 'http://localhost:9876/base/resources/appContext.json'
                    }
                });

                Koala.util.Routing.onMapRoute(765383, 6609503, 17);
                var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
                var mapView = map.getView();

                expect(mapView.getCenter()).to.eql([765383, 6609503]);
                expect(mapView.getZoom()).to.be(17);

                // Teardown
                TestUtil.teardownTestObjects(testObjs);
            });
        });

        describe('#onRodosProjectRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.onRodosProjectRoute).to.be.a('function');
            });
            it('calls the rodos util function "requestLayersOfProject" with the hash', function() {
                var utilStub = sinon.stub(Koala.util.Rodos, 'requestLayersOfProject');
                var projectUuid = 'fake';
                Koala.util.Routing.onRodosProjectRoute(projectUuid);
                expect(utilStub.calledOnce).to.be(true);
                expect(utilStub.calledWith(projectUuid)).to.be(true);
            });
        });

        describe('#beforeLayerTreeRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.beforeLayerTreeRoute).to.be.a('function');
            });
        });

        describe('#onLayerTreeRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.onLayerTreeRoute).to.be.a('function');
            });
        });

        describe('#setRouteForView', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.setRouteForView).to.be.a('function');
            });
        });

        describe('#parseCurrentHash', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.parseCurrentHash).to.be.a('function');
            });
            it('is returns an object representation of the location hash', function() {
                window.location.hash = '#map/5754301/6637890/10|layers/%7B%2283cb1604-3d8c-490b-b807-5e7cb17f3b22%22%3A%7B%22isVisible%22%3A1%2C%22filters%22%3A%5B%7B%22type%22%3A%22pointintime%22%2C%22effectivedatetime%22%3A1476662400000%7D%5D%7D%7D|';
                var parsedHash = Koala.util.Routing.parseCurrentHash();
                expect(parsedHash).to.have.keys('map', 'layers');
                expect(parsedHash.map).to.eql({0: 5754301, 1: 6637890, 2: 10});
                expect(parsedHash.layers).to.have.key('83cb1604-3d8c-490b-b807-5e7cb17f3b22');
                expect(parsedHash.layers['83cb1604-3d8c-490b-b807-5e7cb17f3b22']).to.have.keys('filters', 'isVisible');
            });
        });

        describe('#getRoute', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.getRoute).to.be.a('function');
            });
        });

        describe('#filterToPermaObj', function() {
            it('is a function', function() {
                expect(Koala.util.Routing.filterToPermaObj).to.be.a('function');
            });
            it('it transforms all filters correctly', function() {
                var moment = Koala.util.Date.getUtcMoment(new Date('2000-01-01'));
                var valueOfMoment = moment.valueOf();
                var rodosFilter = {
                    type: 'rodostime',
                    effectivedatetime: moment
                };
                var rodosPerma = Koala.util.Routing.filterToPermaObj(rodosFilter);
                var pointInTimeFilter = {
                    type: 'pointintime',
                    effectivedatetime: moment
                };
                var pointInTimePerma = Koala.util.Routing.filterToPermaObj(pointInTimeFilter);
                var timeRangeFilter = {
                    type: 'timerange',
                    effectivemindatetime: moment,
                    effectivemaxdatetime: moment
                };
                var timeRangePerma = Koala.util.Routing.filterToPermaObj(timeRangeFilter);
                var valueFilter = {
                    type: 'value',
                    effectivevalue: 'Peter',
                    alias: 'ALIAS',
                    param: 'PARAM'
                };
                var valuePerma = Koala.util.Routing.filterToPermaObj(valueFilter);

                expect(rodosPerma).to.eql({
                    type: 'rodostime',
                    effectivedatetime: valueOfMoment
                });
                expect(pointInTimePerma).to.eql({
                    type: 'pointintime',
                    effectivedatetime: valueOfMoment
                });
                expect(timeRangePerma).to.eql({
                    type: 'timerange',
                    effectivemindatetime: valueOfMoment,
                    effectivemaxdatetime: valueOfMoment
                });
                expect(valuePerma).to.eql(valueFilter);
            });
        });

    });
});
