import React from 'react';
import { getReactRoot, unmountReactRoot } from 'oskari-ui/components/window';
import { Toolbar } from './view/Toolbar';

Oskari.clazz.category('Oskari.mapframework.bundle.toolbar.ToolbarBundleInstance', 'button-methods', {

    /**
     * @method addToolButton
     *
     * @param {String}
     *            pId identifier so we can manage the button with subsequent requests
     * @param {String}
     *            pGroup identifier for organizing buttons
     * @param {Object} pConfig
     *            JSON config for button
     *
     * Adds a button to the toolbar. Triggered usually by sending
     * Oskari.mapframework.bundle.toolbar.request.AddToolButtonRequest.
     */

    addToolButton: function (pId, pGroup, pConfig) {
        var me = this;
        if (!pId || !pGroup || !pConfig || !pConfig.callback) {
            // no config -> do nothing
            Oskari.log('Toolbar').warn('All parameters must be defined in AddToolButtonRequest');
            return;
        }
        me.getToolbarContainer(pConfig ? pConfig.toolbarid : null, pConfig);
        var prefixedGroup = (pConfig.toolbarid || 'default') + '-' + pGroup;

        if (!me.buttons[prefixedGroup]) {
            // create group if not existing
            me.buttons[prefixedGroup] = {};
            me.groupsToToolbars[prefixedGroup] = pConfig ? pConfig.toolbarid : null;
        }

        if (me.buttons[prefixedGroup][pId]) {
            me._checkToolChildrenPosition(pId, pGroup, pConfig);
            // button already added, dont add again
            return;
        }

        // create button to requested group with requested id
        me._ensureButtonUiState(pConfig);
        me.buttons[prefixedGroup][pId] = pConfig;

        // handling for state setting if the button was not yet on toolbar on setState
        if (me.selectedButton) {
            if (me.selectedButton.id === pId &&
                    me.selectedButton.group === prefixedGroup) {
                pConfig.__ui.selected = true;
                pConfig.callback(null);
            }
        } else {
            if (pConfig.selected) {
                pConfig.__ui.selected = true;
                me.selectedButton = {
                    id: pId,
                    group: prefixedGroup
                };
            }
        }
        // if button config states this to be selected -> use as default button
        if (pConfig.selected) {
            me.defaultButton = {
                id: pId,
                group: prefixedGroup
            };
        }

        var toolbarConfig = this.getToolBarConfigs(this.groupsToToolbars[prefixedGroup]);

        // prefer enabled flag over disabled
        if (pConfig.disabled === true) {
            pConfig.enabled = false;
            delete pConfig.disabled;
        }
        // if button states to be disabled, disable button
        if (pConfig.enabled === false) {
            pConfig.__ui.disabled = true;
        }

        if (pConfig.prepend === true) {
            var reordered = {};
            reordered[pId] = me.buttons[prefixedGroup][pId];
            for (var key in me.buttons[prefixedGroup]) {
                if (me.buttons[prefixedGroup].hasOwnProperty(key) && key !== pId) {
                    reordered[key] = me.buttons[prefixedGroup][key];
                }
            }
            me.buttons[prefixedGroup] = reordered;
        }

        if (pConfig.childPosition) {
            me._renderToolbar(pConfig.toolbarid || 'default');
            me._createButtonChildren(pId, pGroup, null, pConfig);
            me._checkToolChildrenPosition(pId, pGroup, pConfig);
        }
        if (pConfig.iconCls) {
            me._addButtonTheme(pConfig, toolbarConfig);
        }
        me._renderToolbar(pConfig.toolbarid || 'default');
    },

    getMapModule: function () {
        return Oskari.getSandbox().findRegisteredModuleInstance('MainMapModule');
    },

    _checkToolChildrenPosition: function (pId, pGroup, pConfig) {
        var me = this;
        var prefixedGroup = (pConfig.toolbarid || 'default') + '-' + pGroup;
        var btn = this.buttons[prefixedGroup][pId];
        var toolbar = me.getToolbarContainer(pConfig ? pConfig.toolbarid : null, pConfig);
        var toolbarParent = toolbar.parents('.oskariui-center').find('div').first();
        var offset = toolbarParent.offset();
        var group = toolbar.find('div.toolrow[tbgroup=' + prefixedGroup + ']');
        var button = group.find('div.tool[tool=' + pId + ']');

        if (typeof btn.children === 'undefined' || !pConfig.childPosition) {
            return;
        }

        switch (pConfig.childPosition) {
        case 'bottom':
            btn.children.css({
                position: 'absolute',
                'background-color': btn.activeColour || '#ffffff',
                top: offset.top + toolbarParent.outerHeight() + 'px',
                left: button.offset().left
            });
            break;
        }
    },
    _createButtonChildren: function (pId, pGroup, button, pConfig) {
        var me = this;
        var buttonChildren = jQuery('<div class="tool-children"></div>');
        var toolbar = me.getToolbarContainer(pConfig ? pConfig.toolbarid : null, pConfig);
        var toolbarTopParent = toolbar.parents('.oskariui-center');
        var prefixedGroup = (pConfig.toolbarid || 'default') + '-' + pGroup;
        var btn = this.buttons[prefixedGroup][pId];
        var children = buttonChildren.clone();

        children.attr({
            'data-button-id': pId,
            'data-group-id': pGroup
        });
        toolbarTopParent.append(children);
        children.hide();
        btn.children = children;
    },

    /**
     * @method _clickButton
     * Handles click of a toolbar button and can be used to click a button
     * programmatically
     * @param {String}
     *            pId identifier for button
     * @param {String}
     *            pGroup identifier for button group
     * @private
     */
    _clickButton: function (pId, pGroup) {
        var me = this;
        var e;
        if (!pId) {
            if (this.defaultButton) {
                // use default button if ID param not given
                pId = this.defaultButton.id;
                pGroup = this.defaultButton.group;
            } else {
                e = Oskari.eventBuilder('Toolbar.ToolSelectedEvent')(pId, pGroup);
                this.sandbox.notifyAll(e);

                if (pGroup) {
                    this._deactiveTools(pGroup);
                }
                this._renderAllToolbars();
                return;
            }
        }

        var btn = this.buttons[pGroup][pId];
        var toolbarConfig;

        if (btn.enabled === false || (btn.__ui && btn.__ui.disabled)) {
            return;
        }

        this._ensureButtonUiState(btn);

        if (typeof btn.selected === 'undefined') {
            btn.selected = !!btn.__ui.selected;
        }

        if (btn.sticky === true) {
            // only need to deactivate tools when sticky button
            this._deactiveTools(pGroup);

            this.selectedButton = {
                id: pId,
                group: pGroup
            };

            // highlight the button
            btn.__ui.selected = true;
            toolbarConfig = this.getToolBarConfigs(this.groupsToToolbars[pGroup]);

            if (!btn.activeColour) {
                btn.activeColour = (Oskari.util.isDarkColor(toolbarConfig.colours.hover)) ? 'dark' : 'light';
            }
            btn.__ui.activeColor = btn.activeColour;

            if (btn.toggleChangeIcon === true) {
                me._changeButtonIconTheme(btn, null, btn.activeColour);
            } else if (btn.__ui.iconThemeClass === (me._getBaseIconClass(btn) + '-light')) {
                me._changeButtonIconTheme(btn, null, '#212121');
            }
        }

        // toggle selection of this button
        if (btn.toggleSelection) {
            // highlight the button
            if (btn.__ui.selected) {
                btn.__ui.selected = false;
                btn.selected = false;
            } else {
                btn.__ui.selected = true;
                btn.selected = true;
            }
        }

        btn.callback(btn.children);

        if (!btn.__ui.selected && btn.__ui.hover) {
            toolbarConfig = this.getToolBarConfigs(this.groupsToToolbars[pGroup]);
            me._addHoverIcon(btn, toolbarConfig);
        }
        this._renderToolbar(this.groupsToToolbars[pGroup] || 'default');
        // notify components that tool has changed
        e = Oskari.eventBuilder('Toolbar.ToolSelectedEvent')(pId, pGroup, btn.sticky);
        this.sandbox.notifyAll(e);
    },
    _addHoverIcon: function (btnConfig, toolbarConfig, buttonEl) {
        var me = this;
        if (!btnConfig || !btnConfig.iconCls || !toolbarConfig || toolbarConfig.createdHover === false) {
            return;
        }
        me._ensureButtonUiState(btnConfig);

        var iconEnd = (Oskari.util.isDarkColor(toolbarConfig.colours.hover)) ? 'dark' : 'light';
        me._setIconThemeClass(btnConfig, iconEnd);
    },
    _removeIconThemes: function (btnEl, btnConfig) {
        if (!btnConfig || !btnConfig.iconCls) {
            return;
        }
        this._ensureButtonUiState(btnConfig);
        btnConfig.__ui.iconThemeClass = undefined;
    },
    /**
     * Add button theme
     * @method  @private _addButtonTheme
     * @param {Object} btnConfig button config
     * @param {Object} toolbarConfig toolbar config
     * @param {Object} buttonEl  button jQuery element
     */
    _addButtonTheme: function (btnConfig, toolbarConfig, buttonEl) {
        var me = this;
        if (!btnConfig || !btnConfig.iconCls) {
            return;
        }
        me._removeIconThemes(null, btnConfig);

        if (me._isAllreadyThemedIcon(btnConfig)) {
            btnConfig.__ui.iconThemeClass = btnConfig.iconCls;
        } else if (toolbarConfig && toolbarConfig.colours && toolbarConfig.colours.background) {
            if (Oskari.util.getColorBrightness(toolbarConfig.colours.background) === 'light') {
                me._setIconThemeClass(btnConfig, 'light');
            } else {
                me._setIconThemeClass(btnConfig, 'dark');
            }
        } else {
            me._setIconThemeClass(btnConfig, this.getMapModule().getTheme());
        }
    },
    _isAllreadyThemedIcon: function (btnConfig) {
        var isButtonConfig = (btnConfig && btnConfig.iconCls);
        var isLightTheme = (btnConfig.iconCls.indexOf('light') > -1);
        var isDarkTheme = (btnConfig.iconCls.indexOf('dark') > -1);

        if (!isButtonConfig) {
            return false;
        } else if (isLightTheme || isDarkTheme) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * Change button icon theme
     * @method  @priavate _changeButtonIconTheme
     * @param  {Object} btnConfig button config
     * @param  {Object} buttonEl  button jQuery element
     */
    _changeButtonIconTheme: function (btnConfig, buttonEl, color) {
        var me = this;
        if (!btnConfig || !btnConfig.activeColour) {
            return;
        }

        if (me._isAllreadyThemedIcon(btnConfig)) {
            var iconCls = me._getBaseIconClass(btnConfig);
            if (btnConfig.__ui && btnConfig.__ui.selected) {
                if (Oskari.util.isLightColor(color)) {
                    btnConfig.__ui.iconThemeClass = iconCls + '-light';
                } else {
                    btnConfig.__ui.iconThemeClass = iconCls + '-dark';
                }
            } else {
                btnConfig.__ui.iconThemeClass = btnConfig.iconCls;
            }
        } else if (Oskari.util.isLightColor(color)) {
            me._setIconThemeClass(btnConfig, 'light');
        } else {
            me._setIconThemeClass(btnConfig, 'dark');
        }
    },

    _deactiveTools: function (pGroup) {
        var me = this;
        for (var groupId in me.buttons) {
            if (!me.buttons.hasOwnProperty(groupId)) {
                continue;
            }
            var toolbarConfig = me.getToolBarConfigs(me.groupsToToolbars[groupId]);
            var groupButtons = me.buttons[groupId];
            for (var toolId in groupButtons) {
                if (groupButtons.hasOwnProperty(toolId)) {
                    var conf = groupButtons[toolId];
                    me._resetToolStyle(null, conf, toolbarConfig);
                }
            }
        }
    },

    _resetToolStyle: function (btn, btnConf, toolbarConf) {
        if (!btnConf) {
            return;
        }
        this._ensureButtonUiState(btnConf);
        btnConf.__ui.selected = false;
        btnConf.__ui.hover = false;
        if (btnConf.activeColour) {
            btnConf.__ui.activeColor = undefined;
            this._removeIconThemes(null, btnConf);
        }
        if (toolbarConf && toolbarConf.colours) {
            this._changeButtonIconTheme(btnConf, null, toolbarConf.colours.background);
        }
        // Change default icon back
        if (btnConf.toggleChangeIcon === true) {
            this._addButtonTheme(btnConf, toolbarConf, null);
        }
    },

    /**
     * @method removeToolButton
     *
     * @param {String}
     *            pId identifier for a button (optional)
     * @param {String}
     *            pGroup identifier for group of buttons
     * @param {String}
     *            pToolbarId identifier for toolbar container
     *
     * Removes a button from the toolbar all whole group of buttons if pId is not defined.
     * Triggered usually by sending Oskari.mapframework.bundle.toolbar.request.RemoveToolButtonRequest.
     */
    removeToolButton: function (pId, pGroup, pToolbarId) {
        if (!pGroup) {
            return;
        }
        var toolbarId = pToolbarId || 'default';
        var prefixedGroup = toolbarId + '-' + pGroup;

        if (!this.buttons[prefixedGroup]) {
            return;
        }
        if (!pId) {
            // delete whole group
            this.buttons[prefixedGroup] = null;
            delete this.buttons[prefixedGroup];
            this._renderToolbar(toolbarId);
            // nothing to do after this
            return;
        }
        // remove individual button
        if (this.buttons[prefixedGroup] && this.buttons[prefixedGroup][pId] && this.buttons[prefixedGroup][pId].children) {
            this.buttons[prefixedGroup][pId].children.remove();
        }
        this.buttons[prefixedGroup][pId] = null;
        delete this.buttons[prefixedGroup][pId];

        var isSelected = (this.selectedButton && this.selectedButton.group && this.selectedButton.id);
        if (isSelected && this.selectedButton.group === prefixedGroup && this.selectedButton.id === pId) {
            this.selectedButton = null;
            delete this.selectedButton;
        }

        // check if no buttons left -> delete group also?
        var count = 0;
        var key;
        for (key in this.buttons[prefixedGroup]) {
            if (this.buttons[prefixedGroup].hasOwnProperty(key)) {
                count++;
            }
        }
        if (count === 0) {
            this.buttons[prefixedGroup] = null;
            delete this.buttons[prefixedGroup];
        }
        this._renderToolbar(toolbarId);
    },
    isToolbarEmpty: function (toolbarId) {
        for (var key in this.buttons) {
            if (key.indexOf(toolbarId) === 0) {
                // if any of the groups startwith toolbarId -> not empty
                return false;
            }
        }
        return true;
    },
    /**
     * @method changeToolButtonState
     *
     * @param {String}
     *            pId identifier for a button (optional)
     * @param {String}
     *            pGroup identifier for group of buttons
     * @param {Boolean}
     *            pState  true if enabled, false to disable
     * @param {String}
     *            pToolbarId identifier for toolbar container
     *
     * Enables/disables a button from the toolbar all whole group of buttons if pId is not defined.
     * Triggered usually by sending Oskari.mapframework.bundle.toolbar.request.ToolButtonStateRequest.
     */
    changeToolButtonState: function (pId, pGroup, pState, pToolbarId) {
        if (!pGroup) {
            return;
        }
        var toolbarId = pToolbarId || 'default';
        var prefixedGroup = toolbarId + '-' + pGroup;
        if (this.buttons[prefixedGroup]) {
            var b;
            if (pId) {
                this.buttons[prefixedGroup][pId].enabled = pState;
                this._ensureButtonUiState(this.buttons[prefixedGroup][pId]);
                this.buttons[prefixedGroup][pId].__ui.disabled = !pState;
            } else {
                for (b in this.buttons[prefixedGroup]) {
                    if (this.buttons[prefixedGroup].hasOwnProperty(b)) {
                        this.buttons[prefixedGroup][b].enabled = pState;
                        this._ensureButtonUiState(this.buttons[prefixedGroup][b]);
                        this.buttons[prefixedGroup][b].__ui.disabled = !pState;
                    }
                }
            }
            this._renderToolbar(toolbarId);
        }
    },

    _ensureButtonUiState: function (buttonConfig) {
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
            buttonConfig.__ui.disabled = (buttonConfig.enabled === false);
        }
    },

    _getBaseIconClass: function (btnConfig) {
        if (!btnConfig || !btnConfig.iconCls) {
            return '';
        }
        var iconCls = btnConfig.iconCls;
        if (iconCls.indexOf('-light') > -1) {
            return iconCls.substring(0, iconCls.indexOf('-light'));
        }
        if (iconCls.indexOf('-dark') > -1) {
            return iconCls.substring(0, iconCls.indexOf('-dark'));
        }
        return iconCls;
    },

    _setIconThemeClass: function (btnConfig, iconEnd) {
        this._ensureButtonUiState(btnConfig);
        var iconCls = this._getBaseIconClass(btnConfig);
        btnConfig.__ui.iconThemeClass = iconCls + '-' + iconEnd;
    },

    _collectToolbarGroups: function (toolbarId) {
        var prefix = toolbarId + '-';
        var groups = [];
        for (var groupId in this.buttons) {
            if (!this.buttons.hasOwnProperty(groupId)) {
                continue;
            }
            if (groupId.indexOf(prefix) !== 0) {
                continue;
            }
            var items = [];
            var buttonMap = this.buttons[groupId];
            for (var buttonId in buttonMap) {
                if (!buttonMap.hasOwnProperty(buttonId)) {
                    continue;
                }
                var button = buttonMap[buttonId];
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
            groups.push({
                id: groupId,
                buttons: items
            });
        }
        return groups;
    },

    _renderToolbar: function (toolbarId) {
        var tbid = toolbarId || 'default';
        var container = this.containers[tbid];
        if (!container || !container.length || !container[0]) {
            return;
        }
        var groups = this._collectToolbarGroups(tbid);
        getReactRoot(container[0]).render(
            <Toolbar
                groups={groups}
                onButtonClick={(buttonId, groupId) => this._clickButton(buttonId, groupId)}
                onButtonEnter={(buttonId, groupId) => this._onButtonMouseEnter(buttonId, groupId)}
                onButtonLeave={(buttonId, groupId) => this._onButtonMouseLeave(buttonId, groupId)}
            />
        );
    },

    _renderAllToolbars: function () {
        for (var toolbarId in this.containers) {
            if (this.containers.hasOwnProperty(toolbarId)) {
                this._renderToolbar(toolbarId);
            }
        }
    },

    _unmountToolbar: function (toolbarId) {
        var tbid = toolbarId || 'default';
        var container = this.containers[tbid];
        if (!container || !container.length || !container[0]) {
            return;
        }
        unmountReactRoot(container[0]);
    },

    _onButtonMouseEnter: function (pId, pGroup) {
        var btn = this.buttons[pGroup] && this.buttons[pGroup][pId];
        if (!btn) {
            return;
        }
        this._ensureButtonUiState(btn);
        btn.__ui.hover = true;
        if (!btn.__ui.selected && !btn.__ui.disabled) {
            var toolbarConfig = this.getToolBarConfigs(this.groupsToToolbars[pGroup]);
            this._addHoverIcon(btn, toolbarConfig);
        }
        this._renderToolbar(this.groupsToToolbars[pGroup] || 'default');
    },

    _onButtonMouseLeave: function (pId, pGroup) {
        var btn = this.buttons[pGroup] && this.buttons[pGroup][pId];
        if (!btn) {
            return;
        }
        this._ensureButtonUiState(btn);
        btn.__ui.hover = false;
        if (!btn.__ui.selected && !btn.__ui.disabled) {
            var toolbarConfig = this.getToolBarConfigs(this.groupsToToolbars[pGroup]);
            this._addButtonTheme(btn, toolbarConfig);
        }
        this._renderToolbar(this.groupsToToolbars[pGroup] || 'default');
    }
});
