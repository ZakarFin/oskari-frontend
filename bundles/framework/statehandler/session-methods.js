import { showSessionExpiredModal, showSessionExpiringPopup } from './SessionExpiringPopup';

Oskari.clazz.category(
    'Oskari.mapframework.bundle.statehandler.StateHandlerBundleInstance',
    'state-methods', {
    /**
     * @method setSessionExpiring
     * @param {Number} minutes session lenght in minutes
     */
        setSessionExpiring: function (minutes) {
            if (!minutes) return;
            const me = this;
            const sandbox = this.getSandbox();

            sandbox.setSessionExpiring((minutes - 1), function () {
                const popupController = showSessionExpiringPopup(minutes, () => {
                    document.querySelector("form[action='/logout']").submit();
                    popupController.close();
                }, () => {
                    // continue session
                    sandbox.extendSession(() => {
                        showSessionExpiredModal();
                    });
                    me.setSessionExpiring(minutes);
                    popupController.close();
                });
            });
        },
        /**
         * @method resetSessionTimer
         * @param {Number} minutes session lenght in minutes
         */
        resetSessionTimer: function (minutes) {
            if (!minutes) return;

            // Clear old timer and set new one
            this.getSandbox().clearSessionTimer();
            this.setSessionExpiring(minutes);
        },
        /**
     * @method _createNotificationDialog
     * @private
     * @param  {Number} minutes
     * @return {Object}
     */
        _createNotificationDialog: function (minutes) {
            var me = this;
            var locale = Oskari.getMsg.bind(null, 'StateHandler');
            var sandbox = this.getSandbox();
            var popup = Oskari.clazz.create('Oskari.userinterface.component.Popup');
            var extendButton = Oskari.clazz.create('Oskari.userinterface.component.Button');
            var logoutButton = Oskari.clazz.create('Oskari.userinterface.component.Button');
            var extendButtonTitle = locale('session.expiring.extend');
            var logoutButtonMessage = locale('session.expiring.logout');
            var notifyTitle = locale('session.expiring.title');
            var notifyMessage = locale('session.expiring.message', { extend: '"' + extendButtonTitle + '"' });
            var expiredTitle = locale('session.expired.title');
            var expiredMessage = locale('session.expired.message');
            var expireTimeout;

            extendButton.addClass('primary');
            extendButton.setTitle(extendButtonTitle);
            extendButton.setHandler(function () {
                sandbox.extendSession(function () {
                    popup.show(expiredTitle, expiredMessage);
                    popup.makeModal();
                });
                clearInterval(expireTimeout);
                me.setSessionExpiring(minutes);
                popup.close(true);
            });
            logoutButton.setTitle(logoutButtonMessage);
            logoutButton.setHandler(function () {
                jQuery('#loginbar').find("form[action='/logout']").submit();
            });

            return {
                show: function () {
                    const expireIn = 60; // Expire time in seconds
                    popup.show(notifyTitle, notifyMessage + '<br />' + locale('session.expiring.expires', { expires: expireIn }), [logoutButton, extendButton]);
                    // Using Date for more accurate countdown (instead of just using setTimeout or setInterval)
                    const start = Date.now();
                    let diff;
                    let seconds;
                    expireTimeout = setInterval(timer, 1000);
                    function timer () {
                        diff = expireIn - (((Date.now() - start) / 1000) | 0);
                        seconds = (diff % 60) | 0;
                        seconds = seconds < 10 ? 0 + seconds : seconds;
                        if (seconds < 1) {
                            clearInterval(expireTimeout);
                            popup.show(expiredTitle, expiredMessage);
                            popup.makeModal();
                            if (Oskari.user().isLoggedIn()) {
                                jQuery('#loginbar').find("form[action='/logout']").submit();
                            } else {
                                location.reload();
                            }
                        } else {
                            popup.setContent(notifyMessage + '<br />' + locale('session.expiring.expires', { expires: seconds }));
                        }
                    }
                }
            };
        }
    });
