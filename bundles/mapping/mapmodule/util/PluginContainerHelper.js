
export const PLUGIN_CONTAINER_CLASSES = [
    'bottom center',
    'center top',
    'center right',
    'center left',
    'bottom right',
    'bottom left',
    'right top',
    'left top'
];

export const createPluginContainerElement = (containerClasses) => {
    const containerDiv = jQuery(
        `<div class="mapplugins">
            <div class="mappluginsContainer">
            <div class="mappluginsContent"></div>
            </div>
        </div>`);

    containerDiv.addClass(containerClasses);
    containerDiv.attr('data-location', containerClasses);
    return containerDiv;
};

// assumes jQuery is present and mapEl is a jQuery object to #mapdiv
export const generatePluginContainers = (mapEl) => {
    PLUGIN_CONTAINER_CLASSES
        .map(cssClasses => createPluginContainerElement(cssClasses))
        .forEach(jQueryEl => mapEl.append(jQueryEl));
};
