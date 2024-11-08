import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Message } from 'oskari-ui';
import { RolesTab } from './RolesTab';
import { UsersTab } from './UsersTab';
import { UsersByRoleTab } from './UsersByRoleTab';

export const AdminUsersFlyout = ({ state, controller, isExternal = false }) => {
    return (
        <div>
            <Tabs
                activeKey={state.activeTab}
                onChange={(key) => controller.setActiveTab(key)}
                items={[
                    {
                        key: 'admin-users-tab',
                        label: <Message messageKey='users.title' />,
                        children: (
                            <UsersTab state={state} controller={controller} isExternal={isExternal} />
                        )
                    },
                    {
                        key: 'admin-roles-tab',
                        label: <Message messageKey='roles.title' />,
                        children: (
                            <RolesTab state={state} controller={controller} />
                        )
                    },
                    {
                        key: 'admin-users-by-role-tab',
                        label: <Message messageKey='usersByRole.title' />,
                        children: (
                            <UsersByRoleTab state={state} controller={controller} />
                        )
                    }
                ]}
            />
        </div>
    );
};
AdminUsersFlyout.propTypes = {
    state: PropTypes.object.isRequired,
    controller: PropTypes.object.isRequired,
    isExternal: PropTypes.bool
};
