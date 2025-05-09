// CoordinatesPlugin extends BasicMapModulePlugin
import '../../../mapping/mapmodule/plugin/BasicMapModulePlugin';

/**
 * @class Oskari    .mapframework.bundle.coordinatedisplay.plugin.CoordinatesPlugin
 * Provides a coordinate display for map
 */
Oskari.clazz.define('Oskari.mapframework.bundle.coordinatedisplay.plugin.CoordinatesPlugin',
    /**
     * @method create called automatically on construction
     * @static
     * @param {Object} config
     *      JSON config with params needed to run the plugin
     */
    function (config, locale) {
        // FIXME see if the inherited ._loc would work...
        this._locale = locale;
        this._config = config;
        this._clazz =
            'Oskari.mapframework.bundle.coordinatedisplay.plugin.CoordinatesPlugin';
        this._defaultLocation = 'top right';
        this._index = 7;
        this._name = 'CoordinatesPlugin';
    }, {
        /**
         * @private @method _createControlElement
         * Creates UI for coordinate display and places it on the maps
         * div where this plugin registered.
         *
         *
         * @return {jQuery}
         */
        _createControlElement: function () {
            var me = this,
                loc = me._locale,
                crs = me.getMapModule().getProjection(),
                crsText = loc.crs[crs] || crs,
                el = jQuery(
                    '<div class="mapplugin coordinates">' +
                    '    <div>' + crsText + '</div>' +
                    '    <div>' +
                    '      <div>' + loc.compass.N + '</div>' +
                    '      <div></div>' +
                    '    </div>' +
                    '    <div>' +
                    '      <div>' + loc.compass.E + '</div>' +
                    '      <div></div>' +
                    '    </div>' +
                    '</div>');

            el.on('mousedown', function (event) {
                event.stopPropagation();
            });
            // Store coordinate value elements so we can update them fast
            me._latEl = el.find('div > div:last-child')[0];
            me._lonEl = el.find('div > div:last-child')[1];
            return el;
        },

        /**
         * @method _refresh
         * @param {Object} data contains lat/lon information to show on UI
         * Updates the given coordinates to the UI
         */
        refresh: function (data) {
            var me = this,
                conf = me._config,
                roundToDecimals = 0;

            if (conf && conf.roundToDecimals) {
                roundToDecimals = conf.roundToDecimals;
            }

            if (!data || !data.latlon) {
                // update with map coordinates if coordinates not given
                var map = me.getSandbox().getMap();
                data = {
                    'latlon': {
                        'lat': parseFloat(map.getY()),
                        'lon': parseFloat(map.getX())
                    }
                };
            }
            if (me._latEl && me._lonEl) {
                me._latEl.innerHTML = data.latlon.lat.toFixed(roundToDecimals);
                me._lonEl.innerHTML = data.latlon.lon.toFixed(roundToDecimals);
            }
        },

        _createEventHandlers: function () {
            return {
                /**
                 * @method MouseHoverEvent
                 * See PorttiMouse.notifyHover
                 */
                MouseHoverEvent: function (event) {
                    this.refresh({
                        'latlon': {
                            'lat': parseFloat(event.getLat()),
                            'lon': parseFloat(event.getLon())
                        }
                    });
                },
                /**
                 * @method AfterMapMoveEvent
                 * Shows map center coordinates after map move
                 */
                AfterMapMoveEvent: function (event) {
                    this.refresh();
                }
            };
        }
    }, {
        'extend': ['Oskari.mapping.mapmodule.plugin.BasicMapModulePlugin'],
        /**
         * @static @property {string[]} protocol array of superclasses
         */
        'protocol': [
            'Oskari.mapframework.module.Module',
            'Oskari.mapframework.ui.module.common.mapmodule.Plugin'
        ]
    });
