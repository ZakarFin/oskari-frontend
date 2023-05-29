import '../../../../service/search/searchservice';
import { showResultsPopup } from './SearchResultsPopup';
import { showOptionsPopup } from './SearchOptionsPopup';
import { Messaging, StateHandler, controllerMixin } from 'oskari-ui/util';
import { SearchResultHelper } from './SearchResultHelper';

// sort channel in alphabetical order but have defaults on top
const channelSortFunction = (a, b) => {
    if (a.isDefault && b.isDefault) {
        return Oskari.util.naturalSort(a.locale?.name, b.locale?.name);
    } else if (a.isDefault) {
        return -1;
    } else if (b.isDefault) {
        return 1;
    }
    return Oskari.util.naturalSort(a.locale?.name, b.locale?.name);
};

/**
 * Generate a runtime id for non-wfs search channel results
 * @param {SearchResultObject} result
 * @returns String to use as id
 */
const getIdForResult = result => {
    if (result.id) {
        return result.id;
    }
    return result.name + result.lon + result.lat;
};
// generate id and simple geometry
const processResultLocations = (results) => {
    if (!results) {
        return;
    }
    const { locations = [] } = results;
    locations.forEach(loc => {
        if (!loc.id) {
            loc.id = getIdForResult(loc);
        }
        // WFS search channels have GEOMETRY attached as WKT. For others we can generate a simple point geometry.
        if (!loc.GEOMETRY) {
            loc.GEOMETRY = `POINT (${loc.lon} ${loc.lat})`;
        }
    });
    return results;
};

class SearchHandler extends StateHandler {
    constructor (plugin) {
        super();
        this.plugin = plugin;
        this.setState({
            minimized: false,
            loading: [],
            hasOptions: false,
            selectedChannels: [],
            featuresOnMap: [],
            suggestions: []
        });
        // ['selected', 'name', 'region', 'type'] or null/empty array for all
        this.columns = plugin.getConfig().columns || ['name', 'region', 'type'];
        this._popupControlsResult = null;
        this.eventHandlers = this.createEventHandlers();
        this.service = Oskari.clazz.create('Oskari.service.search.SearchService', plugin.getSandbox(), plugin.getConfig()?.url);
        this.resultHelper = new SearchResultHelper(plugin.getSandbox(), plugin.getConfig()?.useInfobox);
        // options needs to be enabled explicitly
        this.allowOptions = !!plugin.getConfig()?.allowOptions;
        this.fetchChannels();
    };

    teardown () {
        this.clearResultPopup();
        this.clearOptionsPopup();
    }

    clearResultPopup () {
        this.resultHelper.removeMarker();
        this.resultHelper.removeResultFromMap();
        if (this._popupControlsResult) {
            this._popupControlsResult.close();
        }
        this._popupControlsResult = null;
        this.updateState({
            results: null
        });
    }

    getMsg (key, args) {
        return Oskari.getMsg('MapModule', 'plugin.SearchPlugin.' + key, args);
    }

    updateResultsPopup () {
        const { results = {}, loading, channels, featuresOnMap } = this.getState();
        if (!loading.length) {
            // we have all results
            // check if we didn't find anything OR if we found just one
            const currentChannels = Object.keys(results).filter(chan => !!results[chan]);
            if (!currentChannels.length) {
                // previous search result cleared
                Messaging.error(this.getMsg('noresults'));
                this.clearResultPopup();
                return;
            }
            const combined = currentChannels.reduce((accumulator, currentValue) => {
                const channelResults = results[currentValue];
                if (!channelResults) {
                    return accumulator;
                }
                accumulator.push(...channelResults.locations);
                return accumulator;
            },
            []);

            if (combined.length === 0) {
                Messaging.error(this.getMsg('noresults'));
                this.clearResultPopup();
                return;
            } else if (combined.length === 1) {
                // only one result, show it immediately
                this.resultClicked(combined[0]);
                return;
            }
        }
        if (this._popupControlsResult) {
            this._popupControlsResult.update(results, channels, featuresOnMap);
            return;
        }

        this._popupControlsResult = showResultsPopup(
            results,
            channels,
            featuresOnMap,
            (result, isToggle) => this.resultClicked(result, isToggle),
            () => this.clearResultPopup(),
            this.plugin.getLocation(),
            this.columns);
    }

    getName () {
        return 'SearchPluginHandler';
    }

    getSandbox () {
        return this.plugin.getSandbox();
    }

    setQuery (query) {
        this.updateState({
            query,
            suggestions: []
        });
        let { selectedChannels } = this.getState();
        if (query.length > 2) {
            this.service.doAutocompleteSearch(query, (result) => {
                this.updateState({ suggestions: result.methods });
            }, selectedChannels.join(','));
        }
    }

