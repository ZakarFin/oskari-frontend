import './instance';

const CLASS_NAME = 'Oskari.mapframework.bundle.toolbar.ToolbarBundleInstance';

const createInstance = () => Oskari.clazz.create(CLASS_NAME);

describe('ToolbarBundleInstance with handler-based state', () => {
    test('changeToolButtonState delegates to handler', () => {
        const instance = createInstance();
        instance.handler = {
            changeToolButtonState: jest.fn()
        };

        instance.changeToolButtonState('select', 'basictools', false, 'default');

        expect(instance.handler.changeToolButtonState).toHaveBeenCalledWith('select', 'basictools', false, 'default');
    });

    test('setState delegates selected state restoration to handler and rerenders', () => {
        const instance = createInstance();
        instance._renderAllToolbars = jest.fn();
        instance.handler = {
            setBundleState: jest.fn()
        };
        const state = {
            selected: {
                id: 'select',
                group: 'default-basictools'
            }
        };

        instance.setState(state);

        expect(instance.handler.setBundleState).toHaveBeenCalledWith(state);
        expect(instance._renderAllToolbars).toHaveBeenCalledTimes(1);
    });

    test('setState without selected still rerenders but does not call handler.setBundleState', () => {
        const instance = createInstance();
        instance._renderAllToolbars = jest.fn();
        instance.handler = {
            setBundleState: jest.fn()
        };

        instance.setState({});

        expect(instance.handler.setBundleState).not.toHaveBeenCalled();
        expect(instance._renderAllToolbars).toHaveBeenCalledTimes(1);
    });

    test('getState reads selected button from handler', () => {
        const instance = createInstance();
        instance.handler = {
            getSelectedButton: jest.fn(() => ({
                id: 'select',
                group: 'default-basictools'
            }))
        };

        const state = instance.getState();

        expect(instance.handler.getSelectedButton).toHaveBeenCalledTimes(1);
        expect(state).toEqual({
            selected: {
                id: 'select',
                group: 'default-basictools'
            }
        });
    });
});
