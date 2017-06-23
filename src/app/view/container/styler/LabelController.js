Ext.define('Koala.view.container.styler.LabelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.container.styler.label',

    /**
     *
     */
    onBoxReady: function() {
        var me = this;
        var viewModel = me.getViewModel();
        var labelFieldSet = me.getView().down('fieldset[name=labelFieldSet]');
        var styleEditor = Ext.ComponentQuery.query('k_container_styler_styleditor')[0];
        var textStyle;
        var fontFamily;
        var fontStyle;
        var fontSize;
        var pointStyle;
        var lineStringStyle;
        var polygonStyle;

        styleEditor.on('pointStyleGenerated', this.updateTextStyle, this);

        if (styleEditor.getRedlinePointStyle()) {
            pointStyle = {};
            textStyle = styleEditor.getRedlinePointStyle().getText();
        } else if (styleEditor.getRedlineLineStringStyle()) {
            lineStringStyle = {};
            textStyle = styleEditor.getRedlineLineStringStyle().getText();
        } else if (styleEditor.getRedlinePolygonStyle()) {
            polygonStyle = {};
            textStyle = styleEditor.getRedlinePolygonStyle().getText();
        }

        if (textStyle && textStyle.getFont()) {
            var fontDeclaration = me.parseFont(textStyle.getFont());
            fontFamily = fontDeclaration.fontFamily;
            fontStyle = fontDeclaration.fontStyle + ', ' + fontDeclaration.fontWeight;
            fontSize = fontDeclaration.fontSize;
        } else {
            fontFamily = viewModel.get('fontFamilyValue');
            fontStyle = viewModel.get('fontStyleValue');
            fontSize = viewModel.get('fontSizeValue');
        }

        var fill = textStyle && textStyle.getFill() && textStyle.getFill().getColor() !== '#333' ?
            BasiGX.util.Color.rgbaToHex8(textStyle.getFill().getColor()) :
            viewModel.get('fillValue');
        var stroke = textStyle && textStyle.getStroke()?
            BasiGX.util.Color.rgbaToHex8(textStyle.getStroke().getColor()) :
            viewModel.get('strokeValue');
        var offsetX = textStyle && textStyle.getOffsetX() ?
            textStyle.getOffsetX() :
            viewModel.get('offsetXValue');
        var offsetY = textStyle && textStyle.getOffsetY() ?
            textStyle.getOffsetY() :
            viewModel.get('offsetYValue');
        var rotation = textStyle && textStyle.getRotation() ?
            textStyle.getRotation() * (180 / Math.PI) :
            viewModel.get('rotationValue') * (180 / Math.PI);
        var text = textStyle && textStyle.getText() ?
            textStyle.getText() :
            viewModel.get('textValue');

        viewModel.set('fillValue', fill);
        viewModel.set('fontFamilyValue', fontFamily);
        viewModel.set('fontStyleValue', fontStyle);
        viewModel.set('fontSizeValue', fontSize);
        viewModel.set('offsetXValue', offsetX);
        viewModel.set('offsetYValue', offsetY);
        viewModel.set('rotationValue', rotation);
        viewModel.set('strokeValue', stroke);
        viewModel.set('textValue', text);

        if (textStyle && textStyle.getText()) {
            labelFieldSet.expand();
        }

        if (!labelFieldSet.collapsed) {
            styleEditor.updateStyle(pointStyle, lineStringStyle, polygonStyle,
                me.updateTextStyle.bind(me));
        }
    },

    /**
     *
     */
    onFieldSetToggle: function(fs) {
        var me = this;
        var styleEditor = Ext.ComponentQuery.query('k_container_styler_styleditor')[0];
        var pointStyle;
        var lineStringStyle;
        var polygonStyle;

        if (styleEditor.getRedlinePointStyle()) {
            pointStyle = {};
        } else if (styleEditor.getRedlineLineStringStyle()) {
            lineStringStyle = {};
        } else if (styleEditor.getRedlinePolygonStyle()) {
            polygonStyle = {};
        }

        if (fs.collapsed) {
            styleEditor.updateStyle(pointStyle, lineStringStyle, polygonStyle,
                me.unsetTextStyle.bind(me));
        } else {
            styleEditor.updateStyle(pointStyle, lineStringStyle, polygonStyle,
                me.updateTextStyle.bind(me));
        }
    },

    /**
     *
     */
    onLabelPropChange: function(comp) {
        var me = this;
        var view = me.getView();
        var viewModel = me.getViewModel();
        var styleEditor = Ext.ComponentQuery.query('k_container_styler_styleditor')[0];
        var pointStyle;
        var lineStringStyle;
        var polygonStyle;

        if (styleEditor.getRedlinePointStyle()) {
            pointStyle = {};
        } else if (styleEditor.getRedlineLineStringStyle()) {
            lineStringStyle = {};
        } else if (styleEditor.getRedlinePolygonStyle()) {
            polygonStyle = {};
        }

        if (comp.name === 'textfill') {
            viewModel.set('fillValue', comp.getValue());
        }

        if (comp.name === 'textstroke') {
            viewModel.set('strokeValue', comp.getValue());
        }

        if (view.rendered) {
            styleEditor.updateStyle(pointStyle, lineStringStyle, polygonStyle,
                me.updateTextStyle.bind(me));
        }
    },

    /**
     *
     */
    unsetTextStyle: function(currentOlStyle) {
        var currentTextStyle = currentOlStyle.getText();

        currentTextStyle.setFill(undefined);
        currentTextStyle.setFont(undefined);
        currentTextStyle.setOffsetX(undefined);
        currentTextStyle.setOffsetY(undefined);
        currentTextStyle.setRotation(undefined);
        currentTextStyle.setStroke(undefined);
        currentTextStyle.setText(undefined);

        return currentOlStyle;
    },

    /**
     *
     */
    updateTextStyle: function(currentOlStyle) {
        var me = this;
        var viewModel = me.getViewModel();
        var currentTextStyle = currentOlStyle.getText();
        var textStyle = viewModel.getData();

        var fontTpl = '{0} {1} {2}px {3}';
        var font = Ext.String.format(fontTpl,
            textStyle.fontStyleValue.split(',')[0],
            textStyle.fontStyleValue.split(',')[1],
            textStyle.fontSizeValue,
            textStyle.fontFamilyValue
        );

        var fill = new ol.style.Fill({
            color: BasiGX.util.Color.hex8ToRgba(textStyle.fillValue)
        });

        var stroke = new ol.style.Stroke({
            color: BasiGX.util.Color.hex8ToRgba(textStyle.strokeValue)
        });

        var text = textStyle.textValue;

        var offsetX = Ext.isEmpty(textStyle.offsetXValue) ?
            currentTextStyle.getOffsetX() :
            textStyle.offsetXValue;
        var offsetY = Ext.isEmpty(textStyle.offsetYValue) ?
            currentTextStyle.getOffsetY() :
            textStyle.offsetYValue;
        var rotation = Ext.isEmpty(textStyle.rotationValue) ?
            currentTextStyle.getRotation() * (Math.PI / 180) :
            textStyle.rotationValue * (Math.PI / 180);

        currentTextStyle.setFill(fill);
        currentTextStyle.setFont(font);
        currentTextStyle.setOffsetX(offsetX);
        currentTextStyle.setOffsetY(offsetY);
        currentTextStyle.setRotation(rotation);
        currentTextStyle.setStroke(stroke);
        currentTextStyle.setText(text);

        return currentOlStyle;
    },

    /**
     * [parseFont description]
     * http://stackoverflow.com/questions/5618676/how-to-parse-css-font-shorthand-format
     * Returns a CSSStyleDeclaration object
     * @param  {[type]} font [description]
     * @return {[type]}      [description]
     */
    parseFont: function(fontCss) {
        var el = document.createElement('span');
        el.setAttribute('style', 'font: ' + fontCss);
        var stycleDeclaration = el.style;

        return {
            'fontStyle': stycleDeclaration.fontStyle,
            'fontWeight': stycleDeclaration.fontWeight,
            'fontSize': stycleDeclaration.fontSize.substring(0, stycleDeclaration.fontSize.length - 2),
            'fontFamily': stycleDeclaration.fontFamily
        };
    }

});
