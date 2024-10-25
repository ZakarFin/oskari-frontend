import { AbstractStatsPluginTool } from './AbstractStatsPluginTool';

class ClassificationToggleTool extends AbstractStatsPluginTool {
    constructor (...args) {
        super(...args);
        this.index = 3;
        this.id = 'classification';
    }
};

// Attach protocol to make this discoverable by Oskari publisher
Oskari.clazz.defineES('Oskari.mapframework.publisher.tool.ClassificationToggleTool',
    ClassificationToggleTool,
    {
        protocol: ['Oskari.mapframework.publisher.Tool']
    }
);
