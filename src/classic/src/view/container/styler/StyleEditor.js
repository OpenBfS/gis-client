Ext.define("Koala.view.container.styler.StyleEditor", {
    extend: "BasiGX.view.container.RedlineStyler",
    xtype: "k_container_styler_styleditor",

    /**
     * @overwrite
     */
    updateStyle: function(pointStyle, lineStyle, polygonStyle) {
        var redLineStyler = this;
        var oldStyle;
        var style;
        var renderer;

        if (pointStyle) {
            oldStyle = redLineStyler.getRedlinePointStyle();
            renderer = redLineStyler.down(
                    'gx_renderer[name=pointRenderPreview]');
            style = redLineStyler.generatePointStyle(oldStyle, pointStyle);
            redLineStyler.setRedlinePointStyle(style);
        } else if (lineStyle) {
            oldStyle = redLineStyler.getRedlineLineStringStyle();
            renderer = redLineStyler.down(
                    'gx_renderer[name=lineRenderPreview]');
            style = redLineStyler.generateLineStringStyle(oldStyle, lineStyle);
            redLineStyler.setRedlineLineStringStyle(style);
        } else {
            oldStyle = redLineStyler.getRedlinePolygonStyle();
            renderer = redLineStyler.down(
                    'gx_renderer[name=polygonRenderPreview]');
            style = redLineStyler.generatePolygonStyle(oldStyle, polygonStyle);
            redLineStyler.setRedlinePolygonStyle(style);
        }

        // refresh the gx_renderer
        if (renderer) {
            renderer.setSymbolizers(style);
        }
    },

    /**
     * @overwrite
     */
    changeIconStyle: function(imageProps) {
        var redLineStyler = this;
        var offsetX = imageProps[0];
        var offsetY = imageProps[1];
        var scale = imageProps[2];

        var renderer = redLineStyler.down(
                'gx_renderer[name=pointRenderPreview]');
        var oldStyle = redLineStyler.getRedlinePointStyle().getImage();
        // just set a new style if an icon style has already been set
        if (!(oldStyle instanceof ol.style.Icon)) {
            return;
        }
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                scale: scale,
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                anchor: [
                    offsetX,
                    offsetY
                ],
                src: oldStyle.getSrc()
            })
        });
        renderer.setSymbolizers(iconStyle);
        redLineStyler.setRedlinePointStyle(iconStyle);
    },

    /**
    * @overwrite
    */
    onChooseGraphicClick: function() {
        var me = this;

        var okClickCallbackFn = function(pictureRec) {
            var renderer = me.down('gx_renderer[name=pointRenderPreview]');
            var pictureUrl = BasiGX.util.Url.getWebProjectBaseUrl() +
                me.getBackendUrls().pictureSrc.url +
                pictureRec.get('id');
            var imageValues = me.getImageAttributes();
            var imageStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [
                        imageValues[0],
                        imageValues[1]
                    ],
                    scale: imageValues[2],
                    src: pictureUrl
                })
            });
            me.setRedlinePointStyle(imageStyle);
            renderer.setSymbolizers(imageStyle);
        };

        var deleteClickCallbackFn = function() {
            Ext.toast(
                me.getViewModel().get('pointGrapicDeletedSuccessMsgText'),
                me.getViewModel().get('pointGrapicDeletedSuccessMsgTitle'),
                't'
            );
        };

        var graphicPool = Ext.create('BasiGX.view.panel.GraphicPool', {
            backendUrls: me.getBackendUrls(),
            okClickCallbackFn: okClickCallbackFn,
            deleteClickCallbackFn: deleteClickCallbackFn,
            useCsrfToken: true
        });

        var graphicPoolWin = Ext.create('Ext.window.Window', {
            title: me.getViewModel().get('graphicPoolWindowTitle'),
            constrained: true,
            modal: true,
            items: [graphicPool]
        });
        graphicPoolWin.show();
    }

});
