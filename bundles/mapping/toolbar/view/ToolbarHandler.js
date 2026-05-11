import { StateHandler, controllerMixin } from 'oskari-ui/util';

class UIHandler extends StateHandler {
    constructor (instance) {
        super();
        this.instance = instance;
        this.setState({
            buttons: {},
            groupsToToolbars: {},
            selectedButton: null,
            defaultButton: null,
            toolbarConfigs: {}
        });
    }

    getMapModule () {
        return Oskari.getSandbox().findRegisteredModuleInstance('MainMapModule');
    }

    // ---- Toolbar config management ----

    getToolbarConfig (tbid) {
        return this.state.toolbarConfigs[tbid || 'default'];
    }

    setToolbarConfig (tbid, config) {
        this.state.toolbarConfigs[tbid] = config;
        this.notify();
    }

    removeToolbarConfig (tbid) {
        delete this.state.toolbarConfigs[tbid];
        this.notify();
    }

    updateToolbarColors (tbid, data) {
        const { toolbarConfigs, buttons } = this.state;
        const config = toolbarConfigs[tbid];
        if (!config) {
            return;
        }
        config.colours = data.colours;

        const prefix = tbid + '-';
        for (const groupId in buttons) {
            if (!Object.prototype.hasOwnProperty.call(buttons, groupId) || !groupId.startsWith(prefix)) {
                continue;
            }
            for (const buttonId in buttons[groupId]) {
                if (!Object.prototype.hasOwnProperty.call(buttons[groupId], buttonId)) {
                    continue;
                }
                const btn = buttons[groupId][buttonId];
                if (!btn) {
                    continue;
                }
                this._ensureButtonUiState(btn);
                let color = data.colours.background;
                if (btn.__ui.selected && btn.toggleChangeIcon && btn.__ui.activeColor) {
                    color = btn.__ui.activeColor;
                }
                this._setIconThemeClass(btn, Oskari.util.getColorBrightness(color) === 'light' ? 'light' : 'dark');
            }
        }
        this.notify();
    }

    // ---- Button management ----

    addToolButton (pId, pGroup, pConfig) {
        if (!pId || !pGroup || !pConfig || !pConfig.callback) {
            Oskari.log('Toolbar').warn('All parameters must be defined in AddToolButtonRequest');
            return false;
        }
        const { buttons, groupsToToolbars } = this.state;
        const prefixedGroup = (pConfig.toolbarid || 'default') + '-' + pGroup;

        if (!buttons[prefixedGroup]) {
            buttons[prefixedGroup] = {};
            groupsToToolbars[prefixedGroup] = pConfig.toolbarid || null;
        }

        if (buttons[prefixedGroup][pId]) {
            // already present – signal caller so it can still check child positions
            return true;
        }

        this._ensureButtonUiState(pConfig);
        buttons[prefixedGroup][pId] = pConfig;

        const { selectedButton } = this.state;
        if (selectedButton) {
            if (selectedButton.id === pId && selectedButton.group === prefixedGroup) {
                pConfig.__ui.selected = true;
                pConfig.callback(null);
            }
        } else if (pConfig.selected) {
            pConfig.__ui.selected = true;
            this.state.selectedButton = { id: pId, group: prefixedGroup };
        }

        if (pConfig.selected) {
            this.state.defaultButton = { id: pId, group: prefixedGroup };
        }

        if (pConfig.disabled === true) {
            pConfig.enabled = false;
            delete pConfig.disabled;
        }
        if (pConfig.enabled === false) {
            pConfig.__ui.disabled = true;
        }

        if (pConfig.prepend === true) {
            const reordered = { [pId]: buttons[prefixedGroup][pId] };
            for (const key in buttons[prefixedGroup]) {
                if (Object.prototype.hasOwnProperty.call(buttons[prefixedGroup], key) && key !== pId) {
                    reordered[key] = buttons[prefixedGroup][key];
                }
            }
            buttons[prefixedGroup] = reordered;
        }

        const toolbarConfig = this.getToolbarConfig(groupsToToolbars[prefixedGroup]);
        if (pConfig.iconCls) {
            this._addButtonTheme(pConfig, toolbarConfig);
        }

        this.notify();
        return false;
    }

