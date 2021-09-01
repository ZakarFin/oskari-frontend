import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LocaleProvider } from '../util';
import { Message } from './Message';
import { Form, Card, Space, Radio } from 'antd';
import styled from 'styled-components';

import { constants, PointTab, LineTab, AreaTab, OSKARI_BLANK_STYLE } from './StyleEditor/';
import { FormToOskariMapper } from './StyleEditor/FormToOskariMapper';

const TabSelector = styled(Radio.Group)`
    &&& {
        display: flex;
        flex-basis: 0;
        flex-grow: 1;
    }

    .ant-radio-button-wrapper {
        text-align: center;
        width: 100%;
    }
`;

const StaticForm = styled(Form)`
    & > .ant-space {
        width: 100%;
    }
`;

const FormSpace = styled(Space)`
    width: 100%;
`;


/**
 * @class StyleEditor
 * @calssdesc <StyleEditor>
 * @memberof module:oskari-ui
 * @see {@link module:oskari-ui/util.LocaleProvider|LocaleProvider}
 * @param {Object} props - { }
 *
 * @example <caption>Basic usage</caption>
 * <StyleEditor props={{ ...exampleProps }}/>
 */

 const styleExceptionHandler = (exceptionStyle) => {
    // if fill pattern is set to null, set color as empty
    if (typeof exceptionStyle.fill.area.pattern !== 'undefined') {
        if (exceptionStyle.fill.area.pattern === 4) {
            exceptionStyle.fill.color = '';
        } else if (exceptionStyle.fill.area.pattern !== 4 && exceptionStyle.fill.color === '') {
            exceptionStyle.fill.color = OSKARI_BLANK_STYLE.fill.color;
        }
    }

    return exceptionStyle;
};

export const StyleEditor = ({ oskariStyle, onChange, format }) => {
    let [form] = Form.useForm();

    // if we don't clone the input here the mappings
    //  between form <> style, the values can get mixed up due to mutability
    const style = {
        ...OSKARI_BLANK_STYLE,
        ...oskariStyle
    };

    // initialize state with propvided style settings to show preview correctly and set default format as point
    const fieldValuesForForm = FormToOskariMapper.createFlatFormObjectFromStyle(style);
    const convertedStyleValues = FormToOskariMapper.convertFillPatternToForm(fieldValuesForForm);
    const [selectedTab, setSelectedTab] = useState(format || 'point');
    const updateStyle = FormToOskariMapper.createStyleAdjuster(style);

    const onUpdate = (values) => {
        // values ex: {image.shape: 3}
        FormToOskariMapper.convertFillPatternToStyle(values);
        const newStyle = updateStyle(values);
        // if we don't clone the output here the mappings
        //  between form <> style, the values can get mixed up due to mutability
        onChange(styleExceptionHandler(newStyle));
    };

    useEffect(() => {
        form.setFieldsValue(convertedStyleValues);
    }, [oskariStyle]);

    return (
        <LocaleProvider value={{ bundleKey: constants.LOCALIZATION_BUNDLE }}>
            <FormSpace direction='vertical'>
                <TabSelector { ...constants.ANTD_FORMLAYOUT } value={selectedTab} onChange={(event) => setSelectedTab(event.target.value) } >
                    <Radio.Button value='point'><Message messageKey='StyleEditor.subheaders.pointTab' /></Radio.Button>
                    <Radio.Button value='line'><Message messageKey='StyleEditor.subheaders.lineTab' /></Radio.Button>
                    <Radio.Button value='area'><Message messageKey='StyleEditor.subheaders.areaTab' /></Radio.Button>
                </TabSelector>
                <Card>
                    <StaticForm form={ form } onValuesChange={ onUpdate }>
                        { selectedTab === 'point' && <PointTab oskariStyle={ style } /> }
                        { selectedTab === 'line' && <LineTab oskariStyle={ style } /> }
                        { selectedTab === 'area' && <AreaTab oskariStyle={  style } /> }
                    </StaticForm>
                </Card>
            </FormSpace>
        </LocaleProvider>
    );
};

StyleEditor.propTypes = {
    oskariStyle: PropTypes.object,
    format: PropTypes.oneOf(['point', 'line', 'area']),
    onChange: PropTypes.func.isRequired
};
