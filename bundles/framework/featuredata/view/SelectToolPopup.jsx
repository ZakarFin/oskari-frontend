import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { showPopup, getNavigationDimensions, PLACEMENTS } from 'oskari-ui/components/window';
import { ButtonContainer, PrimaryButton, IconButton } from 'oskari-ui/components/buttons';
import { Message, Button, Radio } from 'oskari-ui';
import { DRAW_TOOLS, SELECT_ALL_ID } from './SelectToolPopupHandler';
import { LocaleProvider } from 'oskari-ui/util';
import { InfoIcon } from 'oskari-ui/components/icons';
import point from './icons/selection-point.png';
import line from './icons/selection-line.png';
import polygon from './icons/selection-polygon.png';
import square from './icons/selection-square.png';
import circle from './icons/selection-circle.png';

const BUNDLE_NAME = 'FeatureData';

const StyledContent = styled('div')`
    width: 300px;
    margin: 12px 24px 24px;
`;
const DrawOptions = styled('div')`
    display: flex;
    flex-direction: row;
    margin-bottom: 15px;
`;

const Info = styled.div`
    margin-top: 15px;
    font-style: italic;
    font-size: 12px;
`;

const Tool = styled(IconButton)`
    border-width: 2px;
    width: 34px;
    height: 34px;
    padding: 0;
    margin-right: 6px;
`;

const getImageSrc = key => {
    if (key === 'point') return point;
    if (key === 'line') return line;
    if (key === 'polygon') return polygon;
    if (key === 'square') return square;
    if (key === 'circle') return circle;
};

const PopupContent = ({ tool, layerId, vectorLayers, controller, onClose }) => {
    const layerCount = vectorLayers.length;
    const topLayer = vectorLayers[layerCount - 1];
    const topName = topLayer?.getName();
    const topId = topLayer?.getId();
    const disabled = layerCount === 0;
    return (
        <LocaleProvider value={{ bundleKey: BUNDLE_NAME }}>
            <StyledContent>
                <DrawOptions>
                    {DRAW_TOOLS.map(key =>
                        <Tool key={key}
                            bordered
                            active={tool === key}
                            title={<Message messageKey={`selectionTools.tools.${key}.tooltip`}/> }
                            disabled={disabled}
                            icon={<img src={getImageSrc(key)} />}
                            className={`t_${key}`}
                            onClick={() => controller.setTool(key)} />
                    )}
                </DrawOptions>
                <Radio.Group
                    value={layerId}
                    onChange={(e) => controller.setLayerId(e.target.value)}
                >
                    <Radio.Choice value={topId} disabled={disabled}>
                        <Message messageKey={'selectionTools.selectFromTop'} />
                        {topName && <InfoIcon title={topName} /> }
                    </Radio.Choice>
                    <Radio.Choice value={SELECT_ALL_ID} disabled={layerCount < 2}>
                        <Message messageKey={'selectionTools.selectAll'} />
                    </Radio.Choice>
                </Radio.Group>
                <Info>
                    <Message messageKey='selectionTools.instructions' />
                </Info>
                <ButtonContainer>
                    <Button
                        className='t_clearSelections'
                        onClick={() => controller.clearSelections()}
                    >
                        <Message messageKey='selectionTools.button.empty' />
                    </Button>
                    <PrimaryButton
                        type='close'
                        onClick={() => onClose()}
                    />
                </ButtonContainer>
            </StyledContent>
        </LocaleProvider>
    );
};

PopupContent.propTypes = {
    tool: PropTypes.string,
    layerId: PropTypes.any,
    vectorLayers: PropTypes.array.isRequired,
    controller: PropTypes.object,
    onClose: PropTypes.func
};

export const showSelectToolPopup = (state, controller, onClose) => {
    const dimensions = getNavigationDimensions();
    let placement = PLACEMENTS.BL;
    if (dimensions?.placement === 'right') {
        placement = PLACEMENTS.BR;
    }
    const options = {
        id: 'featuredata-selection-tools',
        placement
    };
    const controls = showPopup(
        <Message bundleKey={BUNDLE_NAME} messageKey='selectionTools.title' />,
        <PopupContent { ...state } controller={controller} onClose={onClose} />,
        onClose,
        options
    );

    return {
        ...controls,
        update: (state) => {
            controls.update(
                <Message bundleKey={BUNDLE_NAME} messageKey='selectionTools.title' />,
                <PopupContent { ...state } controller={controller} onClose={onClose} />
            );
        }
    };
};
