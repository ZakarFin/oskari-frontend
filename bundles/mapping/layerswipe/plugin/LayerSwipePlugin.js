import React from 'react';
import ReactDOM from 'react-dom';
import { SwipeIcon } from '../resources/icons/Swipe';
import { MapModuleButton } from '../../mapmodule/MapModuleButton';
import { refresh } from 'less';

/**
 * @class Oskari.mapframework.bundle.mapmodule.plugin.LayerSelectionPlugin
 *
 * Provides mapmodule button for the swipe tool
 *
 * See http://www.oskari.org/trac/wiki/DocumentationBundleMapModulePluginLayerSelectionPlugin
 */
Oskari.clazz.define('Oskari.mapframework.bundle.layerswipe.plugin.LayerSwipePlugin',
    /**
     * @method create called automatically on construction
     * @static
     */
    function (conf) {
        this.instance = null;
        this._config = conf || {};
        this._clazz =
            'Oskari.mapframework.bundle.layerswipe.plugin.LayerSwipePlugin';
        this._defaultLocation = 'top left';
        this._index = 70;
        this._name = 'LayerSwipePlugin';
        this.handler = null;
        this.template = jQuery('<div class="mapplugin layerswipe"></div>');
    }, {
        _startPluginImpl: function () {
            this.addToPluginContainer(this._createControlElement());
            this.refresh();
            return true;
        },
        _stopPluginImpl: function () {
            this.getInstance()?.handler.setActive(false);
            this.teardownUI();
        },
        setHandler: function (handler) {
            if (this.handler || !handler) {
                // already set or no handler
                return;
            }
            handler.addStateListener(() => this.refresh());
            this.handler = handler;
        },
        getInstance: function () {
            if (!this.instance) {
                this.instance = this.getSandbox()?.findRegisteredModuleInstance('LayerSwipe');
                this.setHandler(this.instance.handler);
            }
            return this.instance;
        },
        isActive: function () {
            const { active = false } = this.getInstance()?.getState() || {};
            return active;
        },
        setToolState: function (active) {
            this.getInstance()?.setActive(active);
        },
        hasUI: function () {
            return !this.getConfig()?.noUI;
        },
        setHideUI: function (value) {
            const old = this.getConfig();
            this.setConfig({
                ...old,
                noUI: value
            });
        },
        /**
         * @private @method  _createControlElement
         * Creates the whole ui from scratch and writes the plugin in to the UI.
         * Tries to find the plugins placeholder with 'div.mapplugins.left' selector.
         * If it exists, checks if there are other bundles and writes itself as the first one.
         * If the placeholder doesn't exist the plugin is written to the mapmodules div element.
         */
        _createControlElement: function () {
            return this.template.clone();
        },

        refresh: function () {
            const el = this.getElement();
            if (!el) {
                return;
            }
            const active = this.isActive();
            const title = this.getInstance()?.loc('toolLayerSwipe');
            ReactDOM.render(
                <MapModuleButton
                    className='t_layerswipe'
                    highlight='stroke'
                    icon={<SwipeIcon />}
                    visible={this.hasUI()}
                    title={title}
                    onClick={() => this.setToolState(!active)}
                    iconActive={active}
                    position={this.getLocation()}
                    iconSize='20px'
                />,
                el[0]
            );
        }
    }, {
        extend: ['Oskari.mapping.mapmodule.plugin.BasicMapModulePlugin'],
        /**
         * @static @property {string[]} protocol array of superclasses
         */
        protocol: [
            'Oskari.mapframework.module.Module',
            'Oskari.mapframework.ui.module.common.mapmodule.Plugin'
        ]
    });
