
let LAYERS = {};
let GROUPS = {};

const oskariLayerToInternal = (oskariLayer) => {
    return {
        id: oskariLayer.getId(),
        name: oskariLayer.getName(),
        provider: oskariLayer.getOrganizationName(),
        groups: oskariLayer.getGroups() || []
    };
}

const setLayers = (layers = []) => {
    layers
        .map(oskariLayerToInternal)
        .forEach(layer => {
            LAYERS[layer.id] = layer;
        });
};

/*
[{
    "orderNumber": 1000000,
    "selectable": true,
    "name": {
        "fi": "Koordinaattijärjestelmät",
        "sv": "Referenskoordinatsystem",
        "en": "Coordinate reference systems"
    },
    "layers": [
        {
            "orderNumber": 1000000,
            "id": 147
        }
    ],
    "id": 38,
    "parentId": -1,
    "groups": [
        {
            "orderNumber": -1,
            "selectable": true,
            "name": {
                "fi": "koivut",
                "sv": "koivut",
                "en": "koivut"
            },
            "layers": [
                {
                    "orderNumber": 1000000,
                    "id": 3231
                },
                {
                    "orderNumber": 1000000,
                    "id": 118
                }
            ],
            "id": 45,
            "parentId": 41
        }
    ]
}
},...]
*/
const setGroups = (groups = []) => {
    groups.forEach(group => {
        // TODO: mapping relevant data
        GROUPS[group.id] = {
            id: group.id,
            parentId: group.parentId,
            orderNumber: group.orderNumber,
            name: Oskari.getLocalized(group.name),
            layers: group.layers.map(layer => layer.id)
        };
        if (Array.isArray(group.groups)) {
            GROUPS[group.id].groups = group.groups.map(subgroup => subgroup.id);
            // recurse into subgroups
            setGroups(group.groups);
        } else {
            // ensure there's an empty array for subgroups
            group.groups = [];
        }
    });
};

const getRootGroups = () => getGroupsByParent(-1);
const getGroupsByParent = (parent = -1) => {
    const groups = Object.keys(GROUPS)
        .filter(id => GROUPS[id].parentId === parent)
        .map(id => {
            const group = GROUPS[id];
            group.layers = group.layers.map(id => LAYERS[id]);
            return group;
        });
    return groups;
};

const getGroups = () => {
    return getRootGroups().map(group => {
        // inject subgroups to structure for rendering
        group.groups = group.groups.map(getGroupsByParent(group.id))
        return group;
    });
};

const getLayersForDataProvider = (provider) => {
    return Object.keys(LAYERS)
        .filter(id => LAYERS[id].provider === provider)
        .map(id => LAYERS[id])
        .sort((a,b) => Oskari.util.naturalSort(a.name, b.name));
};

const getDataProviders = () => {
    const names = new Set();
    Object.keys(LAYERS).forEach(id => {
        names.add(LAYERS[id].provider);
    });
    return names.map(name => {
        return {
            id: Oskari.seq.next(),
            parentId: -1,
            name,
            layers: getLayersForDataProvider(name),
            groups: [],
            orderNumber: 100
        };
    }).sort((a,b) => Oskari.util.naturalSort(a.name, b.name));
}

export const LayerService = {
    setLayers,
    setGroups,
    getGroups,
    getDataProviders
};
