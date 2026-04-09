import './instance';

const CLASS_NAME = 'Oskari.mapframework.bundle.toolbar.ToolbarBundleInstance';

const createInstance = () => Oskari.clazz.create(CLASS_NAME);

describe('ToolbarBundleInstance React migration helpers', () => {
    test('changeToolButtonState updates internal disabled ui state', () => {
        const instance = createInstance();
        instance.buttons = {
            'default-basictools': {
                select: {
                    iconCls: 'tool-pan',
                    enabled: true,
                    callback: () => {}
                }
            }
        };

        instance.changeToolButtonState('select', 'basictools', false, 'default');

        expect(instance.buttons['default-basictools'].select.enabled).toBe(false);
        expect(instance.buttons['default-basictools'].select.__ui.disabled).toBe(true);
    });

    test('_collectToolbarGroups serializes buttons for React rendering', () => {
        const instance = createInstance();
        instance.buttons = {
            'default-basictools': {
                select: {
                    iconCls: 'tool-pan',
                    tooltip: 'Pan',
                    toggleChangeIcon: true,
                    callback: () => {},
                    __ui: {
                        selected: true,
                        disabled: false,
                        hover: false,
                        activeColor: '#212121',
                        iconThemeClass: 'tool-pan-dark'
                    }
                }
            }
        };

        const groups = instance._collectToolbarGroups('default');

        expect(groups).toHaveLength(1);
        expect(groups[0].id).toBe('default-basictools');
        expect(groups[0].buttons).toHaveLength(1);
        expect(groups[0].buttons[0]).toEqual(expect.objectContaining({
            id: 'select',
            domId: 'oskari_toolbar_basictools_select',
            iconCls: 'tool-pan',
            iconClassName: 'tool-pan-dark',
            selected: true,
            disabled: false,
            activeColor: '#212121'
        }));
    });

    test('_updateToolbar recalculates themed icon classes using toolbar colors', () => {
        const instance = createInstance();
        instance._renderToolbar = jest.fn();
        instance._toolbarConfigs = {
            default: {
                createdHover: false,
                colours: {
                    hover: '#3c3c3c',
                    background: '#333438'
                }
            }
        };
        instance.buttons = {
            'default-basictools': {
                select: {
                    iconCls: 'tool-pan',
                    toggleChangeIcon: false,
                    callback: () => {},
                    __ui: {
                        selected: false,
                        activeColor: '#000000'
                    }
                },
                measureline: {
                    iconCls: 'tool-measure-line',
                    toggleChangeIcon: true,
                    callback: () => {},
                    __ui: {
                        selected: true,
                        activeColor: '#ffffff'
                    }
                }
            }
        };

        instance._updateToolbar('default', {
            colours: {
                hover: '#2d2d2d',
                background: '#101010'
            }
        });

        expect(instance.buttons['default-basictools'].select.__ui.iconThemeClass).toBe('tool-pan-dark');
        expect(instance.buttons['default-basictools'].measureline.__ui.iconThemeClass).toBe('tool-measure-line-light');
        expect(instance._renderToolbar).toHaveBeenCalledWith('default');
    });

    test('setState marks button selected and invokes callback', () => {
        const instance = createInstance();
        const callback = jest.fn();
        instance._deactiveTools = jest.fn();
        instance._renderAllToolbars = jest.fn();
        instance.buttons = {
            'default-basictools': {
                select: {
                    iconCls: 'tool-pan',
                    callback
                }
            }
        };

        instance.setState({
            selected: {
                id: 'select',
                group: 'default-basictools'
            }
        });

        expect(instance.buttons['default-basictools'].select.__ui.selected).toBe(true);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(instance._renderAllToolbars).toHaveBeenCalledTimes(1);
    });
});
