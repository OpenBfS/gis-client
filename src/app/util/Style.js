Ext.define('Koala.util.Style', {
    statics: {

        isLogicalFilter: function(filter) {
            return 'logicOps' in filter;
        },

        isSpatialFilter: function(filter) {
            return 'spatialOps' in filter;
        },

        isComparisonFilter: function(filter) {
            return 'comparisonOps' in filter;
        },

        /**
         * Returns the geometryType of the first feature of an ol.layer.Vector.
         */
        symbolTypeFromVectorLayer: function(layer){
            if(!layer || !(layer instanceof ol.layer.Vector)){
                return;
            }
            return layer.getSource().getFeatures()[0].getGeometry().getType();
        },

        /**
         *
         */
        getAttributeKeysFromVetorLayer: function(layer){
            if(!layer || !(layer instanceof ol.layer.Vector)){
                return;
            }
            return layer.getSource().getFeatures()[0].getKeys();
        },

        /**
         *
         */
        applyKoalaStyleToLayer: function(style, layer) {
            var me = this;

            var rules = style.getAssociatedData().rules;

            var styleFunction = function(feature) {
                var olStyles = [];
                Ext.each(rules, function(rule) {
                    var scaleDenom = rule.scaleDenominator;
                    var symbolizer = rule.symbolizer;
                    var filter = rule.filter;
                    var olStyle = symbolizer.olStyle;

                    if (me.evaluateFilter(filter, feature) &&
                            me.evaluateScaleDenom(scaleDenom)) {
                        olStyles.push(olStyle);
                    }
                });
                return olStyles;
            };

            layer.setStyle(styleFunction);
        },

        /**
         * evaluateScaleDenom
         * @param  {object} scaleDenom The scaleDenominator object to evaluate
         *                             against.
         * @return {boolean}           The result of the evaluation.
         */
        evaluateScaleDenom: function(scaleDenom) {
            // Only evaluate the scale denominator if a scale is given
            if (!scaleDenom.operator) {
                return true;
            }

            var mapComponent = Ext.ComponentQuery.query('basigx-component-map');

            // Return if we couldn't find the mapComponent
            if (!mapComponent) {
                return false;
            }

            var map = mapComponent[0].map;
            var currentMapScale = BasiGX.util.Map.getScale(map);
            var numberOperandA = scaleDenom.number1;
            var numberOperandB = scaleDenom.number2;
            var type = scaleDenom.operator;
            var result;

            switch(type) {
                case 'ScaleIsLessThan':
                    result = currentMapScale < (numberOperandA || numberOperandB);
                    break;
                case 'ScaleIsLessThanOrEqualTo':
                    result = currentMapScale <= (numberOperandA || numberOperandB);
                    break;
                case 'ScaleIsBetween':
                    result = (currentMapScale >= numberOperandA) &&
                            (currentMapScale <= numberOperandB);
                    break;
                case 'ScaleIsGreaterThan':
                    result = currentMapScale > (numberOperandA || numberOperandB);
                    break;
                case 'ScaleIsGreaterThanOrEqualTo':
                    result = currentMapScale >= (numberOperandA || numberOperandB);
                    break;
                default:
                    result = false;
            }

            return result;
        },

        /**
         * [evaluateFilter description]
         * @param  {object} filter  The filter object to evaluate against.
         * @param  {object} feature The ol.Feature to evaluate. Usually this
         *                          feature will be given by the ol.StyleFunction.
         *
         * @return {boolean}        The result of the evaluation.
         */
        evaluateFilter: function(filter, feature) {
            // Only evaluate the filter if a filter is given
            if (!filter.operator) {
                return true;
            }

            // Return if no feature is given
            if (!feature || !feature instanceof ol.Feature) {
                return false;
            }

            var field = filter.attribute;
            var candidate = feature.get(field);

            // Return if the feature hasn't set the attribute field to evaluate
            // against
            if (!candidate) {
                return false;
            }

            var numberOperandA = filter.number1;
            var numberOperandB = filter.number2;
            var type = filter.operator;
            var textOperand = filter.text;
            var result;

            switch(type) {
                case 'PropertyIsEqualTo':
                    result = Koala.util.String.coerce(candidate) ===
                            Koala.util.String.coerce(textOperand);
                    break;
                case 'PropertyIsNotEqualTo':
                    result = Koala.util.String.coerce(candidate) !==
                            Koala.util.String.coerce(textOperand);
                    break;
                case 'PropertyIsLessThan':
                    result = candidate < (numberOperandA || numberOperandB);
                    break;
                case 'PropertyIsLessThanOrEqualTo':
                    result = candidate <= (numberOperandA || numberOperandB);
                    break;
                case 'PropertyIsBetween':
                    result = (candidate >= numberOperandA) &&
                            (candidate <= numberOperandB);
                    break;
                case 'PropertyIsGreaterThan':
                    result = candidate > (numberOperandA || numberOperandB);
                    break;
                case 'PropertyIsGreaterThanOrEqualTo':
                    result = candidate >= (numberOperandA || numberOperandB);
                    break;
                case 'PropertyIsLike':
                    var regExp = new RegExp(textOperand, 'gi');
                    result = regExp.test(candidate);
                    break;
                case 'PropertyIsNull':
                    result = candidate === null;
                    break;
                default:
                    result = false;
            }
            return result;
        }
    }
});
