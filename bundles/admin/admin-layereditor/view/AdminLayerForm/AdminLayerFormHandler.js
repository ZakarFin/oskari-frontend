import React from 'react';
import { openNotification } from 'oskari-ui';
import { stringify } from 'query-string';
import { getLayerHelper } from '../LayerHelper';
import { StateHandler, controllerMixin } from 'oskari-ui/util';
import { handlePermissionForAllRoles, handlePermissionForSingleRole, roleAll } from './PermissionUtil';
import { returnOrUpdate } from 'ol/extent';

const LayerComposingModel = Oskari.clazz.get('Oskari.mapframework.domain.LayerComposingModel');

class UIHandler extends StateHandler {
    constructor (consumer) {
        super();
        this.mapLayerService = Oskari.getSandbox().getService('Oskari.mapframework.service.MapLayerService');
        this.mapLayerService.on('availableLayerTypesUpdated', () => this.updateLayerTypeVersions());
        this.log = Oskari.log('AdminLayerFormHandler');
        this.loadingCount = 0;
        this.layerHelper = getLayerHelper();
        this.setState({
            layer: {},
            layerTypes: this.mapLayerService.getLayerTypes(),
            versions: [],
            propertyFields: [],
            capabilities: {},
            messages: [],
            loading: false,
            credentialsCollapseOpen: false
        });
        this.addStateListener(consumer);
        this.fetchRolesAndPermissionTypes();
    }

