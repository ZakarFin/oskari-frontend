/**
 * @class Oskari.mapping.mapmodule.plugin.AbstractMapModulePlugin
 * Abtract MapModule plugin intended to be extended by plugin implementations.
 */
export class AbstractMapPlugin {
    constructor (config) {
        this._config = config || {};
        this._mapModule = null;
        this._name = 'AbstractPlugin' + Math.floor(Math.random() * (1632960) + 46656).toString(36);

        this._eventHandlers = {};
        this._loc = {};
        this._requestHandlers = {};
        this._sandbox = null;
    }

    getName () {
        const mapmodule = this.getMapModule();
        const name = this._name;
        if (!mapmodule) {
            return name;
        }
        return mapmodule.getName() + name;
    }
    // reference to map module in which this plugin is registered to
    getMapModule () {
        return this._mapModule;
    }
    setMapModule (mapModule) {
        if (!mapModule) {
            // clear references
            // FIXME: this seems to cause troubles in plugins and they are not prepared to handle this...
            // this._mapModule = null;
            return;
        }
        this._mapModule = mapModule;
        // TODO: do we really need to get localization from map module here?
        if (!this._loc || Object.keys(this._loc).length === 0) {
            // don't blindly overwrite if localization already has some content
            this._loc = mapModule.getLocalization('plugin', true)[this._name] || {};
        }
    }
    getSandbox () {
        return this._sandbox;
    }
    // reference to map engine impl (like OpenLayers)
    getMap () {
        return this.getMapModule()?.getMap();
    }
    
    // Note! This is only called if the plugin is registering to sandbox
    init () {
    }
    // Note! This is only called if the plugin is registering to mapmodule
    register () {
    }
    // Note! This is only called if the plugin is unregistering from mapmodule
    unregister () {
    }
    // Note! This is only called by mapmodule when it LayerToolsEditModeEvent is received/publisher enters drag mode
    // This provides a hook for plugins to close their popups etc
    resetUI () {
        // map module should call this when for example publisher goes to dragging mode
    }
    // TODO: do we need this? maybe mapmodule should forward some most used events instead?
    createEventHandlers () {
        return {};
    }
    // TODO: do we need this? I don't think this is used that much
    createRequestHandlers () {
        return {};
    }

    // lifecycle function. Called by mapmodule when we start the plugin
    startPlugin (sandbox) {
        this._sandbox = sandbox;
        sandbox.register(this);
        this._eventHandlers = this.createEventHandlers();
        this._requestHandlers = this.createRequestHandlers();

        Object.keys(this._eventHandlers)
            .forEach(eventName => sandbox.registerForEventByName(this, eventName));

        Object.keys(this._requestHandlers)
            .forEach(requestName => sandbox.requestHandler(requestName, this._requestHandlers[requestName]));

        let waitingForToolbar = false;
        try {
            waitingForToolbar = this._startPluginImpl(sandbox);
        } catch (e) {
            Oskari.log('AbstractMapModulePlugin').error('Error starting plugin impl ' + this.getName());
        }
        // Make sure plugin's edit mode is set correctly
        // (we might already be in edit mode)
        this._setLayerToolsEditMode(this.getMapModule().isInLayerToolsEditMode());
        return waitingForToolbar;
    }
    
    // lifecycle function. Called by mapmodule when we stop the plugin
    stopPlugin (sandbox) {
        try {
            this._stopPluginImpl(sandbox);
        } catch (e) {
            Oskari.log('AbstractMapModulePlugin').error('Error stopping plugin impl ' + this.getName());
        }

        Object.keys(this._eventHandlers)
            .forEach(eventName => sandbox.unregisterFromEventByName(this, eventName));

        Object.keys(this._requestHandlers)
            .forEach(requestName => sandbox.requestHandler(requestName, null));

        sandbox.unregister(this);
        this._sandbox = null;
    }

    // plugins with UI might get refresh calls from map module when things change (like theme etc)
    hasUI () {
        return false;
    }
    // Should return true if publisher should stop this plugin on startup.
    // This is used to detect which geoportal plugins are configurable in publisher
    // Some plugins don't work if they are stopped and restarted so this should return false for those plugins.
    // If publisher stops this at startup, it will restart it on exit.
    isShouldStopForPublisher () {
        return this.hasUI();
    }
    // mostly for publisher to save location and other config options
    // we could use it for saving a view as well in the future?
    getConfig () {
        if (!this._config) {
            return {};
        }
        // use this when saving published map so we won't have to keep a
        // separate copy in the publisher
        var ret = {};
        // return a clone so people won't muck about with the config...
        try {
            return jQuery.extend(true, ret, this._config);
        } catch (err) {
            var log = Oskari.log('AbstractMapModulePlugin');
            log.warn('Unable to setup config properly for ' + this.getName() + '. Trying shallow copy.', err);
            try {
                return jQuery.extend(ret, this._config);
            } catch (err) {
                log.error('Unable to setup config for ' + this.getName() + '. Returning empty config.', err);
            }
        }
        return ret;
    }
    setConfig (config) {
        this._config = config;
        // refresh UI to take new conf to use
        this.refresh();
    }
    // For overriding
    // the function everything should call to update the plugins UI
    refresh () {}
    // the boilerplate Oskari event listener function
    onEvent (event) {
        const handler = this._eventHandlers[event.getName()];
        if (handler) {
            return handler.apply(this, [event]);
        } else {
            Oskari.log(this.getName())
                .warn('No handler found for registered event', event.getName());
        }
    }
};

// allows extending the class with the normal Oskari extend: [] syntax
/*
Oskari.clazz.defineES('Oskari.mapping.mapmodule.plugin.AbstractMapModulePlugin', AbstractMapPlugin,
    {
        protocol: [
            // TODO: should we remove Module protocol/interface to clarify intended usage?
            'Oskari.mapframework.module.Module',
            'Oskari.mapframework.ui.module.common.mapmodule.Plugin'
        ]
    }
);
*/