import { PLACEMENTS } from ".";

export const getAvailableWidth = () => {
    // width of <body>
    return document.body.clientWidth ||
        // width of <html>
        document.documentElement.clientWidth ||
        // window's width
        window.innerWidth;
};

export const getAvailableHeight = () => {
    // height of <body>
    return document.body.clientHeight ||
        // height of <html>
        document.documentElement.clientHeight ||
        // window's height
        window.innerHeight;
};

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 700;
const BORDER_MARGIN = 50;
export const OUTOFSCREEN_CLASSNAME = 'outofviewport';

export const createDraggable = (position, setPosition, elementRef) => {
    if (typeof position !== 'object') {
        throw new TypeError('Pass an object with x and y keys as first param');
    }
    if (typeof setPosition !== 'function') {
        throw new TypeError('Pass function to update position as second param');
    }
    if (!elementRef) {
        throw new TypeError('Pass React.useRef() for the element to move as third param');
    }
    const element = elementRef.current;
    let width = DEFAULT_WIDTH;
    let height = DEFAULT_HEIGHT;
    if (element) {
        const bounds = element.getBoundingClientRect();
        width = bounds.width;
        height = bounds.height;
    }
    const availableWidth = getAvailableWidth();
    const availableHeight = getAvailableHeight();
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const screenTopLimit = -5;
    // previousTouch is assigned in onTouchMove to track change and onMouseUp for reset
    let previousTouch;
    const onTouchMove = (event) => {
        // prevents text selection from other elements while dragging
        event.preventDefault();
        const element = elementRef.current;
        if (!element) {
            return;
        }

        const touch = event.touches[0];
        if (previousTouch) {
            onGenericMove({
                x: touch.pageX - previousTouch.pageX,
                y: touch.pageY - previousTouch.pageY
            });
        };
        previousTouch = touch;
    };
    const onMouseMove = (event) => {
        // prevents text selection from other elements while dragging
        event.preventDefault();
        const element = elementRef.current;
        if (!element) {
            return;
        }
        onGenericMove({
            x: event.movementX,
            y: event.movementY
        });
    };
    const onGenericMove = (delta) => {
        position.x += delta.x;
        position.y += delta.y;
        const outFromLeft = position.x < -halfWidth;
        const outFromRight = position.x + halfWidth > availableWidth;
        const outFromUp = position.y < screenTopLimit; // the header should remain visible to make it possible to drag back on screen
        const outFromBottom = position.y + halfHeight > availableHeight;
        const outOfScreen = outFromLeft || outFromRight || outFromUp || outFromBottom;
        if (!outOfScreen) {
            element.classList.remove(OUTOFSCREEN_CLASSNAME);
            // don't make the actual move if we would move off-screen or we don't get an element to move
            element.style.transform = `translate(${position.x}px, ${position.y}px)`;
            setPosition(position);
        } else {
            element.classList.add(OUTOFSCREEN_CLASSNAME);
            if (outFromLeft) {
                setPosition({
                    ...position,
                    x: -halfWidth
                });
            } else if (outFromRight) {
                setPosition({
                    ...position,
                    x: Math.max(availableWidth - halfWidth, 0)
                });
            } else if (outFromUp) {
                setPosition({
                    ...position,
                    y: screenTopLimit
                });
            } else if (outFromBottom) {
                setPosition({
                    ...position,
                    y: Math.max(availableHeight - halfHeight, 0)
                });
            }
        }
    };
    const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onMouseUp);
        document.removeEventListener("touchcancel", onMouseUp);
        previousTouch = null;
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onMouseUp);
    document.addEventListener("touchcancel", onMouseUp);
};