    removeToolButton (pId, pGroup, pToolbarId) {
        if (!pGroup) {
            return;
        }
        const { buttons } = this.state;
        const toolbarId = pToolbarId || 'default';
        const prefixedGroup = toolbarId + '-' + pGroup;

        if (!buttons[prefixedGroup]) {
            return;
        }

        if (!pId) {
            delete buttons[prefixedGroup];
            this.notify();
            return;
        }

        if (buttons[prefixedGroup][pId]?.children) {
            buttons[prefixedGroup][pId].children.remove();
        }
        delete buttons[prefixedGroup][pId];

        const { selectedButton } = this.state;
        if (selectedButton?.group === prefixedGroup && selectedButton?.id === pId) {
            this.state.selectedButton = null;
        }

        if (Object.keys(buttons[prefixedGroup]).length === 0) {
            delete buttons[prefixedGroup];
        }

        this.notify();
    }

    changeToolButtonState (pId, pGroup, pState, pToolbarId) {
        if (!pGroup) {
            return;
        }
        const { buttons } = this.state;
        const toolbarId = pToolbarId || 'default';
        const prefixedGroup = toolbarId + '-' + pGroup;

        if (!buttons[prefixedGroup]) {
            return;
        }

        if (pId) {
            const btn = buttons[prefixedGroup][pId];
            btn.enabled = pState;
            this._ensureButtonUiState(btn);
            btn.__ui.disabled = !pState;
        } else {
            for (const b in buttons[prefixedGroup]) {
                if (Object.prototype.hasOwnProperty.call(buttons[prefixedGroup], b)) {
                    const btn = buttons[prefixedGroup][b];
                    btn.enabled = pState;
                    this._ensureButtonUiState(btn);
                    btn.__ui.disabled = !pState;
                }
            }
        }
        this.notify();
    }

    clickButton (pId, pGroup) {
        const { buttons, defaultButton, groupsToToolbars } = this.state;

        let resolvedId = pId;
        let resolvedGroup = pGroup;

        if (!resolvedId) {
            if (defaultButton) {
                resolvedId = defaultButton.id;
                resolvedGroup = defaultButton.group;
            } else {
                this._deactiveTools();
                this.notify();
                this.instance.getSandbox().notifyAll(
                    Oskari.eventBuilder('Toolbar.ToolSelectedEvent')(resolvedId, resolvedGroup)
                );
                return;
            }
        }

        const btn = buttons[resolvedGroup]?.[resolvedId];
        if (!btn) {
            return;
        }
        if (btn.enabled === false || btn.__ui?.disabled) {
            return;
        }

        this._ensureButtonUiState(btn);

        if (typeof btn.selected === 'undefined') {
            btn.selected = !!btn.__ui.selected;
        }

        let toolbarConfig;
        if (btn.sticky === true) {
            this._deactiveTools();
            this.state.selectedButton = { id: resolvedId, group: resolvedGroup };
            btn.__ui.selected = true;
            toolbarConfig = this.getToolbarConfig(groupsToToolbars[resolvedGroup]);

            if (!btn.activeColour) {
                btn.activeColour = Oskari.util.isDarkColor(toolbarConfig?.colours?.hover) ? 'dark' : 'light';
            }
            btn.__ui.activeColor = btn.activeColour;

            if (btn.toggleChangeIcon === true) {
                this._changeButtonIconTheme(btn, btn.activeColour);
            } else if (btn.__ui.iconThemeClass === this._getBaseIconClass(btn) + '-light') {
                this._changeButtonIconTheme(btn, '#212121');
            }
        }

        if (btn.toggleSelection) {
            btn.__ui.selected = !btn.__ui.selected;
            btn.selected = btn.__ui.selected;
        }

        btn.callback(btn.children);

        if (!btn.__ui.selected && btn.__ui.hover) {
            toolbarConfig = toolbarConfig ?? this.getToolbarConfig(groupsToToolbars[resolvedGroup]);
            this._addHoverIcon(btn, toolbarConfig);
        }

        this.notify();
        this.instance.getSandbox().notifyAll(
            Oskari.eventBuilder('Toolbar.ToolSelectedEvent')(resolvedId, resolvedGroup, btn.sticky)
        );
    }

