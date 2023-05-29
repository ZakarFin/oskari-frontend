import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from 'oskari-ui';
import { SelectOutlined } from '@ant-design/icons';

const LinkIcon = styled(SelectOutlined)`
    margin-left: 6px;
`;

export const Link = ({
    url,
    external = true,
    label,
    tooltip = url,
    children
}) => {
    const target = external ? '_blank' : '_self';
    return (
        <Tooltip title={tooltip}>
            {label}
            <a href={url} target={target} rel="noreferrer noopener">
                {children}
                {external && <LinkIcon/>}
            </a>
        </Tooltip>
    );
};

Link.propTypes = {
    url: PropTypes.string.isRequired,
    children: PropTypes.any,
    external: PropTypes.bool
};
