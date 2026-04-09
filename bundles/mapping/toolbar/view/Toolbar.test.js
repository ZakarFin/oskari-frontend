import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';

describe('<Toolbar />', () => {
    test('renders groups and preserves icon class based rendering', () => {
        const groups = [{
            id: 'default-basictools',
            buttons: [{
                id: 'select',
                domId: 'oskari_toolbar_basictools_select',
                tooltip: 'Pan',
                iconCls: 'tool-pan',
                iconClassName: 'tool-pan-dark',
                toggleChangeIcon: true,
                activeColor: '#212121',
                selected: true,
                disabled: false,
                hover: false
            }]
        }];

        const { container } = render(
            <Toolbar
                groups={groups}
                onButtonClick={() => {}}
                onButtonEnter={() => {}}
                onButtonLeave={() => {}}
            />
        );

        const row = container.querySelector('.toolrow[data-tbgroup="default-basictools"]');
        const button = container.querySelector('#oskari_toolbar_basictools_select');

        expect(row).toBeInTheDocument();
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('tool');
        expect(button).toHaveClass('tool-pan-dark');
        expect(button).toHaveClass('selected');
        expect(button).toHaveAttribute('data-icon', 'tool-pan');
        expect(button).toHaveAttribute('data-toggle-change-icon', 'true');
        expect(button).toHaveAttribute('data-active-color', '#212121');
    });

    test('forwards click and hover events with id and group', () => {
        const onButtonClick = jest.fn();
        const onButtonEnter = jest.fn();
        const onButtonLeave = jest.fn();
        const groups = [{
            id: 'default-viewtools',
            buttons: [{
                id: 'link',
                domId: 'oskari_toolbar_viewtools_link',
                tooltip: 'Share',
                iconCls: 'tool-link',
                iconClassName: 'tool-link-dark',
                selected: false,
                disabled: false,
                hover: false
            }]
        }];

        const { container } = render(
            <Toolbar
                groups={groups}
                onButtonClick={onButtonClick}
                onButtonEnter={onButtonEnter}
                onButtonLeave={onButtonLeave}
            />
        );

        const button = container.querySelector('#oskari_toolbar_viewtools_link');
        fireEvent.click(button);
        fireEvent.mouseEnter(button);
        fireEvent.mouseLeave(button);

        expect(onButtonClick).toHaveBeenCalledWith('link', 'default-viewtools');
        expect(onButtonEnter).toHaveBeenCalledWith('link', 'default-viewtools');
        expect(onButtonLeave).toHaveBeenCalledWith('link', 'default-viewtools');
    });
});