    onButtonMouseEnter (pId, pGroup) {
        const btn = this.state.buttons[pGroup]?.[pId];
        if (!btn) {
            return;
        }
        this._ensureButtonUiState(btn);
        btn.__ui.hover = true;
        if (!btn.__ui.selected && !btn.__ui.disabled) {
            this._addHoverIcon(btn, this.getToolbarConfig(this.state.groupsToToolbars[pGroup]));
        }
        this.notify();
    }

    onButtonMouseLeave (pId, pGroup) {
        const btn = this.state.buttons[pGroup]?.[pId];
        if (!btn) {
            return;
        }
        this._ensureButtonUiState(btn);
        btn.__ui.hover = false;
        if (!btn.__ui.selected && !btn.__ui.disabled) {
            this._addButtonTheme(btn, this.getToolbarConfig(this.state.groupsToToolbars[pGroup]));
        }
        this.notify();
    }

    // ---- Bundle stateful protocol ----

    getSelectedButton () {
        return this.state.selectedButton;
    }

    isToolbarEmpty (toolbarId) {
        const { buttons } = this.state;
        return !Object.keys(buttons).some(key => key.startsWith(toolbarId));
    }

    setBundleState (state) {
        if (!state?.selected) {
            this.state.selectedButton = null;
            this._deactiveTools();
            this.notify();
            return;
        }

        this.state.selectedButton = state.selected;
        const { buttons } = this.state;
        let { id: tool, group } = state.selected;
        if (group.split('-').length < 2) {
            group = 'default-' + group;
        }
        this._deactiveTools();
        const btn = buttons[group]?.[tool];
        if (btn) {
            this._ensureButtonUiState(btn);
            btn.__ui.selected = true;
            btn.callback();
        }
        this.notify();
    }

    // ---- Data for React rendering ----

    collectToolbarGroups (toolbarId) {
        const { buttons } = this.state;
        const prefix = toolbarId + '-';
        const groups = [];

        for (const groupId in buttons) {
            if (!Object.prototype.hasOwnProperty.call(buttons, groupId) || !groupId.startsWith(prefix)) {
                continue;
            }
            const items = [];
            const buttonMap = buttons[groupId];
            for (const buttonId in buttonMap) {
                if (!Object.prototype.hasOwnProperty.call(buttonMap, buttonId)) {
                    continue;
                }
                const button = buttonMap[buttonId];
                if (!button) {
                    continue;
                }
                this._ensureButtonUiState(button);
                items.push({
                    id: buttonId,
                    domId: 'oskari_toolbar_' + groupId.substring(prefix.length) + '_' + buttonId,
                    tooltip: button.tooltip,
                    iconCls: button.iconCls,
                    toggleChangeIcon: button.toggleChangeIcon,
                    activeColor: button.__ui.activeColor,
                    selected: button.__ui.selected,
                    disabled: button.__ui.disabled,
                    hover: button.__ui.hover,
                    iconClassName: button.__ui.iconThemeClass || button.iconCls
                });
            }
            groups.push({ id: groupId, buttons: items });
        }
        return groups;
    }

    // ---- Private icon/style helpers ----

    _ensureButtonUiState (buttonConfig) {
        if (!buttonConfig.__ui) {
            buttonConfig.__ui = {};
        }
        if (typeof buttonConfig.__ui.selected === 'undefined') {
            buttonConfig.__ui.selected = !!buttonConfig.selected;
        }
        if (typeof buttonConfig.__ui.hover === 'undefined') {
            buttonConfig.__ui.hover = false;
        }
        if (typeof buttonConfig.__ui.disabled === 'undefined') {
            buttonConfig.__ui.disabled = buttonConfig.enabled === false;
        }
    }

    _getBaseIconClass (btnConfig) {
        if (!btnConfig?.iconCls) {
            return '';
        }
        const { iconCls } = btnConfig;
        if (iconCls.includes('-light')) {
            return iconCls.substring(0, iconCls.indexOf('-light'));
        }
        if (iconCls.includes('-dark')) {
            return iconCls.substring(0, iconCls.indexOf('-dark'));
        }
        return iconCls;
    }

