export const COVERAGE_LAYER_ID = 'LayerListCoverageLayer';
const COVERAGE_FEATURE_STYLE = {
    stroke: {
        color: 'rgba(211, 187, 27, 0.8)',
        width: 2
    },
    fill: {
        color: 'rgba(255,222,0, 0.6)'
    }
};
const LOCALIZATION_BUNDLE_ID = 'MapModule';

export class CoverageHelper {
    addCoverageTool (layer) {
        const coverageTool = Oskari.clazz.create('Oskari.mapframework.domain.Tool');
        coverageTool.setName('coverageTool');
        coverageTool.setTitle(Oskari.getMsg(LOCALIZATION_BUNDLE_ID, 'layerCoverageTool.name'));
        coverageTool.setCallback(() => this.showLayerCoverage(layer));
        layer.addTool(coverageTool);

        this.initCoverageToolPlugin();
    }

    initCoverageToolPlugin () {
        const mapModule = Oskari.getSandbox().findRegisteredModuleInstance('MainMapModule');
        if (!this.pluginAlreadyRegistered(mapModule, 'CoverageToolPlugin')) {
            const coverageToolPlugin = Oskari.clazz.create('Oskari.mapframework.bundle.mapmodule.plugin.CoverageToolPlugin');
            mapModule.registerPlugin(coverageToolPlugin);
            mapModule.startPlugin(coverageToolPlugin);
        }
    }

    pluginAlreadyRegistered (mapModule, pluginName) {
        const allInstances = mapModule.getPluginInstances();
        return !!allInstances && !!allInstances[pluginName];
    }

    clearLayerCoverage () {
        Oskari.getSandbox().postRequestByName('MapModulePlugin.RemoveFeaturesFromMapRequest', [null, null, COVERAGE_LAYER_ID]);
    }

    showLayerCoverage (layer) {
        this.clearLayerCoverage();
        const opts = {
            centerTo: true,
            clearPrevious: true,
            layerId: COVERAGE_LAYER_ID,
            featureStyle: COVERAGE_FEATURE_STYLE
        };
        Oskari.getSandbox().postRequestByName('MapModulePlugin.AddFeaturesToMapRequest', [layer.getGeometryWKT(), opts]);
    }
}