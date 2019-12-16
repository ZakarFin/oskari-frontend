import React from 'react';
import PropTypes from 'prop-types';
import { withLocale } from 'oskari-ui/util';
import styled from 'styled-components';

const StyledLink = styled('a')`
    cursor: pointer;
`;

export const VisibilityInfo = withLocale(({ action, text, messageKey, Message }) => {
    const message = (
        <React.Fragment>
            { messageKey && <Message messageKey={messageKey} />}
            { !messageKey && text }
        </React.Fragment>
    );
    if (action) {
        return <StyledLink onClick={action}>{message}</StyledLink>;
    }
    return message;
});

VisibilityInfo.propTypes = {
    action: PropTypes.func,
    text: PropTypes.string,
    messageKey: PropTypes.string
};