    updateLayerTypeVersions () {
        const { layer } = this.getState();
        this.updateState({
            layerTypes: this.mapLayerService.getLayerTypes(),
            versions: this.mapLayerService.getVersionsForType(layer.type)
        });
    }
    setType (type) {
        this.updateState({
            layer: { ...this.getState().layer, type },
            versions: this.mapLayerService.getVersionsForType(type)
        });
    }
    setLayerUrl (url) {
        this.updateState({
            layer: { ...this.getState().layer, url }
        });
    }
    setVersion (version) {
        const layer = { ...this.getState().layer, version };
        if (!version) {
            // for moving back to previous step
            this.updateState({ layer, capabilities: {}, propertyFields: [] });
            return;
        }
        const composingModel = this.mapLayerService.getComposingModelForType(layer.type);
        const propertyFields = composingModel ? composingModel.getPropertyFields(version) : [];
        if (!propertyFields.includes(LayerComposingModel.CAPABILITIES)) {
            this.updateState({ layer, propertyFields });
            return;
        };
        this.fetchCapabilities(version);
    }
    layerSelected (name) {
        const { capabilities, layer } = this.getState();
        if (!capabilities || !capabilities.layers) {
            this.log.error('Capabilities not available. Tried to select layer: ' + name);
            return;
        }
        const found = capabilities.layers[name];
        if (found) {
            const updateLayer = this.layerHelper.fromServer({ ...layer, ...found });
            const { type, version } = updateLayer;
            const composingModel = this.mapLayerService.getComposingModelForType(type);
            this.updateState({
                layer: updateLayer,
                propertyFields: composingModel ? composingModel.getPropertyFields(version) : []
            });
        } else {
            this.log.error('Layer not in capabilities: ' + name);
        }
    }
    setUsername (username) {
        this.updateState({
            layer: { ...this.getState().layer, username }
        });
    }
    setPassword (password) {
        this.updateState({
            layer: { ...this.getState().layer, password }
        });
    }
    setLayerName (name) {
        this.updateState({
            layer: { ...this.getState().layer, name }
        });
    }
    setSelectedTime (selectedTime) {
        const layer = { ...this.getState().layer };
        if (!layer.params) {
            layer.params = {};
        }
        layer.params.selectedTime = selectedTime;
        this.updateState({ layer });
    }
    setRealtime (realtime) {
        this.updateState({
            layer: { ...this.getState().layer, realtime }
        });
    }
    setRefreshRate (refreshRate) {
        this.updateState({
            layer: { ...this.getState().layer, refreshRate }
        });
    }
    setCapabilitiesUpdateRate (capabilitiesUpdateRate) {
        this.updateState({
            layer: { ...this.getState().layer, capabilitiesUpdateRate }
        });
    }
    setForcedSRS (forcedSRS) {
        const layer = { ...this.getState().layer };
        let attributes = layer.attributes || {};
        if (!Array.isArray(forcedSRS) || forcedSRS.length === 0) {
            delete attributes.forcedSRS;
        } else {
            attributes = { ...attributes, forcedSRS };
        }
        this.updateLayerAttributes(attributes, layer);
    }
    setLocalizedNames (locale) {
        this.updateState({
            layer: { ...this.getState().layer, locale }
        });
    }
    setDataProviderId (dataProviderId) {
        this.updateState({
            layer: { ...this.getState().layer, dataProviderId }
        });
    }
    setGroup (checked, group) {
        const layer = { ...this.getState().layer };
        if (checked) {
            layer.groups = Array.from(new Set([...layer.groups, group.id]));
        } else {
            const found = layer.groups.find(cur => cur === group.id);
            if (found) {
                layer.groups = [...layer.groups];
                layer.groups.splice(layer.groups.indexOf(found), 1);
            }
        }
        this.updateState({ layer });
    }
    setOpacity (opacity) {
        this.updateState({
            layer: { ...this.getState().layer, opacity }
        });
    }
    setClusteringDistance (clusteringDistance) {
        const layer = { ...this.getState().layer };
        layer.options.clusteringDistance = clusteringDistance;
        this.updateState({ layer });
    }
    setRenderMode (renderMode) {
        const layer = { ...this.getState().layer };
        layer.options.renderMode = renderMode;
        this.updateState({ layer });
    }
    setMinAndMaxScale (values) {
        this.updateState({
            layer: {
                ...this.getState().layer,
                maxscale: values[0],
                minscale: values[1]
            }
        });
    }
    setStyle (style) {
        this.updateState({
            layer: { ...this.getState().layer, style }
        });
    }
    setStyleJSON (json) {
        this.updateOptionsJsonProperty(json, 'tempStylesJSON', 'styles');
    }
    setExternalStyleJSON (json) {
        this.updateOptionsJsonProperty(json, 'tempExternalStylesJSON', 'externalStyles');
    }
    setHoverJSON (json) {
        this.updateOptionsJsonProperty(json, 'tempHoverJSON', 'hover');
    }
    updateOptionsJsonProperty (json, jsonPropKey, dataPropKey) {
        const layer = { ...this.getState().layer };
        layer[jsonPropKey] = json;
        if (json === '') {
            delete layer.options[dataPropKey];
            this.updateState({ layer });
            return;
        }
        try {
            layer.options[dataPropKey] = JSON.parse(json);
        } catch (err) {
            // Don't update the form data, just the temporary input.
        }
        this.updateState({ layer });
    }
    setMetadataIdentifier (metadataid) {
        this.updateState({
            layer: { ...this.getState().layer, metadataid }
        });
    }
    setLegendImage (legendImage) {
        this.updateState({
            layer: { ...this.getState().layer, legendImage }
        });
    }
    setGfiContent (gfiContent) {
        this.updateState({
            layer: { ...this.getState().layer, gfiContent }
        });
    }
    setGfiType (gfiType) {
        this.updateState({
            layer: { ...this.getState().layer, gfiType }
        });
    }
    setGfiXslt (gfiXslt) {
        this.updateState({
            layer: { ...this.getState().layer, gfiXslt }
        });
    }
    setQueryFormat (value) {
        const layer = { ...this.getState().layer };
        if (!layer.format) {
            layer.format = {};
        }
        layer.format.value = value;
        this.updateState({ layer });
    }
    setAttributes (tempAttributesJSON) {
        const layer = { ...this.getState().layer, tempAttributesJSON };
        let tempAttributes = {};
        try {
            tempAttributes = JSON.parse(tempAttributesJSON);
        } catch (err) { }

        const isEmpty = Object.keys(tempAttributes).length === 0;
        if (isEmpty && !layer.attributes) {
            this.updateState({ layer });
            return;
        }
        if (!isEmpty) {
            // format text input
            layer.tempAttributesJSON = this.layerHelper.toJson(tempAttributes);
        }

        // Delete missing attibute keys but keep managed attributes
        const managedAttributes = ['forcedSRS'];
        Object.keys(layer.attributes)
            .filter(key => !managedAttributes.includes(key))
            .forEach(key => delete layer.attributes[key]);

        this.updateLayerAttributes({ ...layer.attributes, ...tempAttributes }, layer);
    }
    updateLayerAttributes (attributes, layer = { ...this.getState().layer }) {
        layer.attributes = attributes;
        // Update text input
        if (layer.tempAttributesJSON) {
            try {
                if (typeof JSON.parse(layer.tempAttributesJSON) === 'object') {
                    layer.tempAttributesJSON = this.layerHelper.toJson(layer.attributes);
                }
            } catch (err) {
                // Don't override the user input. The user might lose some data.
            }
        }
        this.updateState({ layer });
    }
    setMessage (key, type) {
        this.updateState({
            messages: [{ key, type }]
        });
    }
    setMessages (messages) {
        this.updateState({ messages });
    }
    resetLayer () {
        this.updateState({
            layer: this.layerHelper.createEmpty(),
            capabilities: {},
            versions: [],
            propertyFields: []
        });
    }
    ajaxStarted () {
        this.updateLoadingState(true);
    }
    ajaxFinished () {
        this.updateLoadingState(false);
    }
    updateLoadingState (loadingStarted) {
        if (loadingStarted) {
            this.loadingCount++;
        } else {
            this.loadingCount--;
        }
        this.updateState({
            loading: this.isLoading()
        });
    }

