import { StateHandler, controllerMixin } from 'oskari-ui/util';

class ViewHandler extends StateHandler {
    constructor (instance) {
        super();
        this.instance = instance;
        this.sandbox = instance.getSandbox();
        this.state = {
            layers: this._getLayers()
        };
    }

    _getLayers () {
        return [...this.sandbox.findAllSelectedMapLayers()].reverse();
    }

    updateLayers () {
        this.updateState({ layers: this._getLayers() });
    }

    updateVisibilityInfo (event) {
        // trigger change
        this.updateState({});
    }

    reorderLayers (fromPosition, toPosition) {
        if (isNaN(fromPosition)) {
            throw new Error('reorderLayers: fromPosition is Not a Number: ' + fromPosition);
        }
        if (isNaN(toPosition)) {
            throw new Error('reorderLayers: toPosition is Not a Number: ' + toPosition);
        }
        if (fromPosition === toPosition) {
            // Layer wasn't actually moved, ignore
            return;
        }
        const layers = [...this.state.layers];
        if (fromPosition >= layers.length) {
            return;
        }
        if (toPosition >= layers.length) {
            return;
        }
        const layer = layers.splice(fromPosition, 1)[0];
        layers.splice(toPosition, 0, layer);
        this.updateState({ layers });

        // the layer order is reversed in presentation
        // the lowest layer has the highest index
        const toDataPosition = (layers.length - 1) - toPosition;
        this.sandbox.postRequestByName('RearrangeSelectedMapLayerRequest', [layer.getId(), toDataPosition]);
    }

    toggleLayerVisibility (layer) {
        const visibility = layer.isVisible();
        this.sandbox.postRequestByName('MapModulePlugin.MapLayerVisibilityRequest', [layer.getId(), !visibility]);
    }

    changeOpacity (layer, opacity) {
        if (opacity === '') {
            opacity = 0;
        }
        this.sandbox.postRequestByName('ChangeMapLayerOpacityRequest', [layer.getId(), opacity]);
    }

    removeLayer (layer) {
        this.sandbox.postRequestByName('RemoveMapLayerRequest', [layer.getId()]);
    }

    changeLayerStyle (layer, styleName) {
        this.sandbox.postRequestByName('ChangeMapLayerStyleRequest', [layer.getId(), styleName]);
    }

    locateLayer (layer, zoomToExtent) {
        this.sandbox.postRequestByName('MapModulePlugin.MapMoveByLayerContentRequest', [layer.getId(), zoomToExtent]);
    }
}

export const SelectedLayersHandler = controllerMixin(ViewHandler, [
    'reorderLayers',
    'removeLayer',
    'changeOpacity',
    'toggleLayerVisibility',
    'changeLayerStyle',
    'locateLayer'
]);
