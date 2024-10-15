import React from 'react';
import styled from 'styled-components';
import { Button } from 'oskari-ui';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
import { MapModuleButton } from '../../../MapModuleButton';
import { SearchInput } from './SearchInput';
import { ThemeConsumer } from 'oskari-ui/util';
import { getNavigationTheme } from 'oskari-ui/theme';

// filtering class means that the search uses other channels than what are used by default
// -> highlight the button
const StyledButton = styled(Button)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 7px;
    height: 35px;
    border-radius: calc(${props => props.$rounding || 0} * 35px);
    background: ${props => props.$backgroundColor};
    color: ${props => props.$iconColor};
    border: none;
    &:hover {
        background: ${props => props.$backgroundColor};
        color: ${props => props.$iconColor};
        border: none;
        path {
            fill: ${props => props.$hoverColor};
        }
    }
    &:focus {
        background: ${props => props.$backgroundColor};
        color: ${props => props.$iconColor};
        border: none;
    }
    &:active {
        background: ${props => props.$backgroundColor};
        color: ${props => props.$iconColor};
        border: none;
    }
    &.filtering {
        color:  ${props => props.$hoverColor};
    }
`;

const SearchContainer = styled('div')`
    margin: 0 10px 10px 10px;
    display: flex;
    height: 40px;
    flex-direction: row;
    background: ${props => props.backgroundColor};
    opacity: ${props => props.opacity};
    align-items: center;
    padding: 0px 7px 3px 3px;
    border-radius: calc(${props => props.rounding || 0} * 40px);
    box-shadow: 1px 1px 2px rgb(0 0 0 / 60%);

    .ant-btn-icon-only > * {
        font-size: 20px !important;
        margin-left: 0.25em;
        margin-top: 0.1em;
    }

    .ant-btn.ant-btn-icon-only .anticon {
        font-size: 20px!important;
    }

    input {
        font-size: 15px;
    }
    &:focus-within {
        opacity: 0.95;
    }
`;

export const SearchBar = ThemeConsumer(({ theme = {}, disabled = false, placeholder, state = {}, controller }) => {
    const helper = getNavigationTheme(theme);
    const bgColor = helper.getButtonColor();
    const icon = helper.getTextColor();
    // get button roundness factor instead of percentage as the component is not round itself
    const roundingFactor = helper.getButtonRoundnessFactor();
    const opacity = helper.getButtonOpacity();
    const hover = helper.getButtonHoverColor();
    if (state.minimized) {
        return (
            <MapModuleButton
                className='t_search_minimized'
                icon={<SearchOutlined />}
                onClick={() => controller.requestSearchUI()}
            />);
    }
    const search = (autoselected) => controller.doSearch(autoselected);
    const { defaultChannels = [], selectedChannels = [] } = state;
    const isUsingDefaultChannels = selectedChannels.length === defaultChannels.length && selectedChannels.every(id => defaultChannels.includes(id));
    let optionsCSSClasses = 't_search_options';
    if (!isUsingDefaultChannels) {
        optionsCSSClasses += ' filtering';
    }
    return (
        <SearchContainer backgroundColor={bgColor} rounding={roundingFactor} opacity={opacity}>
            <SearchInput
                rounding={roundingFactor}
                query={state.query}
                onChange={q => controller.setQuery(q)}
                onSearch={search}
                disabled={disabled}
                placeholder={placeholder}
                suggestions={state.suggestions}
            />
            { state.hasOptions &&
                <StyledButton
                    $rounding={roundingFactor}
                    $iconColor={icon}
                    $backgroundColor={bgColor}
                    $hoverColor={hover}
                    onClick={() => controller.toggleOptionsPopup()}
                    icon={<SettingOutlined />}
                    className={optionsCSSClasses}
                    disabled={disabled}
                />
            }
            <StyledButton
                $rounding={roundingFactor}
                $iconColor={icon}
                $backgroundColor={bgColor}
                $hoverColor={hover}
                onClick={search}
                icon={<SearchOutlined />}
                loading={!!state.loading.length}
                className='t_search'
                disabled={disabled}
            />
        </SearchContainer>
    );
});
