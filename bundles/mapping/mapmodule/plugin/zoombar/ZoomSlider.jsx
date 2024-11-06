import React from 'react';
import { MapModuleButton } from '../../MapModuleButton';
import styled from 'styled-components';
import { Slider } from 'oskari-ui';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { ThemeConsumer, ThemeProvider } from 'oskari-ui/util';
import { getNavigationTheme } from 'oskari-ui/theme';

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 10px 10px 10px;
`;
const StyledMinus = styled(MinusOutlined)`
    shape-rendering: optimizespeed;
`;
const StyledPlus = styled(PlusOutlined)`
    shape-rendering: optimizespeed;
`;

const StyledSlider = styled(Slider)`
    height: 150px;
    opacity: ${props => props.opacity};
    margin: 6px 10px;
    left: -1px;
    .ant-slider-mark-text {
        color: #ffffff;
    }
    .ant-slider-dot {
        height: 1px;
        background: ${props => props.dotColor};
        border: none;
        width: 7px;
        left: 0;
        opacity: 50%;
    }
    .ant-slider-rail,
    .ant-slider-track,
    .ant-slider-step {
        width: 7px;
        background: ${props => props.railBackground};
        border-radius: 5px;
        box-shadow: 0px 1px 2px 1px rgb(0 0 0 / 60%);
        &:hover {
            background: ${props => props.railBackground};
        }
        &:focus {
            background: ${props => props.railBackground};
        }
        &:active {
            background: ${props => props.railBackground};
        }
    }
    .ant-slider-handle {
        background: ${props => props.handleBackground};
        border: 4px solid ${props => props.handleBorder};
        box-shadow: 0px 1px 2px 1px rgb(0 0 0 / 60%);
        border-radius: ${props => props.rounding || '0%'};
        width: 14px;
        height: 14px;
        left: 0;
        &:hover {
            background: ${props => props.handleBackground};
            border: 4px solid ${props => props.handleBorder};
        }
        &:focus {
            background: ${props => props.handleBackground};
            border: 4px solid ${props => props.handleBorder};
        }
        &:active {
            background: ${props => props.handleBackground};
            border: 4px solid ${props => props.handleBorder};
        }
    }
    .ant-slider-handle::after, .ant-slider-handle:hover::after {
        background: none;
        box-shadow: none !important;
    }
    .ant-slider:hover .ant-slider-handle::after {
        box-shadow: none!important;
    }
    `;

const MobileContainer = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const ThemedSlider = ThemeConsumer(({theme = {}, ...rest}) => {
    const helper = getNavigationTheme(theme);
    const bgColor = helper.getButtonColor();
    const icon = helper.getTextColor();
    const rounding = helper.getButtonRoundness();
    const opacity = helper.getButtonOpacity();
    return (
        <StyledSlider
            railBackground={bgColor}
            handleBackground={bgColor}
            dotColor={icon}
            rounding={rounding}
            handleBorder={icon}
            opacity={opacity}
            {...rest}
        />
    );
});

export const ZoomSlider = ({ changeZoom, zoom = 0, maxZoom, isMobile = false, ...rest }) => {
    const marks = {};
    for (let i = maxZoom; i > 0; i--) {
        marks[i] = { label: null };
    }

    if (isMobile) {
        return (
            <MobileContainer>
                <MapModuleButton
                    icon={<PlusOutlined />}
                    onClick={() => {
                        changeZoom(zoom < 100 ? zoom + 1 : 100);
                    }}
                    size='32px'
                    className='t_plus'
                />
                <MapModuleButton
                    icon={<MinusOutlined />}
                    onClick={() => {
                        changeZoom(zoom > 0 ? zoom - 1 : 0);
                    }}
                    size='32px'
                    className='t_minus'
                />
            </MobileContainer>
        );
    }

    const mapModule = Oskari.getSandbox().findRegisteredModuleInstance('MainMapModule');
    return (
        <Container>
            <MapModuleButton
                icon={<StyledPlus />}
                className='t_plus'
                onClick={() => {
                    changeZoom(zoom < 100 ? zoom + 1 : 100);
                }}
                size='18px'
                iconSize='12px'
                noMargin
            />

            <ThemeProvider value={mapModule.getMapTheme()}>
                <ThemedSlider
                    className='t_zoomslider'
                    vertical={true}
                    value={zoom}
                    step={1}
                    dots
                    max={maxZoom}
                    min={0}
                    onChange={value => {
                        changeZoom(value);
                    }}
                    {...rest}
                />
            </ThemeProvider>

            <MapModuleButton
                icon={<StyledMinus />}
                className='t_minus'
                onClick={() => {
                    changeZoom(zoom > 0 ? zoom - 1 : 0);
                }}
                size='18px'
                iconSize='12px'
                noMargin
            />
        </Container>
    );
};