    _setIconThemeClass (btnConfig, iconEnd) {
        this._ensureButtonUiState(btnConfig);
        btnConfig.__ui.iconThemeClass = this._getBaseIconClass(btnConfig) + '-' + iconEnd;
    }

    _isAlreadyThemedIcon (btnConfig) {
        if (!btnConfig?.iconCls) {
            return false;
        }
        return btnConfig.iconCls.includes('light') || btnConfig.iconCls.includes('dark');
    }

    _addButtonTheme (btnConfig, toolbarConfig) {
        if (!btnConfig?.iconCls) {
            return;
        }
        this._removeIconThemes(btnConfig);
        if (this._isAlreadyThemedIcon(btnConfig)) {
            btnConfig.__ui.iconThemeClass = btnConfig.iconCls;
        } else if (toolbarConfig?.colours?.background) {
            this._setIconThemeClass(
                btnConfig,
                Oskari.util.getColorBrightness(toolbarConfig.colours.background) === 'light' ? 'light' : 'dark'
            );
        } else {
            this._setIconThemeClass(btnConfig, this.getMapModule().getTheme());
        }
    }

    _addHoverIcon (btnConfig, toolbarConfig) {
        if (!btnConfig?.iconCls || !toolbarConfig || toolbarConfig.createdHover === false) {
            return;
        }
        this._ensureButtonUiState(btnConfig);
        this._setIconThemeClass(
            btnConfig,
            Oskari.util.isDarkColor(toolbarConfig.colours.hover) ? 'dark' : 'light'
        );
    }

    _removeIconThemes (btnConfig) {
        if (!btnConfig?.iconCls) {
            return;
        }
        this._ensureButtonUiState(btnConfig);
        btnConfig.__ui.iconThemeClass = undefined;
    }

    _changeButtonIconTheme (btnConfig, color) {
        if (!btnConfig?.activeColour) {
            return;
        }
        this._ensureButtonUiState(btnConfig);
        if (this._isAlreadyThemedIcon(btnConfig)) {
            const iconCls = this._getBaseIconClass(btnConfig);
            btnConfig.__ui.iconThemeClass = btnConfig.__ui.selected
                ? iconCls + (Oskari.util.isLightColor(color) ? '-light' : '-dark')
                : btnConfig.iconCls;
        } else {
            this._setIconThemeClass(btnConfig, Oskari.util.isLightColor(color) ? 'light' : 'dark');
        }
    }

    _deactiveTools () {
        const { buttons, groupsToToolbars } = this.state;
        for (const groupId in buttons) {
            if (!Object.prototype.hasOwnProperty.call(buttons, groupId)) {
                continue;
            }
            const toolbarConfig = this.getToolbarConfig(groupsToToolbars[groupId]);
            const groupButtons = buttons[groupId];
            for (const toolId in groupButtons) {
                if (Object.prototype.hasOwnProperty.call(groupButtons, toolId)) {
                    this._resetToolStyle(groupButtons[toolId], toolbarConfig);
                }
            }
        }
    }

    _resetToolStyle (btnConf, toolbarConf) {
        if (!btnConf) {
            return;
        }
        this._ensureButtonUiState(btnConf);
        btnConf.__ui.selected = false;
        btnConf.__ui.hover = false;
        if (btnConf.activeColour) {
            btnConf.__ui.activeColor = undefined;
            this._removeIconThemes(btnConf);
        }
        if (toolbarConf?.colours) {
            this._changeButtonIconTheme(btnConf, toolbarConf.colours.background);
        }
        if (btnConf.toggleChangeIcon === true) {
            this._addButtonTheme(btnConf, toolbarConf);
        }
    }
}

export const ToolbarHandler = controllerMixin(UIHandler, [
    'addToolButton',
    'removeToolButton',
    'changeToolButtonState',
    'clickButton',
    'onButtonMouseEnter',
    'onButtonMouseLeave',
    'setBundleState',
    'setToolbarConfig',
    'removeToolbarConfig',
    'updateToolbarColors'
]);
