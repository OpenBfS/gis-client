Ext.Loader.syncRequire(['Koala.util.Layer', 'Koala.util.String']);

describe('Koala.util.Layer', function() {
    var oldTxtUntil = Koala.util.Layer.txtUntil;
    var oldDefaultFormat = Koala.util.String.defaultDateFormat;
    beforeEach(function() {
        // mock up successful i18n
        Koala.util.Layer.txtUntil = 'bis';
        Koala.util.String.defaultDateFormat = 'd.m.Y K\\o\\a\\l\\a';
        Koala.Application = {};
        Koala.Application.isLocal = function() {
            return false;
        };
        Koala.Application.isUtc = function() {
            return true;
        };
    });
    afterEach(function() {
        // un-mock successful i18n
        Koala.util.Layer.txtUntil = oldTxtUntil;
        Koala.util.String.defaultDateFormat = oldDefaultFormat;
        delete Koala.Application;
    });


    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.Layer).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {

        describe('#setOriginalMetadata', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.setOriginalMetadata).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.setOriginalMetadata).to.be.a(Function);
            });
            it('sets the originalmetadata property', function() {
                // Setup
                var layer = new ol.layer.Image();
                var metadata = {
                    a: 'b'
                };

                Koala.util.Layer.setOriginalMetadata(layer, metadata);
                expect(layer.get(Koala.util.Layer.FIELDNAME_ORIGINAL_METADATA))
                    .to.eql(metadata);
            });
        });

        describe('#getOriginalMetadata', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.getOriginalMetadata).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.getOriginalMetadata).to.be.a(Function);
            });
            it('returns the content of the originalmetadata property', function() {
                // Setup
                var layer = new ol.layer.Image();
                var metadata = {
                    a: 'b'
                };

                Koala.util.Layer.setOriginalMetadata(layer, metadata);
                expect(layer.get(Koala.util.Layer.FIELDNAME_ORIGINAL_METADATA))
                    .to.eql(metadata);
                var got = Koala.util.Layer.getOriginalMetadata(layer);
                expect(got).to.eql(metadata);
            });
        });

        describe('#hasOriginalMetadata', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.hasOriginalMetadata).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.hasOriginalMetadata).to.be.a(Function);
            });
            it('returns true if orginalmetadata is included', function() {
                // Setup
                var layer = new ol.layer.Image();
                var metadata = {
                    a: 'b'
                };

                Koala.util.Layer.setOriginalMetadata(layer, metadata);
                var hasOriginalMetadata = Koala.util.Layer.hasOriginalMetadata(layer);
                expect(hasOriginalMetadata).to.be(true);
            });
            it('returns false if orginalmetadata is not included', function() {
                // Setup
                var layer = new ol.layer.Image();

                var hasOriginalMetadata = Koala.util.Layer.hasOriginalMetadata(layer);
                expect(hasOriginalMetadata).to.be(false);
            });
        });

        describe('#isCartoWindowLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.isCartoWindowLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.isCartoWindowLayer).to.be.a(Function);
            });
            it('returns true if showCartoWindow is set to true', function() {
                // Setup
                var layer = new ol.layer.Image();
                layer.set('showCartoWindow', true);

                Koala.util.Layer.isCartoWindowLayer(layer);
                var isCartoWindowLayer = Koala.util.Layer.isCartoWindowLayer(layer);
                expect(isCartoWindowLayer).to.be(true);
            });
            it('returns falsy if showCartoWindow is undefined or set to false', function() {
                // Setup
                var layer = new ol.layer.Image();

                var isCartoWindowLayer = Koala.util.Layer.isCartoWindowLayer(layer);
                expect(isCartoWindowLayer).to.not.be.ok();
                isCartoWindowLayer = Koala.util.Layer.isCartoWindowLayer(layer);
                layer.set('showCartoWindow', false);
                expect(isCartoWindowLayer).to.not.be.ok();
            });
        });

        describe('#isChartableLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.isChartableLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.isChartableLayer).to.be.a(Function);
            });
            it('returns true if isTimeseriesChartLayer or isBarChartLayer returns true', function() {
                // Setup
                var timeSeriesLayer = new ol.layer.Image();
                timeSeriesLayer.set('timeSeriesChartProperties', {
                    a: 'b'
                });
                var barChartLayer = new ol.layer.Image();
                barChartLayer.set('barChartProperties', {
                    a: 'b'
                });

                var isChartable = Koala.util.Layer.isChartableLayer(timeSeriesLayer);
                expect(isChartable).to.be(true);
                isChartable = Koala.util.Layer.isChartableLayer(barChartLayer);
                expect(isChartable).to.be(true);
            });
            it('returns false if neither isTimeseriesChartLayer nor isBarChartLayer returns true', function() {
                // Setup
                var layer = new ol.layer.Image();

                var isCartoWindowLayer = Koala.util.Layer.isCartoWindowLayer(layer);
                expect(isCartoWindowLayer).to.be(false);
            });
        });

        describe('#isTimeseriesChartLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.isTimeseriesChartLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.isTimeseriesChartLayer).to.be.a(Function);
            });
            it('returns true if timeSeriesChartProperties property contains an object', function() {
                // Setup
                var timeSeriesLayer = new ol.layer.Image();
                timeSeriesLayer.set('timeSeriesChartProperties', {
                    a: 'b'
                });

                var isTimeseriesChartLayer = Koala.util.Layer.isTimeseriesChartLayer(timeSeriesLayer);
                expect(isTimeseriesChartLayer).to.be(true);
            });
            it('returns false if timeSeriesChartProperties property is undefined or an empty object', function() {
                // Setup
                var timeSeriesLayer = new ol.layer.Image();

                var isTimeseriesChartLayer = Koala.util.Layer.isTimeseriesChartLayer(timeSeriesLayer);
                expect(isTimeseriesChartLayer).to.be(false);
                timeSeriesLayer.set('timeSeriesChartProperties', {});
                expect(isTimeseriesChartLayer).to.be(false);
            });
        });

        describe('#isBarChartLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.isBarChartLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.isBarChartLayer).to.be.a(Function);
            });
            it('returns true if barChartProperties property contains an object', function() {
                // Setup
                var barChartLayer = new ol.layer.Image();
                barChartLayer.set('barChartProperties', {
                    a: 'b'
                });

                var isBarChartLayer = Koala.util.Layer.isBarChartLayer(barChartLayer);
                expect(isBarChartLayer).to.be(true);
            });
            it('returns false if barChartProperties property is undefined or an empty object', function() {
                // Setup
                var barChartLayer = new ol.layer.Image();

                var isBarChartLayer = Koala.util.Layer.isBarChartLayer(barChartLayer);
                expect(isBarChartLayer).to.be(false);
                barChartLayer.set('barChartProperties', {});
                expect(isBarChartLayer).to.be(false);
            });
        });

        describe('#isTableLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.isTableLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.isTableLayer).to.be.a(Function);
            });
            it('returns true if tableContentProperty or tableContentURL property is truthy', function() {
                // Setup
                var layer1 = new ol.layer.Image();
                layer1.set('tableContentProperty', 'Peter');
                var layer2 = new ol.layer.Image();
                layer2.set('tableContentURL', 'Peter');

                var isTableLayer = Koala.util.Layer.isTableLayer(layer1);
                expect(isTableLayer).to.be(true);
                isTableLayer = Koala.util.Layer.isTableLayer(layer2);
                expect(isTableLayer).to.be(true);
            });
            it('returns false if neither tableContentProperty nor tableContentURL property is truthy', function() {
                // Setup
                var layer = new ol.layer.Image();

                var isTableLayer = Koala.util.Layer.isTableLayer(layer);
                expect(isTableLayer).to.be(false);
            });
        });

        describe('#isHtmlLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.isHtmlLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.isHtmlLayer).to.be.a(Function);
            });
            it('returns true if htmlContentProperty or htmlContentURL property is truthy', function() {
                // Setup
                var layer1 = new ol.layer.Image();
                layer1.set('htmlContentProperty', 'Peter');
                var layer2 = new ol.layer.Image();
                layer2.set('htmlContentURL', 'Peter');

                var isHtmlLayer = Koala.util.Layer.isHtmlLayer(layer1);
                expect(isHtmlLayer).to.be(true);
                isHtmlLayer = Koala.util.Layer.isHtmlLayer(layer2);
                expect(isHtmlLayer).to.be(true);
            });
            it('returns false if neither htmlContentProperty nor htmlContentURL property is truthy', function() {
                // Setup
                var layer = new ol.layer.Image();

                var isHtmlLayer = Koala.util.Layer.isHtmlLayer(layer);
                expect(isHtmlLayer).to.be(false);
            });
        });

        describe('#isWmsLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.isWmsLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.isWmsLayer).to.be.a(Function);
            });
            it('returns true if the layer got a "TileWMS" or "ImageWMS" source', function() {
                // Setup
                var tileWmsLayer = new ol.layer.Image({
                    source: new ol.source.TileWMS()
                });
                var imageWmsLayer = new ol.layer.Image({
                    source: new ol.source.ImageWMS()
                });

                var isWmsLayer = Koala.util.Layer.isWmsLayer(tileWmsLayer);
                expect(isWmsLayer).to.be(true);
                isWmsLayer = Koala.util.Layer.isWmsLayer(imageWmsLayer);
                expect(isWmsLayer).to.be(true);
            });
            it('returns false if the layer neither got a "TileWMS" nor "ImageWMS" source', function() {
                // Setup
                var layer = new ol.layer.Image();

                var isWmsLayer = Koala.util.Layer.isWmsLayer(layer);
                expect(isWmsLayer).to.be(false);
            });
        });

        describe('#isVectorLayer', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.isVectorLayer).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.isVectorLayer).to.be.a(Function);
            });
            it('returns true if the layer got a "Vector" source', function() {
                // Setup
                var layer = new ol.layer.Image({
                    source: new ol.source.Vector()
                });

                var isVectorLayer = Koala.util.Layer.isVectorLayer(layer);
                expect(isVectorLayer).to.be(true);
            });
            it('returns false if the layer dont got a "Vector"', function() {
                // Setup
                var layer = new ol.layer.Image();

                var isVectorLayer = Koala.util.Layer.isVectorLayer(layer);
                expect(isVectorLayer).to.be(false);
            });
        });

        describe('#metadataHasFilters', function() {
            it('is defined', function() {
                expect(
                    Koala.util.Layer.metadataHasFilters
                ).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(
                    Koala.util.Layer.metadataHasFilters
                ).to.be.a(Function);
            });
            it('does not throw if called without metadata', function() {
                expect(
                    Koala.util.Layer.metadataHasFilters
                ).to.not.throwException();
            });
            it('returns false without metadata', function() {
                expect(
                    Koala.util.Layer.metadataHasFilters()
                ).to.be(false);
            });
            it('returns true if filters defined and filled', function() {
                var metadata = {
                    filters: [{}]
                };
                expect(
                    Koala.util.Layer.metadataHasFilters(metadata)
                ).to.be(true);
            });
            it('supports also the old way with only one filter', function() {
                var metadata = {
                    filter: {}
                };
                expect(
                    Koala.util.Layer.metadataHasFilters(metadata)
                ).to.be(true);
            });
            it('returns false if filters defined but empty', function() {
                var metadata = {
                    filters: []
                };
                expect(
                    Koala.util.Layer.metadataHasFilters(metadata)
                ).to.be(false);
            });
            it('returns false when neither filter nor filters', function() {
                var metadatas = [{}, // empty
                    {
                        Filter: {}
                    }, // wrong spelling
                    {
                        fiLterS: [{}]
                    }, // wrong spelling
                    {
                        foo: {
                            filters: [{}]
                        }
                    }, // nesting wrong
                    {
                        foo: {
                            filter: {}
                        }
                    } // nesting wrong
                ];
                metadatas.forEach(function(md) {
                    expect(
                        Koala.util.Layer.metadataHasFilters(md)
                    ).to.be(false);
                });
            });
            it('returns false when filters is not an array', function() {
                var metadatas = [{
                        filters: undefined
                    },
                    {
                        filters: null
                    },
                    {
                        filters: 'foo'
                    },
                    {
                        filters: {}
                    },
                    {
                        filters: true
                    },
                    {
                        filters: -42.11
                    },
                    {
                        filters: function() {}
                    },
                    {
                        filters: /regex/
                    }
                ];
                metadatas.forEach(function(md) {
                    expect(
                        Koala.util.Layer.metadataHasFilters(md)
                    ).to.be(false);
                });
            });
        });

        describe('#getFiltersFromMetadata', function() {
            it('returns the filters if correctly configured', function() {
                var filters = [{
                    foo: 'bar'
                }, {
                    humpty: 'dumpty'
                }];
                var metadata = {
                    filters: filters
                };
                var got = Koala.util.Layer.getFiltersFromMetadata(metadata);

                expect(got).to.be(filters);
                expect(got).to.have.length(2);
            });
            it('normalizes the old way with only one filter to array', function() {
                var filter = {
                    humpty: 'dumpty'
                };
                var metadata = {
                    filter: filter
                };
                var got = Koala.util.Layer.getFiltersFromMetadata(metadata);

                expect(got[0]).to.eql(filter);
                expect(got).to.have.length(1);
            });
            it('merges old and new syntax to a combined array', function() {
                var filters = [{
                    foo: 'bar'
                }, {
                    humpty: 'dumpty'
                }];
                var filter = {
                    baz: 'bor'
                };
                var metadata = {
                    filters: filters,
                    filter: filter
                };
                var got = Koala.util.Layer.getFiltersFromMetadata(metadata);

                expect(got[0]).to.eql(filters[0]);
                expect(got[1]).to.eql(filters[1]);
                expect(got[2]).to.eql(filter);
                expect(got).to.have.length(3);
            });
            it('return null if no filters defined', function() {
                var metadatas = [{}, // empty
                    {
                        Filter: {}
                    }, // wrong spelling
                    {
                        fiLterS: [{}]
                    }, // wrong spelling
                    {
                        foo: {
                            filters: [{}]
                        }
                    }, // nesting wrong
                    {
                        foo: {
                            filter: {}
                        }
                    }, // nesting wrong
                    {
                        filters: undefined
                    },
                    {
                        filters: null
                    },
                    {
                        filters: 'foo'
                    },
                    {
                        filters: {}
                    },
                    {
                        filters: true
                    },
                    {
                        filters: -42.11
                    },
                    {
                        filters: function() {}
                    },
                    {
                        filters: /regex/
                    }
                ];
                metadatas.forEach(function(md) {
                    var got = Koala.util.Layer.getFiltersFromMetadata(md);
                    expect(got).to.be(null);
                });
            });
            it('returns test_data filters if user is allowed to see it', function() {
                // Setup
                var testObjs = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                    }
                });
                var filters = [{
                    param: 'test_data'
                }];

                var metadata = {
                    filters: filters
                };

                var got = Koala.util.Layer.getFiltersFromMetadata(metadata);
                expect(got).to.be(filters);

                // Teardown
                TestUtil.teardownTestObjects(testObjs);
            });
        });

        describe('#getEffectiveTimeFilterFromMetadata', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.getEffectiveTimeFilterFromMetadata).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.getEffectiveTimeFilterFromMetadata).to.be.a(Function);
            });
            it('returns the last time filter', function() {
                var pointInTimeFilter = {
                    type: 'pointintime',
                    effectivedatetime: moment.utc('1980-11-28')
                };
                var timeRangeFilter = {
                    type: 'timerange',
                    effectivemindatetime: moment.utc('1980-11-28'),
                    effectivemaxdatetime: moment.utc('1998-11-28')
                };
                var metadata = {
                    filters: [timeRangeFilter, pointInTimeFilter]
                };
                var got = Koala.util.Layer.getEffectiveTimeFilterFromMetadata(metadata);
                expect(got).to.eql(pointInTimeFilter);
            });

        });

        describe('#getMetadataFromUuid', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.getMetadataFromUuid).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.getMetadataFromUuid).to.be.a(Function);
            });
            it('returns a promise with an metadataobject', function(done) {
                if (Ext.browser.userAgent.indexOf('PhantomJS') === -1) {
                    //Setup
                    var testObjs = TestUtil.setupTestObjects({
                        mapComponentOpts: {
                            appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                        }
                    });
                    var backgroundLayerUUID = '88415902-4ca7-4d1c-b714-64cc917fc2ab';
                    var promise = Koala.util.Layer.getMetadataFromUuid(backgroundLayerUUID);
                    expect(promise).to.be.a(Ext.Promise);
                    promise.then(function(metadata) {
                        expect(metadata).to.be.an('object');
                        done();
                    });

                    // Teardown
                    TestUtil.teardownTestObjects(testObjs);
                } else {
                    done();
                }
            });
        });

        describe('#getMetadataValue', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.getMetadataValue).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.getMetadataValue).to.be.a(Function);
            });
            it('returns a promise with the responseText of the response', function(done) {
                if (Ext.browser.userAgent.indexOf('PhantomJS') === -1) {
                    //Setup
                    var testObjs = TestUtil.setupTestObjects({
                        mapComponentOpts: {
                            appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                        }
                    });
                    var promise = Koala.util.Layer.getMetadataValue('http://localhost:9876/base/resources/appContextTest.json');
                    expect(promise).to.be.a(Ext.Promise);
                    promise.then(function(appContext) {
                        expect(appContext).to.be.a('string');
                        expect(Ext.decode(appContext)).to.be.an('object');
                        done();
                    });

                    // Teardown
                    TestUtil.teardownTestObjects(testObjs);
                } else {
                    done();
                }
            });

        });

        describe('#addLayerToMap', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.addLayerToMap).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.addLayerToMap).to.be.a(Function);
            });
            it('adds the layer to the map', function() {
                //Setup
                var testObjs = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                    }
                });
                var metadata = {
                    'id': '764e5d95-c851-4a08-b3f0-c304f610e69f',
                    'treeTitle': 'Hintergrundkarte',
                    'legendTitle': '',
                    'printTitle': '',
                    'filters': [],
                    'layerConfig': {
                        'wmts': {
                            'url': 'http://www.imis.bfs.de/mapcache/wmts',
                            'layers': 'osm_bfs_google',
                            'tilematrixset': 'GoogleMapsCompatible',
                            'transparent': 'true',
                            'version': '1.0.0',
                            'styles': 'default',
                            'format': 'image/png'
                        },
                        'wfs': {
                            'url': ''
                        },
                        'download': {
                            'url': '',
                            'filterFieldStart': '',
                            'filterFieldEnd': ''
                        },
                        'olProperties': {
                            'allowShortInfo': 'true',
                            'allowDownload': 'false',
                            'allowRemoval': 'false',
                            'allowFeatureInfo': 'false'
                        },
                        'timeSeriesChartProperties': {
                        },
                        'barChartProperties': {
                        }
                    }
                };

                var map = BasiGX.util.Map.getMapComponent().getMap();
                var oldLength = BasiGX.util.Layer.getAllLayers(map).length;
                Koala.util.Layer.addLayerToMap(metadata);
                var newLength = BasiGX.util.Layer.getAllLayers(map).length;

                expect(newLength).to.be(oldLength + 1);

                // Teardown
                TestUtil.teardownTestObjects(testObjs);
            });
        });

        describe('#repaintLayerFilterIndication', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.repaintLayerFilterIndication).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.repaintLayerFilterIndication).to.be.a(Function);
            });
        });

        describe('#getSuffixId', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.getSuffixId).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.getSuffixId).to.be.a(Function);
            });
            it('returns an id suffix string', function() {
                var got = Koala.util.Layer.getSuffixId();
                expect(Ext.String.startsWith(got, 'layer-suffix-ext-')).to.be.ok();
                var number = got.split('layer-suffix-ext-')[1];
                var regex = new RegExp('^[0-9]*$');
                expect(regex.test(number)).to.be.ok();
            });
        });

        describe('#addOlLayersToMap', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.addOlLayersToMap).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.addOlLayersToMap).to.be.a(Function);
            });
            it('adds layers to the map', function() {
                //Setup
                var testObjs = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                    }
                });

                var layers = [new ol.layer.Image(), new ol.layer.Image()];
                var map = BasiGX.util.Map.getMapComponent().getMap();
                var oldLength = BasiGX.util.Layer.getAllLayers(map).length;
                Koala.util.Layer.addOlLayersToMap(layers);
                var newLength = BasiGX.util.Layer.getAllLayers(map).length;

                expect(newLength).to.be(oldLength + layers.length);

                // Teardown
                TestUtil.teardownTestObjects(testObjs);
            });
        });

        describe('#addOlLayerToMap', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.addOlLayerToMap).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.addOlLayerToMap).to.be.a(Function);
            });
            it('adds a layer with suffix properties to the map', function() {
                //Setup
                var testObjs = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                    }
                });
                var layer = new ol.layer.Image();
                var logSpy = sinon.spy(Ext.log, 'warn');
                var setAsActiveInLegendTreeSpy = sinon.spy(Koala.util.Layer, 'setAsActiveInLegendTree');
                var map = BasiGX.util.Map.getMapComponent().getMap();
                var oldLength = BasiGX.util.Layer.getAllLayers(map).length;

                Koala.util.Layer.addOlLayerToMap(layer);
                var newLength = BasiGX.util.Layer.getAllLayers(map).length;
                expect(logSpy.calledOnce).to.be(true);
                expect(newLength).to.be(oldLength + 1);
                expect(layer.get('suffix')).to.be.a('string');
                expect(layer.get('__suffix_id__')).to.be.a('string');
                expect(layer.get('nameWithSuffix')).to.be.a('string');
                expect(setAsActiveInLegendTreeSpy.calledOnce).to.be(true);

                // Teardown
                TestUtil.teardownTestObjects(testObjs);
            });
        });

        describe('#setAsActiveInLegendTree', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.setAsActiveInLegendTree).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.setAsActiveInLegendTree).to.be.a(Function);
            });
        });

        describe('#bindLayerVisibilityHandlers', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.bindLayerVisibilityHandlers).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.bindLayerVisibilityHandlers).to.be.a(Function);
            });
        });

        describe('#addLayerByUuid', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.addLayerByUuid).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.addLayerByUuid).to.be.a(Function);
            });
            it('adds a layer from his uuid to the map', function(done) {
                if (Ext.browser.userAgent.indexOf('PhantomJS') === -1) {
                    //Setup
                    var testObjs = TestUtil.setupTestObjects({
                        mapComponentOpts: {
                            appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                        }
                    });
                    var backgroundLayerUUID = '88415902-4ca7-4d1c-b714-64cc917fc2ab';

                    var map = BasiGX.util.Map.getMapComponent().getMap();
                    var oldLength = BasiGX.util.Layer.getAllLayers(map).length;

                    var promise = Koala.util.Layer.addLayerByUuid(backgroundLayerUUID);

                    promise.then(function() {
                        var newLength = BasiGX.util.Layer.getAllLayers(map).length;
                        expect(newLength).to.be(oldLength + 1);
                        done();
                        // Teardown
                        TestUtil.teardownTestObjects(testObjs);
                    })
                    .catch(function() {
                        expect().fail();
                        done();
                        // Teardown
                        TestUtil.teardownTestObjects(testObjs);
                    });
                } else {
                    done();
                }
            });
        });

        describe('#showChangeFilterSettingsWin', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.showChangeFilterSettingsWin).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.showChangeFilterSettingsWin).to.be.a(Function);
            });
        });

        describe('#getCurrentLegendUrl', function() {
            it('is defined', function() {
                expect(Koala.util.Layer.getCurrentLegendUrl).to.not.be(undefined);
            });
            it('is a function', function() {
                expect(Koala.util.Layer.getCurrentLegendUrl).to.be.a(Function);
            });
            it('is a function', function() {
                //Setup
                var testObjs = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        appContextPath: 'http://localhost:9876/base/resources/appContextTest.json'
                    }
                });
                var layer = new ol.layer.Image({
                    source: new ol.source.ImageWMS(),
                    legendUrl: 'http://fake.de',
                    legendWidth: 200,
                    legendHeight: 200
                });
                var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
                var scale = BasiGX.util.Map.getScale(map);

                var url = Koala.util.Layer.getCurrentLegendUrl(layer);
                expect(url).to.be.a('string');
                var values = Ext.urlDecode(url.split('?')[1]);
                expect(Ext.Number.from(values.WIDTH)).to.be(200);
                expect(Ext.Number.from(values.HEIGHT)).to.be(200);
                expect(Ext.Number.from(values.SCALE)).to.be(scale);

                // Teardown
                TestUtil.teardownTestObjects(testObjs);
            });
        });

        describe('#getFiltersTextFromMetadata', function() {
            it('returns the empty string if no filter', function() {
                var metadatas = [{}, // empty
                    {
                        Filter: {}
                    }, // wrong spelling
                    {
                        fiLterS: [{}]
                    }, // wrong spelling
                    {
                        foo: {
                            filters: [{}]
                        }
                    }, // nesting wrong
                    {
                        foo: {
                            filter: {}
                        }
                    }, // nesting wrong
                    {
                        filters: undefined
                    },
                    {
                        filters: null
                    },
                    {
                        filters: 'foo'
                    },
                    {
                        filters: {}
                    },
                    {
                        filters: true
                    },
                    {
                        filters: -42.11
                    },
                    {
                        filters: function() {}
                    },
                    {
                        filters: /regex/
                    }
                ];
                metadatas.forEach(function(md) {
                    var got = Koala.util.Layer.getFiltersTextFromMetadata(md);
                    expect(got).to.be('');
                });
            });
            it('returns an empty text for rodos-filter', function() {
                var metadata = {
                    filters: [{
                        'allowedValues': [{
                            'val': 'a902ae474_0aa9_1547_1d1b_f7bfa80b0c46',
                            'dsp': 'a902ae474_0aa9_1547_1d1b_f7bfa80b0c46'
                        }],
                        'allowMultipleSelect': 'false',
                        'encodeInViewParams': 'true',
                        'param': 'tablename',
                        'defaultValue': 'a902ae474_0aa9_1547_1d1b_f7bfa80b0c46',
                        'type': 'value',
                        'operator': '='
                    }, {
                        'allowedValues': [{
                            'val': '2017-04-21T07:00:00Z',
                            'dsp': '2017-04-21T07:00:00Z'
                        }, {
                            'val': '2017-04-22T06:00:00Z',
                            'dsp': '2017-04-22T06:00:00Z'
                        }],
                        'allowMultipleSelect': 'false',
                        'encodeInViewParams': 'false',
                        'param': 'date',
                        'defaultValue': '2017-04-22T06:00:00Z',
                        'alias': 'Prognosezeitpunkt',
                        'type': 'rodostime',
                        'operator': '='
                    }]
                };
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                expect(got).not.to.be('');
            });
            it('returns a text for key-value-filter', function() {
                var metadata = {
                    filters: [{
                        type: 'value',
                        param: 'foo',
                        operator: '=',
                        effectivevalue: '\'bar\''
                    }]
                };
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                // #stringifyValueFilter should be tested separately
                var filterRepr = Koala.util.Layer.stringifyValueFilter(
                    metadata.filters[0], true
                );
                expect(got).to.not.be('');
                expect(got.indexOf(filterRepr)).to.not.be(-1);
            });
            it('returns a localized text for point-in-time-filter (de)', function() {
                var metadata = {
                    filters: [{
                        type: 'pointintime',
                        effectivedatetime: moment.utc('1980-11-28')
                    }]
                };
                moment.locale('de');
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                expect(got).to.not.be('');
                expect(got.indexOf('28. November 1980 00:00')).to.not.be(-1);
            });
            it('returns a localized text for point-in-time-filter (en)',
                function() {
                    var metadata = {
                        filters: [{
                            type: 'pointintime',
                            effectivedatetime: moment.utc('1980-11-28')
                        }]
                    };
                    moment.locale('en');
                    var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                    expect(got).to.not.be('');
                    expect(got.indexOf('November 28, 1980 12:00 AM')).to.not.be(-1);
                }
            );
            it('returns a localized text for point-in-time-filter (fr)',
                function() {
                    var metadata = {
                        filters: [{
                            type: 'pointintime',
                            effectivedatetime: moment.utc('1980-11-28')
                        }]
                    };
                    moment.locale('fr');
                    var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                    expect(got).to.not.be('');
                    expect(got.indexOf('28 novembre 1980 00:00')).to.not.be(-1);
                }
            );
            it('returns a localized text for timerange-filter (de)', function() {
                var min = moment.utc('1980-11-28');
                var max = moment.utc('1998-11-28');
                var metadata = {
                    filters: [{
                        type: 'timerange',
                        effectivemindatetime: min,
                        effectivemaxdatetime: max
                    }]
                };
                moment.locale('de');
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                var until = Koala.util.Layer.txtUntil;

                expect(got).to.not.be('');
                expect(got.indexOf('28. November 1980 00:00')).to.not.be(-1);
                expect(got.indexOf(until)).to.not.be(-1);
                expect(got.indexOf('28. November 1998 00:00')).to.not.be(-1);
            });
            it('returns a localized text for timerange-filter (en)', function() {
                var min = moment.utc('1980-11-28');
                var max = moment.utc('1998-11-28');
                var metadata = {
                    filters: [{
                        type: 'timerange',
                        effectivemindatetime: min,
                        effectivemaxdatetime: max
                    }]
                };
                moment.locale('en');
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                var until = Koala.util.Layer.txtUntil;

                expect(got).to.not.be('');
                expect(got.indexOf('November 28, 1980 12:00 AM')).to.not.be(-1);
                expect(got.indexOf(until)).to.not.be(-1);
                expect(got.indexOf('November 28, 1998 12:00 AM')).to.not.be(-1);
            });
            it('returns a localized text for timerange-filter (fr)', function() {
                var min = moment.utc('1980-11-28');
                var max = moment.utc('1998-11-28');
                var metadata = {
                    filters: [{
                        type: 'timerange',
                        effectivemindatetime: min,
                        effectivemaxdatetime: max
                    }]
                };
                moment.locale('fr');
                var got = Koala.util.Layer.getFiltersTextFromMetadata(metadata);

                var until = Koala.util.Layer.txtUntil;

                expect(got).to.not.be('');
                expect(got.indexOf('28 novembre 1980 00:00')).to.not.be(-1);
                expect(got.indexOf(until)).to.not.be(-1);
                expect(got.indexOf('28 novembre 1998 00:00')).to.not.be(-1);
            });
        });

        describe('#getOrderedFlatLayers', function() {
            it('returns a flat list for a basic array', function() {
                var LayerUtil = Koala.util.Layer;
                var layers = [{
                    leaf: true
                }, {
                    leaf: true
                }, {
                    leaf: true
                }];
                var got = LayerUtil.getOrderedFlatLayers(layers);
                expect(got).to.be.an('array');
                expect(got).to.have.length(3);
                expect(got[0]).to.be(layers[0]);
                expect(got[1]).to.be(layers[1]);
                expect(got[2]).to.be(layers[2]);
            });
            it('returns a flat list for a hierarchical array', function() {
                var LayerUtil = Koala.util.Layer;
                var layers = [{
                    leaf: true
                }, {
                    leaf: false,
                    children: [{
                            leaf: true
                        },
                        {
                            leaf: true
                        }
                    ]
                }, {
                    leaf: true
                }];
                var got = LayerUtil.getOrderedFlatLayers(layers);
                expect(got).to.be.an('array');
                expect(got).to.have.length(4);
                expect(got[0]).to.be(layers[0]);
                expect(got[1]).to.be(layers[1].children[0]);
                expect(got[2]).to.be(layers[1].children[1]);
                expect(got[3]).to.be(layers[2]);
            });
            it('returns a flat list for a deeply nested array', function() {
                var LayerUtil = Koala.util.Layer;
                var layers = [{
                    leaf: true
                }, {
                    leaf: false,
                    children: [{
                        leaf: false,
                        children: [{
                            leaf: false,
                            children: [{
                                leaf: false,
                                children: [{
                                    leaf: false,
                                    children: [{
                                        leaf: true
                                    }]
                                }]
                            }]
                        }]
                    }]
                }, {
                    leaf: true
                }];
                var got = LayerUtil.getOrderedFlatLayers(layers);
                expect(got).to.be.an('array');
                expect(got).to.have.length(3);
                expect(got[0]).to.be(layers[0]);
                var expected = layers[1].children[0].children[0].children[0]
                    .children[0].children[0];
                expect(got[1]).to.be(expected);
                expect(got[2]).to.be(layers[2]);
            });
            it('returns a flat and skips falsy layers', function() {
                var LayerUtil = Koala.util.Layer;
                var layers = [{
                        leaf: true
                    },
                    undefined,
                    null,
                    false,
                    0,
                    ''
                ];
                var got = LayerUtil.getOrderedFlatLayers(layers);
                expect(got).to.be.an('array');
                expect(got).to.have.length(1);
                expect(got[0]).to.be(layers[0]);
            });
        });
    });
});
