import React from 'react';

const getButtonClassName = (button) => {
    const classNames = ['tool'];
    if (button.iconClassName) {
        classNames.push(button.iconClassName);
    }
    if (button.disabled) {
        classNames.push('disabled');
    }
    if (button.selected) {
        classNames.push('selected');
    }
    if (button.hover) {
        classNames.push('hover');
    }
    return classNames.join(' ');
};

export const Toolbar = ({ groups, onButtonClick, onButtonEnter, onButtonLeave }) => {
    return (
        <>
            {groups.map((group) => (
                <div
                    className='toolrow'
                    tbgroup={group.id}
                    key={group.id}
                >
                    {group.buttons.map((button) => (
                        <div
                            className={getButtonClassName(button)}
                            id={button.domId}
                            key={button.id}
                            title={button.tooltip}
                            tool={button.id}
                            data-icon={button.iconCls}
                            data-toggle-change-icon={button.toggleChangeIcon}
                            data-active-color={button.activeColor}
                            onClick={() => onButtonClick(button.id, group.id)}
                            onMouseEnter={() => onButtonEnter(button.id, group.id)}
                            onMouseLeave={() => onButtonLeave(button.id, group.id)}
                        />
                    ))}
                </div>
            ))}
        </>
    );
};