const getPlacementXY = (width, height, placement) => {
    const availableWidth = getAvailableWidth();
    const availableHeight = getAvailableHeight();
    let x = Math.max((availableWidth - width) / 2, 0);
    let y = Math.max((availableHeight - height) / 2, 0);

    switch(placement) {
        case PLACEMENTS.TOP:
            y = BORDER_MARGIN;
            break;
        case PLACEMENTS.LEFT:
            x = BORDER_MARGIN;
            break;
        case PLACEMENTS.BOTTOM:
            y = availableHeight - height - BORDER_MARGIN;
            break;
        case PLACEMENTS.RIGHT:
            x = availableWidth - width - BORDER_MARGIN;
            break;
        case PLACEMENTS.TL:
            y = BORDER_MARGIN;
            x = BORDER_MARGIN;
            break;
        case PLACEMENTS.TR:
            y = BORDER_MARGIN;
            x = availableWidth - width - BORDER_MARGIN;
            break;
        case PLACEMENTS.BL:
            y = availableHeight - height - BORDER_MARGIN;
            x = BORDER_MARGIN;
            break;
        case PLACEMENTS.BR:
            y = availableHeight - height - BORDER_MARGIN;
            x = availableWidth - width - BORDER_MARGIN;
            break;
    }
    return { x, y }
};

export const getPositionForCentering = (elementRef, placement) => {
    // ref.current is used for React.useRef(), element is just plain old "div" or similar
    const isReactRef = !!(elementRef && elementRef.current);
    const isHtmlEl = elementRef instanceof Element;
    if (!isReactRef && !isHtmlEl) {
        throw new TypeError('Pass React.useRef() or HTMLElement for the element to center');
    }
    const element = elementRef.current || elementRef;
    let width = DEFAULT_WIDTH;
    let height = DEFAULT_HEIGHT;

    if (element) {
        const bounds = element.getBoundingClientRect();
        // breaks if element is 0x0 so use defaults instead
        width = bounds.width || DEFAULT_WIDTH;
        height = bounds.height || DEFAULT_HEIGHT;
    }
    return getPlacementXY(width, height, placement);
};

/**
 * Create ResizeObserver handler for an element to detect if browser window size changes to
 *  try and keep elements in viewport if they would be out of screen after size change.
 * @param {React.useRef()} elementRef for element that we want to keep on screen
 * @param {Object} position with x and y keys
 * @param {Function} setPosition to set new position
 * @returns function to register for monitoring
 */
export const createDocumentSizeHandler = (elementRef, position, setPosition) => {
    return (newSize, prevSize) => {
        const windowIsNowBigger = prevSize.width < newSize.width || prevSize.height < newSize.height;
        const elementNoLongerOnScreen = position.x > newSize.width || position.y > newSize.height;
        if (elementRef.current && (windowIsNowBigger || elementNoLongerOnScreen)) {
            // Note! The class is added in createDraggable()
            // but we might not be able to remove it there after recentering on window size change
            // remove it if window is now bigger
            elementRef.current.classList.remove(OUTOFSCREEN_CLASSNAME);
        }
        if (elementNoLongerOnScreen) {
            // console.log('Element relocating! Window size changed from', prevSize, 'to', newSize);
            setPosition({
                ...position,
                centered: false
            });
        }
    };
};

/**
 * Create ResizeObserver handler for an element to detect if it's size changes in a way that would make the element bleed out of screen from the left or bottom.
 * Tries to keep element in viewport by moving it up/left if it would grow large enough to go out of screen.
 * @param {React.useRef()} elementRef for element that we want to keep on screen
 * @param {Object} position with x and y keys
 * @param {Function} setPosition to set new position
 * @returns function to register for monitoring
 */
export const createDraggableSizeHandler = (elementRef, position, setPosition) => {
    return (newSize, prevSize) => {
        const popupGotBigger = prevSize.width < newSize.width || prevSize.height < newSize.height;
        if (!elementRef.current || !popupGotBigger) {
            // got smaller, we don't need to relocate
            return;
        }
        let x = Math.min(getAvailableWidth() - newSize.width, position.x);
        let y = Math.min(getAvailableHeight() - newSize.height, position.y);
        if (x !== position.x || y !== position.y) {
            setPosition({
                x,
                y,
                centered: false
            });
        }
    };
};
