/**
 * @class Oskari.map.LogoPluginService
 */
Oskari.clazz.define('Oskari.map.LogoPluginService',
/**
 * @method create called automatically on construction
 * @static
 */
    function (sandbox) {
        if (!sandbox) {
            return null;
        }
        this.sandbox = sandbox;
        var me = sandbox.getService(this.getQName());
        if (me) {
            return me;
        }
        this.labels = [];
        sandbox.registerService(this);
        Oskari.makeObservable(this);
    }, {
        __name: 'map.logo.service',
        __qname: 'Oskari.map.LogoPluginService',
        getQName: function () {
            return this.__qname;
        },
        getName: function () {
            return this.__name;
        },
        getLabels: function () {
            return this.labels;
        },
        /**
   * @method addLabel
   * @param {String} title
   * @param {Object} options {id, callback}
   */
        addLabel: function (title, options) {
            if (typeof title === 'undefined') {
                return;
            }
            if (this.labels.findIndex(label => label.title === title) < 0) {
                this.labels.push({ title: title, options: options || {} });
            }
            this.trigger('change');
        }
    }, {
        'protocol': ['Oskari.framework.service.Service']
    });
