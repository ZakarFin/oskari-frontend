import React from 'react';
import ReactDOM from 'react-dom';
import { MapModuleButton } from '../../mapmodule/MapModuleButton';
import { LocaleProvider } from 'oskari-ui/util';
import { TimeControl3d, TimeControl3dHandler } from '../view';
import { ControlIcon } from '../view/icons';
import { getNavigationTheme } from 'oskari-ui/theme';

const BasicMapModulePlugin = Oskari.clazz.get('Oskari.mapping.mapmodule.plugin.BasicMapModulePlugin');
/**
 * @class Oskari.mapping.time-control-3d.TimeControl3dPlugin
 */
class TimeControl3dPlugin extends BasicMapModulePlugin {
    constructor (config) {
        super(config);
        this._conf = config || {};
        this._clazz = 'Oskari.mapping.time-control-3d.TimeControl3dPlugin';
        this._name = 'TimeControl3dPlugin';
        this._defaultLocation = 'top right';
        this._log = Oskari.log(this._name);
        this.loc = Oskari.getMsg.bind(null, 'TimeControl3d');
        this._toolOpen = false;
        this._isMobile = Oskari.util.isMobile();
        this._element = null;
        this._index = 90;
        this._popupContent = null;
        this._popup = null;
        this._mountPoint = jQuery('<div class="mapplugin time-control-3d"><div></div></div>');
        this._popupTemplate = jQuery('<div></div>');

        const sandbox = Oskari.getSandbox();
        const mapmodule = sandbox.findRegisteredModuleInstance('MainMapModule');
        const initialTime = mapmodule.getTime ? mapmodule.getTime() : new Date();
        this.stateHandler = new TimeControl3dHandler((date, time) => {
            sandbox.postRequestByName('SetTimeRequest', [date, time]);
        }, initialTime);
    }
    getName () {
        return this._name;
    }
    isOpen () {
        return this._toolOpen;
    }
    setOpen (bln) {
        this._toolOpen = bln;
        this.refresh();
    }
    resetUI () {
        if (this.isOpen()) {
            this._toggleToolState();
        }
    }
    /**
     * @method resetState
     * Resets the state in the plugin
     */
    resetState () {
        this.redrawUI(Oskari.util.isMobile());
    }

    redrawUI (mapInMobileMode, forced) {
        if (this.getElement()) {
            this.teardownUI();
        } else {
            this._createUI(forced);
        }

        this.refresh();
    }

    _createEventHandlers () {
        return {
            TimeChangedEvent: function (event) {
                this.stateHandler.update(event.getDate(), event.getTime());
            }
        };
    }

    getElement () {
        return this._element;
    }

    getPopUp () {
        return this._popup;
    }

    teardownUI () {
        const popup = this.getPopUp();
        const el = this.getElement();
        if (popup) {
            popup.close(true);
        }
        if (!el) {
            return;
        }
        ReactDOM.unmountComponentAtNode(el.get(0));
        this.removeFromPluginContainer(el);
    }

    _stopPluginImpl () {
        this.teardownUI();
    }

    unmountReactPopup () {
        ReactDOM.unmountComponentAtNode(this._popupContent.get(0));
    }

    _createUI (forced) {
        let el;
        el = this._createControlElement();
        this.addToPluginContainer(el);
        this.refresh();
    }
    _createControlElement () {
        const el = this._mountPoint.clone();
        this._element = el;
        return el;
    }

    _toggleToolState () {
        const popup = this.getPopUp();
        if (!this.isOpen()) {
            this._showPopup();
        } else if (popup) {
            popup.close(true);
        }
    }
    refresh () {
        const el = this.getElement();
        if (!el) {
            return;
        }

        ReactDOM.render(
            <MapModuleButton
                className='t_timecontrol'
                title={this.loc('tooltip')}
                icon={<ControlIcon isMobile={this._isMobile} controlIsActive={this.isOpen()} />}
                onClick={() => this._toggleToolState()}
                iconActive={this.isOpen()}
            />,
            el.get(0)
        );
    }

    renderPopup () {
        const popupContent = this._popupTemplate.clone();
        ReactDOM.render(
            <LocaleProvider value={{ bundleKey: 'TimeControl3d' }}>
                <TimeControl3d {... this.stateHandler.getState()}
                    controller={this.stateHandler.getController()}
                    isMobile = {Oskari.util.isMobile()}
                />
            </LocaleProvider>,
            popupContent.get(0));
        this._popupContent = popupContent;
    }

    _showPopup () {
        const me = this;
        const popupTitle = this.loc('title');
        const mapmodule = this.getMapModule();
        const popupService = this.getSandbox().getService('Oskari.userinterface.component.PopupService');

        this._popup = popupService.createPopup();
        this.renderPopup();

        // create close icon
        this._popup.createCloseIcon();
        this._popup.onClose(function () {
            me.unmountReactPopup();
            me.setOpen(false);
            me.refresh();
        });

        const theme = mapmodule.getMapTheme();
        // TODO: Should use getHeaderTheme() to be consistent with other popups, but it doesn't look as good.
        const helper = getNavigationTheme(theme);
        this._popup.makeDraggable();
        this._popup.addClass('time-control-3d');

        this._popup.show(popupTitle, this._popupContent);
        const elem = this.getElement();

        const isDark = Oskari.util.isDarkColor(helper.getPrimary());
        const popupCloseIcon = (isDark) ? 'icon-close-white' : undefined;
        this._popup.setColourScheme({
            'bgColour': helper.getPrimary(),
            'bodyBgColour': helper.getPrimary(),
            'titleColour': helper.getTextColor(),
            'opacity': 0.8,
            'iconCls': popupCloseIcon
        });
        let popupLocation = this.getLocation().includes('left') ? 'right' : 'left';
        if (this._isMobile) {
            popupLocation = 'bottom';
        }
        this._popup.moveTo(elem, popupLocation, true);
        this.setOpen(true);
        this.refresh();
    }
}

Oskari.clazz.defineES('Oskari.mapping.time-control-3d.TimeControl3dPlugin',
    TimeControl3dPlugin,
    {
        'protocol': [
            'Oskari.mapframework.module.Module',
            'Oskari.mapframework.ui.module.common.mapmodule.Plugin'
        ]
    }
);
