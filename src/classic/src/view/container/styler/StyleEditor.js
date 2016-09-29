Ext.define("Koala.view.container.styler.StyleEditor", {
    extend: "BasiGX.view.container.RedlineStyler",
    xtype: "k_container_styler_styleditor",

    requires: [
        'Ext.form.field.FileButton'
    ],

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
        // TODO This has to be replaced when we have multiple maps.
        var appContext = Ext.ComponentQuery.query('k-component-map')[0].appContext;
        var vectorIcons = appContext.data.merge.vectorIcons;

        var imageTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="thumb-wrap">',
                    '<div class="thumb">',
                        '<img src="{src}" height="60px" />',
                    '</div>',
                    '<span>{caption}</span>',
                '</div>',
            '</tpl>'
        );

        var onUploadChange = function(btn, event){
            var file = event.target.files[0];
            var fileReader = new FileReader();

            fileReader.readAsDataURL(file);

            fileReader.addEventListener("load", function () {
                var imageObj = {
                    src: fileReader.result,
                    caption: file.name
                }
                dataView.getStore().add(imageObj);
            }, false);
        };

        var okHandler = function(){
            var renderer = me.down('gx_renderer[name=pointRenderPreview]');
            var rec = dataView.selectionModel.getSelection()[0];
            var pictureUrl = rec.get('src');
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
            this.up('window').close();
        };

        var dataView = Ext.create('Ext.view.View', {
            cls: 'img-chooser-view',
            minWidth: 150,
            minHeight: 170,
            width: 410,
            height: 300,
            store: {
                data: vectorIcons
            },
            tpl: imageTpl,
            itemSelector: 'div.thumb-wrap',
            emptyText: 'No images available',
            listeners: {
                itemdblclick: okHandler
            }
        });

        var graphicPoolWin = Ext.create('Ext.window.Window', {
            title: me.getViewModel().get('graphicPoolWindowTitle'),
            constrained: true,
            modal: true,
            items: [dataView],
            viewModel: {
                data: {
                    okText: 'Ok',
                    cancelText: 'Abbrechen',
                    uploadText: 'Bild hochladen'
                }
            },
            bbar: [{
                bind: {
                    text: '{cancelText}'
                },
                handler: function(){
                    this.up('window').close();
                }
            },{
                bind: {
                    text: '{okText}',
                },
                handler: okHandler
            }, '->', {
                xtype: 'filebutton',
                bind: {
                    text: '{uploadText}'
                },
                listeners: {
                    change: onUploadChange
                }
            }]
        });
        graphicPoolWin.show();
    }

});