    /**
     * Uses SearchService to make the actual search and calls  #_showResults
     */
    doSearch (autocompleteWord) {
        let { loading, query = '', selectedChannels = [] } = this.getState();
        if (typeof autocompleteWord === 'string') {
            query = autocompleteWord;
        }
        if (loading.length || query.length === 0) {
            return;
        }
        this.clearResultPopup();
        const currentChannels = [...(new Set(loading.concat(selectedChannels)))];

        this.updateState({
            query,
            loading: currentChannels,
            suggestions: []
        });
        currentChannels.forEach(channel => this.triggerSearchForChannel(channel, query));
    }

    triggerSearchForChannel (channel, query) {
        const updateResults = (results) => {
            const { results: prevResults = {}, loading } = this.getState();
            const stateUpdate = {
                loading: results ? loading.filter(item => item !== channel) : loading,
                results: {
                    ...prevResults
                }
            };
            if (!results) {
                delete stateUpdate.results[channel];
            } else if (this.allowOptions || results.totalCount > 0) {
                // only pass channel results if:
                // - the user has option to select channels OR
                // - the result has hits
                stateUpdate.results[channel] = processResultLocations(results);
            }
            this.updateState(stateUpdate);
            this.updateResultsPopup();
        };
        // clear previous results
        updateResults();
        this.service.doSearch(query, results => {
            updateResults(results);
        }, () => {
            // on error
            updateResults();
        }, undefined,
        channel);
    }

    resultClicked (result, isToggled) {
        if (typeof isToggled === 'boolean') {
            const { featuresOnMap } = this.getState();
            if (isToggled) {
                // add to map
                featuresOnMap.push(result);
                this.updateState({
                    featuresOnMap
                });
                this.resultHelper.showResultOnMap(result);
            } else {
                // remove from map
                this.updateState({
                    featuresOnMap: featuresOnMap.filter(item => item.id !== result.id)
                });
                this.resultHelper.removeResultFromMap(result);
            }
            this.updateResultsPopup();
            return;
        }
        var zoom = result.zoomLevel;
        if (result.zoomScale) {
            zoom = { scale: result.zoomScale };
        }
        this.getSandbox().postRequestByName('MapMoveRequest', [result.lon, result.lat, zoom]);
        this.resultHelper.setMarker(result);
    }

    /** Restore from minimized state */
    requestSearchUI () {
        this.updateState({
            minimized: false
        });
    }

    createEventHandlers () {
        const handlers = {
            /** Minimize search bar on map click */
            'MapClickedEvent': () => {
                this.updateState({
                    minimized: true
                });
            }
        };
        const sandbox = this.getSandbox();
        Object.getOwnPropertyNames(handlers).forEach(p => sandbox.registerForEventByName(this, p));
        return handlers;
    }

    onEvent (e) {
        var handler = this.eventHandlers[e.getName()];
        if (!handler) {
            return;
        }
        return handler.apply(this, [e]);
    }

    toggleOptionsPopup () {
        if (this._popupControlsOptions) {
            this.clearOptionsPopup();
            return;
        }
        const title = this.getMsg('options.title');
        const controller = this.getController();
        this._popupControlsOptions = showOptionsPopup(
            title,
            this.getState(),
            controller,
            () => this.clearOptionsPopup(),
            this.plugin.getLocation());
        // TODO: if the user can select search channels for the query etc
        // related to state.hasOptions: false
        // hasOptions is always false for now since this has not been implemented yet
    }
    fetchChannels () {
        fetch(Oskari.urls.getRoute('SearchOptions')).then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        }).then(json => {
            const { channels } = json;
            if (!channels) {
                throw Error('Unexpected response for search channels');
            }
            const sortedChannels = channels.sort(channelSortFunction);
            // we will change the value of selectedChannels when state changes to keep track if we should update the options popup
            let selectedChannels = channels.filter(c => c.isDefault).map(c => c.id);
            this.updateState({
                channels: sortedChannels,
                hasOptions: this.allowOptions && channels.length > 1,
                defaultChannels: [...selectedChannels],
                selectedChannels: [...selectedChannels]
            });
            this.addStateListener((state) => {
                if (!this._popupControlsOptions) {
                    // popup not open
                    return;
                }
                if (selectedChannels.length !== state.selectedChannels.length) {
                    // selected channels changed -> trigger popup update
                    this._popupControlsOptions.update(state);
                    // make a copy to compare on next update
                    selectedChannels = [...state.selectedChannels];
                }
            });
        }).catch(error => {
            throw Error(error);
        });
    }

    setChannelEnabled (channelId, enabled) {
        let { selectedChannels } = this.getState();
        if (enabled) {
            selectedChannels.push(channelId);
        } else {
            selectedChannels = selectedChannels.filter(id => id !== channelId);
        }
        this.clearResultPopup();
        this.updateState({
            selectedChannels
        });
    }
    clearOptionsPopup () {
        if (this._popupControlsOptions) {
            this._popupControlsOptions.close();
        }
        this._popupControlsOptions = null;
    }
};

const wrapped = controllerMixin(SearchHandler, [
    'resultClicked',
    'requestSearchUI',
    'doSearch',
    'setQuery',
    'toggleOptionsPopup',
    'setChannelEnabled'
]);

export { wrapped as SearchHandler };