    // http://localhost:8080/action?action_route=LayerAdmin&id=889
    fetchLayer (id) {
        this.clearMessages();
        if (!id) {
            this.resetLayer();
            return;
        }
        this.ajaxStarted();
        fetch(Oskari.urls.getRoute('LayerAdmin', { id }), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            this.ajaxFinished();
            if (!response.ok) {
                this.setMessage('TODO', 'error');
            }
            return response.json();
        }).then(json => {
            const layer = this.layerHelper.fromServer(json.layer, {
                preserve: ['capabilities']
            });
            const { capabilities, type, version } = layer;
            delete layer.capabilities;
            const composingModel = this.mapLayerService.getComposingModelForType(type);
            this.updateState({
                layer,
                capabilities,
                propertyFields: composingModel ? composingModel.getPropertyFields(version) : []
            });
        });
    }

    saveLayer () {
        const notImplementedYet = true;
        const validationErrorMessages = this.validateUserInputValues(this.getState().layer);
        if (validationErrorMessages.length > 0) {
            this.setMessages(validationErrorMessages);
            return;
        }
        // Take a copy
        const layer = { ...this.getState().layer };
        // Modify layer for backend
        const layerPayload = this.layerHelper.toServer(layer);

        if (notImplementedYet) {
            const jsonOut = JSON.stringify(layerPayload, null, 2);
            console.log(jsonOut);
            openNotification('info', {
                message: 'Save not implemented yet',
                key: 'admin-layer-save',
                description: (
                    <div style={{ maxHeight: 700, overflow: 'auto' }}>
                        <pre>{jsonOut}</pre>
                    </div>
                ),
                duration: null,
                placement: 'topRight',
                top: 30,
                style: {
                    width: 500,
                    marginLeft: -400
                }
            });
            return;
        }
        // TODO Reconsider using fetch directly here.
        // Maybe create common ajax request handling for Oskari?

        // FIXME: This should use LayerAdmin route and map the layer for payload properly before we can use it
        fetch(Oskari.urls.getRoute('SaveLayer'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stringify(layerPayload)
        }).then(response => {
            if (response.ok) {
                this.setMessage('messages.saveSuccess', 'success');
                return response.json();
            } else {
                this.setMessage('messages.saveFailed', 'error');
                return Promise.reject(Error('Save failed'));
            }
        }).then(data => {
            if (layer.id) {
                data.groups = layer.groups;
                this.updateLayer(layer.id, data);
            } else {
                this.createlayer(data);
            }
        }).catch(error => this.log.error(error));
    }

    updateLayer (layerId, layerData) {
        this.mapLayerService.updateLayer(layerId, layerData);
    }

    createlayer (layerData) {
        // TODO: Test this method when layer creation in tested with new wizard
        const mapLayer = this.mapLayerService.createMapLayer(layerData);

        if (layerData.baseLayerId) {
            // If this is a sublayer, add it to its parent's sublayer array
            this.mapLayerService.addSubLayer(layerData.baseLayerId, mapLayer);
        } else {
            // Otherwise just add it to the map layer service.
            if (this.mapLayerService._reservedLayerIds[mapLayer.getId()] !== true) {
                this.mapLayerService.addLayer(mapLayer);
            } else {
                this.setMessage('messages.errorInsertAllreadyExists', 'error');
                // should we update if layer already exists??? mapLayerService.updateLayer(e.layerData.id, e.layerData);
            }
        }
    }

    validateUserInputValues (layer) {
        const validationErrors = [];
        this.validateJsonValue(layer.tempStylesJSON, 'validation.styles', validationErrors);
        this.validateJsonValue(layer.tempExternalStylesJSON, 'validation.externalStyles', validationErrors);
        this.validateJsonValue(layer.tempHoverJSON, 'validation.hover', validationErrors);
        this.validateJsonValue(layer.tempAttributesJSON, 'validation.attributes', validationErrors);
        return validationErrors;
    }

    validateJsonValue (value, msgKey, validationErrors) {
        if (value === '' || typeof value === 'undefined') {
            return;
        }
        try {
            const result = JSON.parse(value);
            if (typeof result !== 'object') {
                validationErrors.push({ key: msgKey, type: 'error' });
            }
        } catch (error) {
            validationErrors.push({ key: msgKey, type: 'error' });
        }
    }

    deleteLayer () {
        // FIXME: This should use LayerAdmin route instead but this probably works anyway
        const { layer } = this.getState();
        fetch(Oskari.urls.getRoute('DeleteLayer'), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stringify(layer)
        }).then(response => {
            if (response.ok) {
                // TODO handle this, just close the flyout?
            } else {
                this.setMessage('messages.errorRemoveLayer', 'error');
            }
            return response;
        });
    }

    /*
        Calls action route like:
        http://localhost:8080/action?action_route=LayerAdmin&url=https://my.domain/geoserver/ows&type=wfslayer&version=1.1.0
    */
    fetchCapabilities (version) {
        this.ajaxStarted();
        const { layer } = this.getState();
        var params = {
            type: layer.type,
            version: version,
            url: layer.url,
            user: layer.username,
            pw: layer.password
        };

        // Remove undefined params
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        fetch(Oskari.urls.getRoute('LayerAdmin', params), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            this.ajaxFinished();
            if (response.ok) {
                const composingModel = this.mapLayerService.getComposingModelForType(layer.type);
                this.updateState({
                    layer: { ...this.getState().layer, version },
                    propertyFields: composingModel ? composingModel.getPropertyFields(version) : []
                });
                return response.json();
            } else {
                if (response.status === 401) {
                    this.setMessage('messages.unauthorizedErrorFetchCapabilities', 'warning');
                    this.updateState({ credentialsCollapseOpen: true });
                } else {
                    this.setMessage('messages.errorFetchCapabilities', 'error');
                }
                return Promise.reject(new Error('Capabilities fetching failed with status code ' + response.status + ' and text ' + response.statusText));
            }
        }).then(json => {
            this.updateState({
                capabilities: json || {}
            });
        }).catch(error => {
            this.log.error(error);
        });
    }

    fetchRolesAndPermissionTypes () {
        this.ajaxStarted();
        fetch(Oskari.urls.getRoute('GetAllRolesAndPermissionTypes'))
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return Promise.reject(new Error('Fetching user roles and permission types failed'));
                }
            }).then(data => {
                this.loadingCount--;
                this.updateState({
                    loading: this.isLoading(),
                    rolesAndPermissionTypes: data
                });
            }).catch(error => {
                this.log.error(error);
                this.setMessage('messages.errorFetchUserRolesAndPermissionTypes', 'error');
            });
    }

    getRolesAndPermissionTypes () {
        return this.getState().rolesAndPermissionTypes;
    };

    isLoading () {
        return this.loadingCount > 0;
    }
    clearMessages () {
        this.updateState({
            messages: []
        });
    }

    clearCredentialsCollapse () {
        this.updateState({ credentialsCollapseOpen: false });
    }

    handlePermission (checked, role, permission) {
        const layer = this.getState().layer;
        role === roleAll
            ? handlePermissionForAllRoles(checked, layer.role_permissions, permission)
            : handlePermissionForSingleRole(layer.role_permissions[role], permission);

        this.updateState({
            layer: layer
        });
    }
}

const wrapped = controllerMixin(UIHandler, [
    'handlePermission',
    'layerSelected',
    'setAttributes',
    'setCapabilitiesUpdateRate',
    'setClusteringDistance',
    'setDataProviderId',
    'setExternalStyleJSON',
    'setForcedSRS',
    'setGfiContent',
    'setGfiType',
    'setGfiXslt',
    'setGroup',
    'setHoverJSON',
    'setLayerName',
    'setLayerUrl',
    'setLegendImage',
    'setLocalizedNames',
    'setMessage',
    'setMessages',
    'setMetadataIdentifier',
    'setMinAndMaxScale',
    'setOpacity',
    'setPassword',
    'setRealtime',
    'setRefreshRate',
    'setRenderMode',
    'setSelectedTime',
    'setStyle',
    'setStyleJSON',
    'setType',
    'setUsername',
    'setVersion'
]);
export { wrapped as AdminLayerFormHandler };
