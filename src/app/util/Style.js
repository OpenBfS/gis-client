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
        symbolTypeFromVectorLayer: function(layer) {
            if (!layer || !(layer instanceof ol.layer.Vector)) {
                return;
            }
            var geomType = layer.getSource().getFeatures()[0].getGeometry().getType();
            // The GeoExt FeatureRenderer only knows non-multi geometries and
            // handles "LineString" as "Line"
            return geomType.replace("Multi", "").replace("String", "");
        },

        /**
         *
         */
        getAttributekeysFromVectorLayer: function(layer) {
            if (!layer || !(layer instanceof ol.layer.Vector)) {
                return;
            }
            return layer.getSource().getFeatures()[0].getKeys();
        },

        /**
         *
         */
        applyKoalaStyleToLayer: function(style, layer) {
            var me = this;
            var rules = style.rules();

            // Save a reference to the configured olStyleText text placeholder,
            // otherwise it would be overwritten in the resolveTextStylePlaceholder()
            // method
            var placeHolder = me.getTextStylePlaceholder(rules, new ol.Feature());

            var styleFunction = function(feature) {
                var olStyles = [];

                rules.each(function(rule, idx) {
                    var scaleDenom = rule.getScaleDenominator();
                    var symbolizer = rule.getSymbolizer();
                    var filter = rule.getFilter();
                    var olStyle = symbolizer.get('olStyle');

                    if (me.evaluateFilter(filter, feature) && me.evaluateScaleDenom(scaleDenom)) {
                        me.resolveTextStylePlaceholder(olStyle, feature, placeHolder[idx]);
                        olStyles.push(olStyle);
                    }
                });

                return olStyles;
            };

            layer.setStyle(styleFunction);
        },

        /**
         *
         */
        getTextStylePlaceholder: function(rules) {
            var textStylePlaceholder = [];

            rules.each(function(rule) {
                var symbolizer = rule.getSymbolizer();
                var olStyle = symbolizer.get('olStyle');

                var olTextStyle;

                if (olStyle && olStyle.getText) {
                    olTextStyle = olStyle.getText();
                }
                if (!olTextStyle) {
                    olTextStyle = new ol.style.Text();
                }

                var olText = olTextStyle.getText();
                textStylePlaceholder.push(olText);
            });

            return textStylePlaceholder;
        },

        /**
         *
         */
        resolveTextStylePlaceholder: function(olStyle, feature, placeHolder) {
            if (!olStyle.getText() instanceof ol.style.Text) {
                return false;
            }

            if (Ext.isEmpty(placeHolder)) {
                return false;
            }

            var olStyleText = olStyle.getText();
            var labelTextTpl = placeHolder;
            // Find any character between two square brackets
            var placeHolderPrefix = '\\[\\[';
            var placeHolderSuffix = '\\]\\]';
            var regExp = new RegExp(placeHolderPrefix + '(.*?)' + placeHolderSuffix, 'g');
            var regExpRes = labelTextTpl.match(regExp);

            // If we have a regex result, it means we found a placeholder
            // in the template and we have to replace the placeholder with its
            // appropriate value
            if (regExpRes) {
                // Iterate over all regex match results and find the proper
                // attribute for the given placeholder, finally set the desired
                // value to the hover field text
                Ext.each(regExpRes, function(res) {
                    // Remove the pre- and suffix
                    var placeHolderName = res.slice(2, res.length - 2);
                    labelTextTpl = labelTextTpl.replace(res, feature.get(placeHolderName));
                });
            }

            olStyleText.setText(labelTextTpl);
        },

        /**
         * evaluateScaleDenom
         * @param  {object} scaleDenom The scaleDenominator object to evaluate
         *                             against.
         * @return {boolean}           The result of the evaluation.
         */
        evaluateScaleDenom: function(scaleDenom) {
            // Only evaluate the scale denominator if a scale is given
            if (!scaleDenom || !scaleDenom.get('operator')) {
                return true;
            }

            var mapComponent = Ext.ComponentQuery.query('basigx-component-map');

            // Return if we couldn't find the mapComponent
            if (!mapComponent) {
                return false;
            }

            var map = mapComponent[0].map;
            var currentMapScale = BasiGX.util.Map.getScale(map);
            var numberOperandA = scaleDenom.get('number1');
            var numberOperandB = scaleDenom.get('number2');
            var type = scaleDenom.get('operator');
            var result;

            switch (type) {
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
            if (!filter || !filter.get('operator')) {
                return true;
            }

            // Return if no feature is given
            if (!(feature instanceof ol.Feature)) {
                return false;
            }

            var field = filter.get('attribute');
            var candidate = feature.get(field);
            var numberOperandA = filter.get('number1');
            var numberOperandB = filter.get('number2');
            var type = filter.get('operator');
            var textOperand = filter.get('text');
            var result;

            // Return if the feature hasn't set the attribute field to evaluate
            // against
            if (!candidate && type !== 'PropertyIsNull') {
                return false;
            }

            switch (type) {
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
                    result = !!candidate;
                    break;
                default:
                    result = false;
            }
            return result;
        }
    }
});
