import React, { useCallback, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { createDraggable, getPositionForCentering, createDocumentSizeHandler, createDraggableSizeHandler } from './util';
import { monitorResize, unmonitorResize } from './WindowWatcher';
import { ThemeConsumer } from '../../util/contexts';
import { getFontClass } from '../../theme/ThemeHelper';

// Note! use vh with max-height so it can handle window size changes
// map controls have z-index 15000, make this go over them
const Container = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    max-width: 95vw;
    min-width: 50px;
    max-height: 90vh;
    border: 1px solid rgba(100, 100, 100, 0.1);
    z-index: 15001;

    &.outofviewport {
        border: 1px solid rgba(100, 0, 0, 0.5);
    }
`;

export const MovableContainer = ThemeConsumer(({children, bringToTop, options, theme={}}) => {
    // hide before we can calculate centering coordinates
    const [position, setPosition] = useState({ x: -10000, y: 0, centered: false });
    const containerProps = {
        style: {
            transform: `translate(${position.x}px, ${position.y}px)`
        },
        className: `t_window t_${options.id} ${getFontClass(theme)}`
    };
    const elementRef = useRef();
    const headerProps = {
        isDraggable: !!options.isDraggable
    };
    const headerFuncs = [];
    if (typeof bringToTop === 'function') {
        headerFuncs.push(bringToTop);
    }
    if (options.isDraggable === true) {
        containerProps.ref = elementRef;
        headerFuncs.push(useCallback(() => createDraggable(position, setPosition, elementRef), [position, setPosition, elementRef]));
    }
    if (headerFuncs.length) {
        headerProps.onMouseDown = () => headerFuncs.forEach(fn => fn());
        headerProps.onTouchStart = () => headerFuncs.forEach(fn => fn());
    }
    const bodyResizeHandler = createDocumentSizeHandler(elementRef, position, setPosition);
    const popupResizeHandler = createDraggableSizeHandler(elementRef, position, setPosition);
    const handleUnmounting = () => {
        unmonitorResize(popupResizeHandler);
        unmonitorResize(bodyResizeHandler);
    }
    useEffect(() => {
        monitorResize(document.body, bodyResizeHandler);
        monitorResize(elementRef.current, popupResizeHandler);
        if (position.centered) {
            return handleUnmounting;
        }
        // center after content has been rendered
        setPosition({
            ...getPositionForCentering(elementRef, options.placement),
            centered: true
        });
        return handleUnmounting;
    });
    /*
    Creates:
    <div class="t_window"></div>
    */

    return (<Container {...containerProps}  {...headerProps}>
            {children}
    </Container>)
});

MovableContainer.propTypes = {
    children: PropTypes.any,
    bringToTop: PropTypes.func,
    options: PropTypes.object
};
