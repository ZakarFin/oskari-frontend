import React from 'react';
import PropTypes from 'prop-types';
import { Message, Link } from 'oskari-ui';

export const AnnouncementsContent = ({ announcement }) => {
    const { locale } = announcement;
    const { link, content } = Oskari.getLocalized(locale);
    if (link) {
        return (
            <Link url ={link}>
                <Message messageKey={'externalLink'} />
            </Link>
        );
    }
    if (content) {
        return (
            <div className="announcements-content"
                dangerouslySetInnerHTML={{ __html: content }}/>
        );
    }
    return null;
};
AnnouncementsContent.propTypes = {
    announcement: PropTypes.object.isRequired
};
