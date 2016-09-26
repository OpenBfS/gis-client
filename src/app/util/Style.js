Ext.define('Koala.util.Style', {
    statics: {
        jsonixContext: null,
        marshaller: null,
        unmarshaller: null,
        neededGlobals: [
            'Jsonix',
            'SLD_1_0_0',
            'Filter_1_0_0',
            'GML_2_1_2',
            'XLink_1_0'
        ],
        DEFAULT_STROKE_OPACITY: 1,
        DEFAULT_STROKE_COLOR: '#000000',
        DEFAULT_STROKE_WIDTH: 0,

        DEFAULT_FILL_OPACITY: 1,

        /**
         * TODO the assumption below should be validated
         */
        rulesFromSldObject: function(sldObject){
            return sldObject.value.
                namedLayerOrUserLayer[0].
                namedStyleOrUserStyle[0].
                featureTypeStyle[0].
                rule;
        },

        /**
         * TODO the assumption below should be validated
         */
        setRulesOfSldObject: function(sldObject, rules){
            sldObject.value.
                namedLayerOrUserLayer[0].
                namedStyleOrUserStyle[0].
                featureTypeStyle[0].
                rule = rules;
        },

        isLogicalFilter: function(filter) {
            return 'logicOps' in filter;
        },

        isSpatialFilter: function(filter) {
            return 'spatialOps' in filter;
        },

        isComparisonFilter: function(filter) {
            return 'comparisonOps' in filter;
        },

        getPropertyNameFromFilter: function(filter){
            var operator = filter.comparisonOps.name.localPart;
            var propertyName;
            switch(operator) {
            case "PropertyIsNull":
                propertyName = filter.comparisonOps.value.propertyName
                        .content[0];
                break;
            case "PropertyIsLike":
                propertyName = filter.comparisonOps.value.propertyName
                        .content[0];
                break;
            case "PropertyIsBetween":
                propertyName = filter.comparisonOps.value.expression.value
                        .content[0];
                break;
            default:
                propertyName = filter.comparisonOps.value.expression[0]
                        .value.content[0];
                break;
            }
            return propertyName;
        },

        getLiteralValuesFromFilter: function(filter){
            var operator = filter.comparisonOps.name.localPart;
            var literalValues = [];
            switch(operator) {
            case "PropertyIsNull":
                literalValues = null;
                break;
            case "PropertyIsLike":
                literalValues.push(
                        filter.comparisonOps.value.literal.content[0]);
                break;
            case "PropertyIsBetween":
                literalValues.push(filter.comparisonOps.value.lowerBoundary
                        .expression.value.content[0]);
                literalValues.push(filter.comparisonOps.value.upperBoundary
                        .expression.value.content[0]);
                break;
            default:
                literalValues.push(filter.comparisonOps.value
                        .expression[1].value.content[0]);
                break;
            }
            return literalValues;
        },

        styleFromSymbolizers: function(symbolizers) {
            var styleUtil = Koala.util.Sld;
            if (!Ext.isArray(symbolizers)) {
                symbolizers = [symbolizers];
            }

            var styleArr = [];

            Ext.each(symbolizers, function(symbolizer){
                styleArr.push(styleUtil.styleFromSymbolizer(symbolizer));
            });

            return styleArr;
        },

        styleFromSymbolizer:  function(symbolizer) {
            var styleUtil = Koala.util.Sld;
            var symbolType = sldUtil.symbolTypeFromSymbolizer(symbolizer);

            var style;
            switch(symbolType) {
            case 'Point':
                style = styleUtil.pointStyleFromSymbolizer(symbolizer);
                break;
            case 'Line':
                style = styleUtil.lineStyleFromSymbolizer(symbolizer);
                break;
            case 'Polygon':
                style = styleUtil.polygonStyleFromSymbolizer(symbolizer);
                break;
            case 'Text':
                style = styleUtil.textStyleFromSymbolizer(symbolizer);
                break;
            case 'Raster':
                // IDK…
                Ext.log.warn('Unimplemented symbolType "Raster"');
                break;
            default:
                Ext.log.warn('Unexpected symbolType "' + symbolType + '"');
            }
            return style;
        },

        getFirstCssParameterContentByName: function(cssParameters, name) {
            var content;
            Ext.each(cssParameters, function(cssParameter){
                if (cssParameter.name === name) {
                    content = cssParameter.content[0];
                    return false; // … and stop iteration
                }
            });
            return content;
        },

        fillFromObj: function(mark) {
            var sldUtil = Koala.util.Sld;
            var fill;
            if ('fill' in mark) {
                // find the correct cssParameter
                var fillColor = sldUtil.getFirstCssParameterContentByName(
                        mark.fill.cssParameter, 'fill'
                    );
                var fillOpacity = sldUtil.getFirstCssParameterContentByName(
                        mark.fill.cssParameter, 'fill-opacity'
                    ) || sldUtil.DEFAULT_FILL_OPACITY;

                fillColor = BasiGX.util.Color.hexToRgba(fillColor, fillOpacity);
                fill = new ol.style.Fill({
                    color: fillColor
                });
            }
            return fill;
        },

        strokeFromObj: function(mark) {
            var sldUtil = Koala.util.Sld;
            var stroke;
            if ('stroke' in mark) {
                var strokeColor = sldUtil.getFirstCssParameterContentByName(
                        mark.stroke.cssParameter, 'stroke'
                    ) || sldUtil.DEFAULT_STROKE_COLOR;
                var strokeWidth = sldUtil.getFirstCssParameterContentByName(
                        mark.stroke.cssParameter, 'stroke-width'
                    ) || sldUtil.DEFAULT_STROKE_WIDTH;
                var strokeOpacity = sldUtil.getFirstCssParameterContentByName(
                        mark.stroke.cssParameter, 'stroke-opacity'
                    ) || sldUtil.DEFAULT_STROKE_OPACITY;

                strokeColor = BasiGX.util.Color.hexToRgba(strokeColor,
                        strokeOpacity);
                stroke = new ol.style.Stroke({
                    color: strokeColor,
                    width: strokeWidth
                    // TODO there are more… lineCap, lineJoin, lineDash,
                    //      miterLimit, they'll all have an SLD equivalent
                });
            }
            return stroke;
        },

        pointStyleFromSymbolizer: function(symbolizer) {
            // ol.style.Style with image either ol.style.Circle or
            // ol.style.Icon, or basically also ol.style.RegularShape,
            // for wkts
            var sldUtil = Koala.util.Sld;
            var graphic = symbolizer.value.graphic;
            var size = parseFloat(graphic.size.content, 10);
            var firstGraphicOrMark = graphic.externalGraphicOrMark[0];
            var firstTypeName = firstGraphicOrMark.TYPE_NAME;
            var style;
            var wellKnownName;
            if ((/Mark/).test(firstTypeName)) {
                // … ol.style.Circle or ol.style.RegularShape
                if(firstGraphicOrMark.wellKnownName){
                    wellKnownName = firstGraphicOrMark.wellKnownName.content[0];
                }
                var fill = sldUtil.fillFromObj(firstGraphicOrMark);
                var stroke = sldUtil.strokeFromObj(firstGraphicOrMark);

                switch(wellKnownName) {
                case "circle":
                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: size,
                            fill: fill,
                            stroke: stroke
                        })
                    });
                    break;
                case "square":
                    style = new ol.style.Style({
                        image: new ol.style.RegularShape({
                            fill: fill,
                            stroke: stroke,
                            points: 4,
                            radius: size,
                            angle: Math.PI / 4
                        })
                    });
                    break;
                case "triangle":
                    style = new ol.style.Style({
                        image: new ol.style.RegularShape({
                            fill: fill,
                            stroke: stroke,
                            points: 3,
                            radius: size,
                            rotation: Math.PI / 4,
                            angle: 0
                        })
                    });
                    break;
                case "star":
                    style = new ol.style.Style({
                        image: new ol.style.RegularShape({
                            fill: fill,
                            stroke: stroke,
                            points: 5,
                            radius: size,
                            radius2: size/2,
                            angle: 0
                        })
                    });
                    break;
                case "cross":
                    style = new ol.style.Style({
                        image: new ol.style.RegularShape({
                            fill: fill,
                            stroke: stroke,
                            points: 4,
                            radius: size,
                            radius2: size/2,
                            angle: 0
                        })
                    });
                    break;
                case "x":
                    style = new ol.style.Style({
                        image: new ol.style.RegularShape({
                            fill: fill,
                            stroke: stroke,
                            points: 4,
                            radius: size,
                            radius2: size/2,
                            angle: Math.PI / 4
                        })
                    });
                    break;
                default:
                    style = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 10,
                            fill: new ol.style.Fill({
                                color: '#3399CC'
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#FFFFFF',
                                width: 1.25
                            })
                        })
                    });
                    break;
                }
            } else if ((/Graphic/).test(firstTypeName)) {
                // … ol.style.Icon
                var imageSrc = sldUtil.onlineResourceFromGraphic(
                        firstGraphicOrMark
                    );
                style = new ol.style.Style({
                    image: new ol.style.Icon({
                        src: imageSrc,
                        // SLD size applies to height only if the image is
                        // rectangular, we'll fix this at the call site with
                        // a listener.
                        size: [size, size]
                    })
                });
            }

            return style;
        },

        onlineResourceFromGraphic: function(graphic) {
            var url;
            if ((/ExternalGraphic$/).test(graphic.TYPE_NAME)) {
                url = graphic.onlineResource.href;
            }
            return url;
        },

        /**
         * ol.style.Style with stroke being a ol.style.Stroke
         */
        lineStyleFromSymbolizer: function(symbolizer) {
            var sldUtil = Koala.util.Sld;
            var symbValue = symbolizer.value;
            var stroke = sldUtil.strokeFromObj(symbValue);
            return new ol.style.Style({
                stroke: stroke
            });
        },

        /**
         * ol.style.Style with stroke being a ol.style.Stroke, and
         * fill being an ol.style.Fill
         */
        polygonStyleFromSymbolizer: function(symbolizer) {
            var sldUtil = Koala.util.Sld;
            var symbValue = symbolizer.value;
            var fill = sldUtil.fillFromObj(symbValue);
            var stroke = sldUtil.strokeFromObj(symbValue);
            return new ol.style.Style({
                stroke: stroke,
                fill: fill
            });
        },

        textStyleFromSymbolizer: function() {
            Ext.log.warn('#textStyleFromSymbolizer: Not implemented yet');
            return null;
        },

        /**
         * Returns the geometryType of the first feature of an ol.layer.Vector.
         */
        symbolTypeFromVectorLayer: function(layer){
            if(!layer || !(layer instanceof ol.layer.Vector)){
                return;
            }
            return layer.getSource().getFeatures()[0].getGeometry().getType()
        },

        // /**
        //  * returns "Point", "Line", "Polygon", "Text" or "Raster"
        //  */
        // symbolTypeFromSymbolizer: function(symbolizers) {
        //     var symbolType;
        //     if (!Ext.isArray(symbolizers)) {
        //         symbolizers = [symbolizers];
        //     }
        //     // the first symbolizer shall determine the type of symbol:
        //     if (symbolizers.length >= 1) {
        //         var first = symbolizers[0];
        //         var localPart = Ext.String.trim(first.name.localPart);
        //         // These are the possibilities:
        //         // * PointSymbolizer
        //         // * LineSymbolizer
        //         // * PolygonSymbolizer
        //         // * TextSymbolizer
        //         // * RasterSymbolizer
        //         symbolType = localPart.replace(/Symbolizer$/, '');
        //     }
        //     return symbolType;
        // },

        olSymbolizerToSldSymbolizer: function(olSymbolizer){
            // has an image so it is a point style
            if(olSymbolizer.getImage()){
                return this.pointSymbolizerToSld(olSymbolizer);
            }
            // has no image but a fill so it is a polygon style
            if(olSymbolizer.getFill()){
                return this.polygonSymbolizerToSld(olSymbolizer);

            }
            // has no image but a fill so it is a polygon style
            if(olSymbolizer.getStroke()){
                return this.lineSymbolizerToSld(olSymbolizer);
            }
        },

        pointSymbolizerToSld: function(olSymbolizer){
            var sldSymbolizer = {
                name: {
                    namespaceURI: "http://www.opengis.net/sld",
                    localPart: "PointSymbolizer",
                    prefix: "sld",
                    key: "{http://www.opengis.net/sld}PointSymbolizer",
                    string: "{http://www.opengis.net/sld}sld:PointSymbolizer",
                    CLASS_NAME: "Jsonix.XML.QName"
                },
                value: {
                    TYPE_NAME: "SLD_1_0_0.PointSymbolizer",
                    graphic: {
                        TYPE_NAME: "SLD_1_0_0.Graphic"
                    }
                }
            };
            if(olSymbolizer.getImage() instanceof ol.style.Circle){
                var fillColor = BasiGX.util.Color.rgbaToHex(
                        olSymbolizer.getImage().getFill().getColor());
                var radius = olSymbolizer.getImage().getRadius().toString();
                var strokeColor = BasiGX.util.Color.rgbaToHex(
                        olSymbolizer.getImage().getStroke().getColor());
                var strokeWidth = olSymbolizer.getImage().getStroke()
                        .getWidth().toString();

                sldSymbolizer.value.graphic.externalGraphicOrMark = [{
                    TYPE_NAME: "SLD_1_0_0.Mark",
                    wellKnownName: {
                        TYPE_NAME: "SLD_1_0_0.WellKnownName",
                        content: ["circle"]
                    },
                    fill: {
                        TYPE_NAME: "SLD_1_0_0.Fill",
                        cssParameter: [{
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "fill",
                            content: [fillColor]
                        }]
                    },
                    stroke: {
                        TYPE_NAME: "SLD_1_0_0.Stroke",
                        cssParameter: [{
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "stroke",
                            content: [strokeColor]
                        }, {
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "stroke-width",
                            content: [strokeWidth]
                        }]
                    }
                }];
                sldSymbolizer.value.graphic.size = {
                    TYPE_NAME: "SLD_1_0_0.ParameterValueType",
                    content: [radius]
                };
            }
            if(olSymbolizer.getImage() instanceof ol.style.Icon){
                var size = olSymbolizer.getImage().getSize()[1].toString();
                var src = olSymbolizer.getImage().getSrc();
                sldSymbolizer.value.graphic.externalGraphicOrMark = [{
                    TYPE_NAME: "SLD_1_0_0.ExternalGraphic",
                    onlineResource: {
                        TYPE_NAME: "SLD_1_0_0.OnlineResource",
                        type: "simple",
                        href: src
                    },
                    format: "image/png"
                }];
                sldSymbolizer.value.graphic.size = {
                    TYPE_NAME: "SLD_1_0_0.ParameterValueType",
                    content: [size]
                };
            }
            return sldSymbolizer;
        },

        polygonSymbolizerToSld: function(olSymbolizer){
            var fillColor = BasiGX.util.Color.rgbaToHex(
                    olSymbolizer.getFill().getColor());
            var strokeColor = BasiGX.util.Color.rgbaToHex(
                    olSymbolizer.getStroke().getColor());
            var strokeWidth = olSymbolizer.getStroke()
                    .getWidth().toString();

            var sldSymbolizer = {
                name: {
                    namespaceURI: "http://www.opengis.net/sld",
                    localPart: "PolygonSymbolizer",
                    prefix: "sld",
                    key: "{http://www.opengis.net/sld}PolygonSymbolizer",
                    string: "{http://www.opengis.net/sld}sld:PolygonSymbolizer",
                    CLASS_NAME: "Jsonix.XML.QName"
                },
                value: {
                    TYPE_NAME: "SLD_1_0_0.PolygonSymbolizer",
                    fill: {
                        TYPE_NAME: "SLD_1_0_0.Fill",
                        cssParameter: [{
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "fill",
                            content: [fillColor]
                        }, {
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "fill-opacity",
                            content: ["1"]
                        }]
                    },
                    stroke: {
                        TYPE_NAME: "SLD_1_0_0.Stroke",
                        cssParameter: [{
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "stroke",
                            content: [strokeColor]
                        }, {
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "stroke-width",
                            content: [strokeWidth]
                        }]
                    }
                }
            };
            return sldSymbolizer;
        },

        lineSymbolizerToSld: function(olSymbolizer){
            var strokeColor = BasiGX.util.Color.rgbaToHex(
                    olSymbolizer.getStroke().getColor());
            var strokeWidth = olSymbolizer.getStroke()
                    .getWidth().toString();
            var sldSymbolizer = {
                name: {
                    namespaceURI: "http://www.opengis.net/sld",
                    localPart: "LineSymbolizer",
                    prefix: "sld",
                    key: "{http://www.opengis.net/sld}LineSymbolizer",
                    string: "{http://www.opengis.net/sld}sld:LineSymbolizer",
                    CLASS_NAME: "Jsonix.XML.QName"
                },
                value: {
                    TYPE_NAME: "SLD_1_0_0.LineSymbolizer",
                    stroke: {
                        TYPE_NAME: "SLD_1_0_0.Stroke",
                        cssParameter: [{
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "stroke",
                            content: [strokeColor]
                        }, {
                            TYPE_NAME: "SLD_1_0_0.CssParameter",
                            name: "stroke-width",
                            content: [strokeWidth]
                        }]
                    }
                }
            };
            return sldSymbolizer;
        },

        filterValuesToSldFilter: function(filterValues){
            var sldFilter = {
                TYPE_NAME: "Filter_1_0_0.FilterType",
                comparisonOps: {
                    name: {
                        namespaceURI: "http://www.opengis.net/ogc",
                        localPart: filterValues.operatorCombo,
                        prefix: "ogc",
                        key: '{http://www.opengis.net/ogc}' +
                                filterValues.operatorCombo,
                        string: '{http://www.opengis.net/ogc}ogc:' +
                                filterValues.operatorCombo,
                        CLASS_NAME: "Jsonix.XML.QName"
                    },
                    value: {
                        TYPE_NAME: "Filter_1_0_0.BinaryComparisonOpType",
                        expression: [{
                            name: {
                                namespaceURI: "http://www.opengis.net/ogc",
                                localPart: "PropertyName",
                                prefix: "ogc",
                                key: "{http://www.opengis.net/ogc}PropertyName",
                                string: "{http://www.opengis.net/ogc}" +
                                        "ogc:PropertyName",
                                CLASS_NAME: "Jsonix.XML.QName"
                            },
                            value: {
                                TYPE_NAME: "Filter_1_0_0.PropertyNameType",
                                content: [filterValues.attributeCombo]
                            }
                        }, {
                            name: {
                                namespaceURI: "http://www.opengis.net/ogc",
                                localPart: "Literal",
                                prefix: "ogc",
                                key: "{http://www.opengis.net/ogc}Literal",
                                string: "{http://www.opengis.net/ogc}" +
                                        "ogc:Literal",
                                CLASS_NAME: "Jsonix.XML.QName"
                            },
                            value: {
                                TYPE_NAME: "Filter_1_0_0.LiteralType",
                                content: [filterValues.literalTextField]
                            }
                        }]
                    }
                }
            };

            switch(filterValues.operatorCombo){
            case "PropertyIsEqualTo":
                break;
            case "PropertyIsNotEqualTo":
                break;
            case "PropertyIsBetween":
                sldFilter.comparisonOps.value = {
                    TYPE_NAME: "Filter_1_0_0.PropertyIsBetweenType",
                    expression: {
                        name: {
                            namespaceURI: "http://www.opengis.net/ogc",
                            localPart: "PropertyName",
                            prefix: "ogc",
                            key: "{http://www.opengis.net/ogc}PropertyName",
                            string: "{http://www.opengis.net/ogc}" +
                                    "ogc:PropertyName",
                            CLASS_NAME: "Jsonix.XML.QName"
                        },
                        value: {
                            TYPE_NAME: "Filter_1_0_0.PropertyNameType",
                            content: [filterValues.attributeCombo]
                        }
                    },
                    lowerBoundary: {
                        TYPE_NAME: "Filter_1_0_0.LowerBoundaryType",
                        expression: {
                            name: {
                                namespaceURI: "http://www.opengis.net/ogc",
                                localPart: "Literal",
                                prefix: "ogc",
                                key: "{http://www.opengis.net/ogc}Literal",
                                string: "{http://www.opengis.net/ogc}" +
                                        "ogc:Literal",
                                CLASS_NAME: "Jsonix.XML.QName"
                            },
                            value: {
                                TYPE_NAME: "Filter_1_0_0.LiteralType",
                                content: [filterValues.literalNumberField1
                                          .toString()]
                            }
                        }
                    },
                    upperBoundary: {
                        TYPE_NAME: "Filter_1_0_0.UpperBoundaryType",
                        expression: {
                            name: {
                                namespaceURI: "http://www.opengis.net/ogc",
                                localPart: "Literal",
                                prefix: "ogc",
                                key: "{http://www.opengis.net/ogc}Literal",
                                string: "{http://www.opengis.net/ogc}" +
                                        "ogc:Literal",
                                CLASS_NAME: "Jsonix.XML.QName"
                            },
                            value: {
                                TYPE_NAME: "Filter_1_0_0.LiteralType",
                                content: [filterValues.literalNumberField2
                                        .toString()]
                            }
                        }
                    }
                };
                break;
            case "PropertyIsLike":
                sldFilter.comparisonOps.value = {
                    TYPE_NAME: "Filter_1_0_0.PropertyIsLikeType",
                    wildCard: "*",
                    singleChar: "%",
                    escape: "!",
                    propertyName: {
                        TYPE_NAME: "Filter_1_0_0.PropertyNameType",
                        content: [filterValues.attributeCombo]
                    },
                    literal: {
                        TYPE_NAME: "Filter_1_0_0.LiteralType",
                        content: [filterValues.literalTextField]
                    }
                };
                break;
            case "PropertyIsNull":
                sldFilter.comparisonOps.value = {
                    TYPE_NAME: "Filter_1_0_0.PropertyIsNullType",
                    propertyName: {
                        TYPE_NAME: "Filter_1_0_0.PropertyNameType",
                        content: ["fid"]
                    }
                };
                break;
            case "PropertyIsLessThan":
            case "PropertyIsLessThanOrEqualTo":
            case "PropertyIsGreaterThan":
            case "PropertyIsGreaterThanOrEqualTo":
                sldFilter.comparisonOps.value.expression[1] = {
                    name: {
                        namespaceURI: "http://www.opengis.net/ogc",
                        localPart: "Literal",
                        prefix: "ogc",
                        key: "{http://www.opengis.net/ogc}Literal",
                        string: "{http://www.opengis.net/ogc}ogc:Literal",
                        CLASS_NAME: "Jsonix.XML.QName"
                    },
                    value: {
                        TYPE_NAME: "Filter_1_0_0.LiteralType",
                        content: [filterValues.literalNumberField2.toString()]
                    }
                };
                break;
            default:
                break;
            }
            return sldFilter;
        }

    }
});
