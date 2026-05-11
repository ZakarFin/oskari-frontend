Oskari.clazz.category('Oskari.mapframework.bundle.toolbar.ToolbarBundleInstance', 'button-methods', {

    /**
     * @method addToolButton
     * Delegates to ToolbarHandler. Also ensures the toolbar DOM container exists and
     * wires up any jQuery child-element positioning that requires a live DOM.
     */
    addToolButton: function (pId, pGroup, pConfig) {
        // Ensure the DOM container (and toolbar config) exists first.
        this.getToolbarContainer(pConfig ? pConfig.toolbarid : null, pConfig);
        var alreadyAdded = this.handler.addToolButton(pId, pGroup, pConfig);
        if (alreadyAdded && pConfig && pConfig.childPosition) {
            this._checkToolChildrenPosition(pId, pGroup, pConfig);
        }
        if (!alreadyAdded && pConfig && pConfig.childPosition) {
            this._createButtonChildren(pId, pGroup, null, pConfig);
            this._checkToolChildrenPosition(pId, pGroup, pConfig);
        }
    },

    /**
     * Delegates to ToolbarHandler.
     */
    removeToolButton: function (pId, pGroup, pToolbarId) {
        this.handler.removeToolButton(pId, pGroup, pToolbarId);
    },

    /**
     * Delegates to ToolbarHandler.
     */
    changeToolButtonState: function (pId, pGroup, pState, pToolbarId) {
        this.handler.changeToolButtonState(pId, pGroup, pState, pToolbarId);
    },

    /**
     * Delegates to ToolbarHandler.
     */
    isToolbarEmpty: function (toolbarId) {
        return this.handler.isToolbarEmpty(toolbarId);
    },

    /**
     * Programmatic button click - delegates to ToolbarHandler.
     * @private
     */
    _clickButton: function (pId, pGroup) {
        this.handler.clickButton(pId, pGroup);
    },

    /**
     * DOM helper: positions jQuery child-element popups based on toolbar/button offset.
     * @private
     */
    _checkToolChildrenPosition: function (pId, pGroup, pConfig) {
        var prefixedGroup = (pConfig.toolbarid || 'default') + '-' + pGroup;
        var btn = this.handler.getState().buttons[prefixedGroup][pId];
        var toolbar = this.getToolbarContainer(pConfig ? pConfig.toolbarid : null, pConfig);
        var toolbarParent = toolbar.parents('.oskariui-center').find('div').first();
        var offset = toolbarParent.offset();
        var group = toolbar.find('div.toolrow[data-tbgroup=' + prefixedGroup + ']');
        var button = group.find('div.tool[data-tool=' + pId + ']');

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

    /**
     * DOM helper: creates and appends a detached jQuery child container for a button.
     * The reference is stored back on the button config so handler code can use it.
     * @private
     */
    _createButtonChildren: function (pId, pGroup, button, pConfig) {
        var toolbar = this.getToolbarContainer(pConfig ? pConfig.toolbarid : null, pConfig);
        var toolbarTopParent = toolbar.parents('.oskariui-center');
        var prefixedGroup = (pConfig.toolbarid || 'default') + '-' + pGroup;
        var btn = this.handler.getState().buttons[prefixedGroup][pId];
        var children = jQuery('<div class="tool-children"></div>');

        children.attr({
            'data-button-id': pId,
            'data-group-id': pGroup
        });
        toolbarTopParent.append(children);
        children.hide();
        // Store on button config so handler and React rendering can reference it.
        btn.children = children;
    },

    /**
     * Mouse enter handler - delegates to handler for state update and re-render.
     * @private
     */
    _onButtonMouseEnter: function (pId, pGroup) {
        this.handler.onButtonMouseEnter(pId, pGroup);
        this._renderAllToolbars();
    },

    /**
     * Mouse leave handler - delegates to handler for state update and re-render.
     * @private
     */
    _onButtonMouseLeave: function (pId, pGroup) {
        this.handler.onButtonMouseLeave(pId, pGroup);
        this._renderAllToolbars();
    }
});

