/**
 * @class Oskari.mapframework.bundle.coordinatetool.plugin.CoordinateToolPlugin
 * Provides a coordinate display for map
 */
Oskari.clazz.define('Oskari.mapframework.bundle.coordinatetool.plugin.CoordinateToolPlugin',
    /**
     * @method create called automatically on construction
     * @static
     * @param {Object} config
     *      JSON config with params needed to run the plugin
     */
    function (instance, config, locale, mapmodule, sandbox) {
        this._locale = locale;
        this._config = config;
        this._mapmodule = mapmodule;
        this._sandbox = sandbox;
        this._instance = instance;
        this._clazz =
            'Oskari.mapframework.bundle.coordinatetool.plugin.CoordinateToolPlugin';
        this._defaultLocation = 'top right';
        this._index = 6;
        this._name = 'CoordinateToolPlugin';
        this._toolOpen = false;
        this._showMouseCoordinates = false;
        this._popup = null;
        this._latInput = null;
        this._lonInput = null;
        this._dialog = null;
        this._coordinatesFromServer = null;
        this._templates = {
            coordinatetool: jQuery('<div class="mapplugin coordinatetool"></div>'),
            popup: jQuery(
                '<div class="coordinatetool__popup divmanazerpopup">'+
                '   <div>'+
                '       <div>'+
                '           <h3 class="popupHeader"></h3>'+
                '       </div>'+
                '       <div class="coordinatetool__close icon-close icon-close:hover"></div>'+
                '   </div>'+
                '   <div class="content"></div>'+
                '</div>'),
            popupContent: jQuery(
                '<div>'+
                '   <div class="coordinatetool__popup__content"></div>' +
                '   <div class="srs"></div>' +
                '   <div class="margintop">'+
                '       <div class="coordinate-label floatleft lat-label"></div>'+
                '       <div class="floatleft"><input type="text" class="lat-input"></input></div>'+
                '       <div class="clear"></div>'+
                '   </div>' +
                '   <div class="margintop">'+
                '       <div class="coordinate-label floatleft lon-label"></div>'+
                '       <div class="floatleft"><input type="text" class="lon-input"></input></div>'+
                '       <div class="clear"></div>'+
                '   </div>' +
                '   <div class="margintop"><input type="checkbox" id="mousecoordinates"></input><label class="mousecoordinates-label" for="mousecoordinates"></label></div>' +
                '   <div class="actions">'+
                '       <input class="coordinate-tool-centermap oskari-button oskari-formcomponent primary primary" type="submit" style="margin: 0px !important;">'+
                '       <input class="coordinate-tool-addmarker oskari-button oskari-formcomponent primary primary" type="submit" style="margin: 0px !important;">'+
                '   </div>' +
                '   <div class="clear"></div>'+
                '   <div class="projectionchange-placeholder margintop"></div>'+
                '</div>'),
            projectionSelect: jQuery(
                '<div class="coordinatetool-divider"></div>'+
                '<div class="coordinatetool-projection-change-header"></div>'+
                '<div class="margintop">'+
                '   <div class="projection-label coordinate-label floatleft"></div>'+
                '   <div class="floatleft">'+
                '       <select id="projection" class="lon-input projection-select"></select>'+
                '   </div>'+
                '</div>'+
                '<div class="clear"/>'+
                '<div class="coordinate-tool-projection-change-confirmation margintop" style="display:none;">'+
                '   <div class="projection-change-confirmation-message"></div>'+
                '   <div>'+
                '       <div class="floatright">'+
                '           <button class="projection-change-button-cancel oskari-button oskari-formcomponent"></button>'+
                '           <button class="projection-change-button-ok oskari-button oskari-formcomponent primary"></button>'+
                '       </div>'+
                '   </div>'+
                '</div>'
            ),
            projectionTransformSelect: jQuery(
                '<div class="coordinatetool-divider"></div>'+
                '<div class="coordinatetool-projection-change-header"></div>'+
                '<div>'+
                '    <select id="projection" class="lon-input projection-select"></select>'+
                '</div>'+
                '<div class="clear"/>'+
                '<div class="coordinate-tool-projection-change-confirmation margintop" style="display:none;">'+
                '   <div class="projection-change-confirmation-message"></div>'+
                '</div>'
            ),
            projectionSelectOption: jQuery('<option></option>')
        };
    }, {
        /**
         * Get popup-
         * @method @private _getPopup
         *
         * @return {Object} jQuery popup object
         */
        _getPopup: function(){
            var me = this,
                popup = me._popup || jQuery('.coordinatetool__popup');
            return popup;
        },

        /**
         * Show popup.
         * @method @private _showPopup
         */
        _showPopup: function(){
            var me = this,
                placeHolder = me.getElement(),
                pos = placeHolder.offset(),
                eWidth = placeHolder.outerWidth(),
                eHeight = placeHolder.outerHeight(),
                popup = me._getPopup(),
                mWidth = popup.outerWidth(),
                mHeight = popup.outerHeight(),
                right = (eWidth + 50) + 'px',
                top = ((pos.top + eHeight/2)- mHeight/2) + 'px';

            popup.css({
                position: 'absolute',
                right: right,
                top: top,
                left: 'auto'
            });
            popup.fadeIn();
            //set the same width for the projection change select as the text inputs.
            if (me._projectionSelect) {
                var inputWidth = popup.find('.lon-input').outerWidth();
                if (inputWidth > 0) {
                    me._projectionSelect.css('width', inputWidth);
                }
            }

        },

        /**
         * Hide popup.
         * @method  @private _hidePopup
         */
        _hidePopup: function(){
            var me = this,
                popup = me._getPopup();
            popup.hide();
        },

        /**
         * Toggle tool state.
         * @method @private _toggleToolState
         */
        _toggleToolState: function(){
            var me = this,
                el = me.getElement();

            if(me._toolOpen) {
                el.removeClass('active');
                me._toolOpen = false;
                me._hidePopup();
            } else {
                el.addClass('active');
                me._toolOpen = true;
                me._showPopup();
            }
        },

        /**
         * Seet inputs disabled
         * @method  @private _setDisabledInputs
         *
         * @param {Boolean} disabled  disabled or not
         * @param {Boolean} clearText clear input values
         */
        _setDisabledInputs: function(disabled, clearText){
            var me = this;
            me._latInput.prop('disabled', disabled);
            me._lonInput.prop('disabled', disabled);
            if(clearText){
                me._latInput.val('');
                me._lonInput.val('');
            }
        },

        /**
         * Center map to selected coordinates.
         * @method  @private _centerMapToSelectedCoordinates
         *
         * @return {[type]} [description]
         */
        _centerMapToSelectedCoordinates: function(){
            var me = this,
                data = {
                    'lonlat': {
                        'lat': me._latInput.val(),
                        'lon': me._lonInput.val()
                    }
                },
                loc = me._locale;
                data = me.transformCoordinates(data, me._projectionSelect.val(), me.getMap().getProjection());
            if(this.getMapModule().isValidLonLat(data.lonlat.lon, data.lonlat.lat)) {
                var moveReqBuilder = me._sandbox.getRequestBuilder('MapMoveRequest');
                var moveReq = moveReqBuilder(data.lonlat.lon, data.lonlat.lat);
                me._sandbox.request(this, moveReq);
            } else {
                if(!me._dialog) {
                    var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
                    me._dialog = dialog;
                }
                var btn = me._dialog.createCloseButton(loc.checkValuesDialog.button);
                btn.addClass('primary');
                me._dialog.show(loc.checkValuesDialog.title, loc.checkValuesDialog.message, [btn]);
            }
        },
        /**
         * Center map to selected coordinates.
         * @method  @private _addMarker
         *
         * @return {[type]} [description]
         */
        _addMarker: function(){
            var me = this,
                data = {
                    'lonlat': {
                        'lat': me._latInput.val(),
                        'lon': me._lonInput.val()
                    }
                },
                reqBuilder = me._sandbox.getRequestBuilder('MapModulePlugin.AddMarkerRequest');
                //transform first
                data = me.transformCoordinates(data, me._projectionSelect.val(), me.getMap().getProjection());
                if(reqBuilder) {
                    var msg = me._latInput.val() + ', ' + me._lonInput.val() + ' (' + jQuery("#projection option:selected" ).text() + ')';
                    var marker = {
                        x: data.lonlat.lon,
                        y: data.lonlat.lat,
                        msg: msg
                    };
                    me._sandbox.request(this, reqBuilder(marker));
                }
        },
        /**
         * Creates UI for coordinate display and places it on the maps
         * div where this plugin registered.
         * @private @method _createControlElement
         *
         * @return {jQuery}
         */
        _createControlElement: function () {
            var me = this,
                loc = me._locale,
                crs = me.getMapModule().getProjection(),
                el = me._templates.coordinatetool.clone(),
                popup = me._templates.popup.clone(),
                popupContent = me._templates.popupContent.clone(),
                crs = me.getMapModule().getProjection(),
                crsDefaultText = loc.crs.default,
                crsText = loc.crs[crs] || crsDefaultText.replace('{crs}', crs);

            // Set locales
            var submit = popup.find('.coordinate-tool-centermap');
            popupContent.find('.coordinate-tool-centermap').val(loc.popup.searchButton);
            popupContent.find('.coordinate-tool-addmarker').val(loc.popup.addMarkerButton);
            popup.find('.popupHeader').html(loc.popup.title);
            popupContent.find('.coordinatetool__popup__content').html(loc.popup.info);
            //HUOM!!
            //popupContent.find('.srs').html(crsText);
            popupContent.find('.lat-label').html(loc.compass.lat);
            popupContent.find('.lon-label').html(loc.compass.lon);
            popupContent.find('.mousecoordinates-label').html(loc.popup.showMouseCoordinates);
            popup.find('.icon-close').attr('title', loc.tooltip.close);
            el.attr('title', loc.tooltip.tool);

            // Bind event listeners
            // XY icon click
            el.unbind('click');
            el.bind('click', function(event){
                me._toggleToolState();
                event.stopPropagation();
            });

            // tool popup close icon click
            popup.find('.icon-close').unbind('click');
            popup.find('.icon-close').bind('click', function(){
                me._toggleToolState();
            });
            popup.find('.content').html(popupContent);

            // showmousecoordinates checkbox change
            popup.find('#mousecoordinates').unbind('change');
            popup.find('#mousecoordinates').bind('change', function(){
                me._showMouseCoordinates = jQuery(this).prop('checked');
                me._setDisabledInputs(me._showMouseCoordinates, false);
            });

            // search button click
            popup.find('.coordinate-tool-centermap').unbind('click');
            popup.find('.coordinate-tool-centermap').bind('click', function(){
                me._centerMapToSelectedCoordinates();
            });
            popup.find('.coordinate-tool-addmarker').unbind('click');
            popup.find('.coordinate-tool-addmarker').bind('click', function(){
                me._addMarker();
            });

            // Set element on variables for later use
            me._popup = popup;
            me._popupContent = popupContent;
            me._latInput = popupContent.find('.lat-input');
            me._lonInput = popupContent.find('.lon-input');

            if (me._config && _.isArray(me._config.supportedProjections)) {
                me._initCoordinatesTransformChange();
            }
            else if (me._config && typeof me._config.supportedProjections === 'object') {
                me._initProjectionChange();
            }

            jQuery(me.getMapModule().getMapEl()).append(popup);

            me._changeToolStyle(null, el);
            return el;
        },
        _initProjectionChange: function() {
            var me = this,
                keys = _.keys(me._config.supportedProjections);
            if (keys && keys.length > 1) {
                me._popup.find('.projectionchange-placeholder').append(me._templates.projectionSelect.clone());
                me._popup.find('.coordinatetool-projection-change-header').html(me._locale.projectionChange.header);
                me._popup.find('.projection-label').html(me._locale.projectionChange.projection);
                me._popup.find('.projection-change-confirmation-message').html(me._locale.projectionChange.confirmationMessage);
                me._popup.find('.projection-change-button-cancel').html(me._locale.projectionChange.buttons.cancel);
                me._popup.find('.projection-change-button-ok').html(me._locale.projectionChange.buttons.ok);

                me._projectionSelect =  me._popup.find('.projection-select')
                me._populateProjectionSelect(me._projectionSelect);
                me._projectionSelect.on('change', function(event) {
                    me._toggleProjectionSelectionConfirmation(true);
                });

                me._popup.find('.projection-change-button-ok').unbind('click');
                me._popup.find('.projection-change-button-ok').bind('click', function() {
                    me._changeProjection(me._projectionSelect.val());
                });

                me._popup.find('.projection-change-button-cancel').unbind('click');
                me._popup.find('.projection-change-button-cancel').bind('click', function() {
                    me._toggleProjectionSelectionConfirmation(false);
                });

                //set default value
                me._resetProjectionSelect();
            }
        },
        _initCoordinatesTransformChange: function() {
            var me = this,
                keys = _.keys(me._config.supportedProjections);
            if (keys && keys.length > 1) {
                me._popupContent.find('.srs').append(me._templates.projectionTransformSelect.clone());
                me._popupContent.find('.coordinatetool-projection-change-header').html(me._locale.coordinatesTransform.header);
                me._projectionSelect =  me._popup.find('.projection-select');
                me._populateCoordinatesTransformSelect(me._projectionSelect);
                //if(!me._projectionSelect) {
                    //me._previousProjection = this.getMapModule().getProjection();
                //}
                me._projectionSelect.on('change', function(event) {
                   me.refresh();
                   //me._previousProjection = me._projectionSelect.val();
                });

                //set default value
                //me._resetProjectionSelect();
            }
        },
        /**
         * Generates the options for the projection change select based on config, or hides control if no options
         * @method @private _populateProjectionSelect
         * @param {Object} popupContent
         */
        _populateProjectionSelect: function(select) {
            var me = this,
                keys = _.keys(me._config.supportedProjections).sort();
            _.each(keys, function(key) {
                var option = me._templates.projectionSelectOption.clone();
                option.val(me._config.supportedProjections[key]);
                option.html(key);
                select.append(option);
            });
        },
        /**
         * Generates the options for the projection change select based on config, or hides control if no options
         * @method @private _populateCoordinatesTransformSelect
         * @param {Object} popupContent
         */
         _populateCoordinatesTransformSelect: function(select) {
            var me = this,
               projections = me._config.supportedProjections;
            _.each(projections, function(key) {
                var option = me._templates.projectionSelectOption.clone();
                option.val(key);
                if(me._locale.coordinatesTransform.projections[key]) {
                   option.html(me._locale.coordinatesTransform.projections[key]);
                } else {
                    option.html(key);
                }
                select.append(option);
            });
         },
        /**
         * Toggles the projections change confirmation panel
         * @method @private _toggleProjectionSelectionConfirmation
         */
        _toggleProjectionSelectionConfirmation: function(display) {
            var me = this,
                cssDisplay = display ? "block" : "none";
            this._popup.find('.coordinate-tool-projection-change-confirmation').css('display', cssDisplay);
            if (!display) {
                me._resetProjectionSelect()
            }
        },
        /**
         * Resets the projection select to current map projection
         * @method @private _resetProjectionSelect
         */
        _resetProjectionSelect: function() {
            var me = this,
            currentProjection = me._mapModule.getProjection();

            //select the option with projection text
            jQuery(this._projectionSelect).find('option').filter(function() {
                return jQuery(this).text() === currentProjection;
            }).prop('selected', true);
        },
        /**
         * Loads the view with the uuid corresponding to the selected projection
         * @param {String} uuid uuid of the view to load
         * @method @private _changeProjection
         */
        _changeProjection: function(uuid) {
            if (!uuid) {
                return;
            }
            var me = this,
                url = window.location.origin;
            if (window.location.pathname && window.location.pathname.length) {
                url += window.location.pathname;
            }
            url += "?uuid="+uuid+"&noSavedState=true";

            window.location.href = url;
        },
        /**
         * Update lon and lat values to inputs
         * @method  @private _updateLonLat
         * @param  {Object} data lon and lat object {lonlat: { lat: 0, lon: 0}}
         * @return {[type]}      [description]
         */
        _updateLonLat: function(data){
            var me = this,
                conf = me._config,
                roundToDecimals = 0;

            if(conf && conf.roundToDecimals) {
                roundToDecimals = conf.roundToDecimals;
            }

            if (me._latInput && me._lonInput) {
                if(conf && _.isArray(conf.supportedProjections) && me._projectionSelect.val() !== me.getMap().getProjection() && !me._coordinatesFromServer) {
                     me._latInput.val("~" + data.lonlat.lat.toFixed(roundToDecimals));
                     me._lonInput.val("~" + data.lonlat.lon.toFixed(roundToDecimals));
                } else {
                    me._latInput.val(data.lonlat.lat.toFixed(roundToDecimals));
                    me._lonInput.val(data.lonlat.lon.toFixed(roundToDecimals));
                    me._coordinatesFromServer = false;
                }
            }
        },
        /**
         * Updates the given coordinates to the UI
         * @method @public refresh
         *
         * @param {Object} data contains lat/lon information to show on UI
         */
        refresh: function (data) {
            var me = this,
                conf = me._config;
            if (!data || !data.lonlat) {
                // update with map coordinates if coordinates not given
                var map = me.getSandbox().getMap();
                data = {
                    'lonlat': {
                        'lat': parseFloat(map.getY()),
                        'lon': parseFloat(map.getX())
                    }
                };
            }
            if(this._config && _.isArray(this._config.supportedProjections)) {
                data = me.transformCoordinates(data, me.getMap().getProjection(), me._projectionSelect.val());
            }
            me._updateLonLat(data);

            // Change the style if in the conf
            if (conf && conf.toolStyle) {
                me._changeToolStyle(conf.toolStyle, me.getElement());
            }
        },
        transformCoordinates: function(data, srs, targetSRS) {
            var dataFront = _.clone(data),
                dataServer = _.clone(data);
            if(this._config && _.isArray(this._config.supportedProjections)) {
                dataFront.lonlat = this._mapModule.transformCoordinates(dataFront.lonlat, srs, targetSRS);
                this.getTransformedCoordinatesFromServer(dataServer.lonlat, srs, targetSRS);
                console.log("transformed data OL:", dataFront.lonlat);
            }
            return dataFront;
        },
        getTransformedCoordinatesFromServer: function (lonlat, srs, targetSRS) {
            var me = this;
            if(me._projectionSelect.val() !== me.getMap().getProjection()) {
                jQuery.ajax({
                    url: me._sandbox.getAjaxUrl('Coordinates'),
                    data: {
                        lat: lonlat.lat,
                        lon: lonlat.lon,
                        srs: srs,
                        targetSRS: targetSRS
                    },
                    success: function (response) {
                     if (response.lat && response.lon) {
                       var newLonLat = {
                            'lonlat': {
                                'lon': response.lon,
                                'lat': response.lat
                            }
                       };
                       console.log("transformed data SERVER:", newLonLat.lonlat);
                       setTimeout(function(){
                           me._coordinatesFromServer = true;
                           me._updateLonLat(newLonLat);
                       },
                       3000);

                    }


                    },
                    error: function () {

                    }
                });
            }
        },
        /**
         * Get jQuery element.
         * @method @public getElement
         */
        getElement: function(){
            return jQuery('.mapplugin.coordinatetool');
        },
        /**
         * Create event handlers.
         * @method @private _createEventHandlers
         */
        _createEventHandlers: function () {
            return {
                /**
                 * @method MouseHoverEvent
                 * See PorttiMouse.notifyHover
                 */
                MouseHoverEvent: function (event) {
                    if(this._showMouseCoordinates) {
                        this.refresh({
                            'lonlat': {
                                'lat': parseFloat(event.getLat()),
                                'lon': parseFloat(event.getLon())
                            }
                        });
                    }

                },
                /**
                 * @method AfterMapMoveEvent
                 * Shows map center coordinates after map move
                 */
                AfterMapMoveEvent: function (event) {
                    if(!this._showMouseCoordinates) {
                        this.refresh();
                    }
                },
                /**
                 * @method MapClickedEvent
                 * @param {Oskari.mapframework.bundle.mapmodule.event.MapClickedEvent} event
                 */
                MapClickedEvent: function (event) {
                    if(!this._showMouseCoordinates) {
                        var lonlat = event.getLonLat();
                        this.refresh({
                            'lonlat': {
                                'lat': parseFloat(lonlat.lat),
                                'lon': parseFloat(lonlat.lon)
                            }
                        });
                    }
                },
                /**
                 * @method Publisher2.ColourSchemeChangedEvent
                 * @param  {Oskari.mapframework.bundle.publisher2.event.ColourSchemeChangedEvent} evt
                 */
                'Publisher2.ColourSchemeChangedEvent': function(evt){
                    this._changeToolStyle(evt.getColourScheme());
                },
                /**
                 * @method Publisher.ColourSchemeChangedEvent
                 * @param  {Oskari.mapframework.bundle.publisher.event.ColourSchemeChangedEvent} evt
                 */
                'Publisher.ColourSchemeChangedEvent': function(evt){
                    this._changeToolStyle(evt.getColourScheme());
                }
            };
        },

        /**
         * @public @method changeToolStyle
         * Changes the tool style of the plugin
         *
         * @param {Object} style
         * @param {jQuery} div
         */
        _changeToolStyle: function (style, div) {
            var me = this,
                el = div || me.getElement();

            if (!el) {
                return;
            }

            var styleClass = 'toolstyle-' + (style ? style : 'default');

            var classList = el.attr('class').split(/\s+/);
            for(var c=0;c<classList.length;c++){
                var className = classList[c];
                if(className.indexOf('toolstyle-') > -1){
                    el.removeClass(className);
                }
            }
            el.addClass(styleClass);
        }
    }, {
        'extend': ['Oskari.mapping.mapmodule.plugin.BasicMapModulePlugin'],
        /**
         * @static @property {string[]} protocol array of superclasses
         */
        'protocol': [
            "Oskari.mapframework.module.Module",
            "Oskari.mapframework.ui.module.common.mapmodule.Plugin"
        ]
    });