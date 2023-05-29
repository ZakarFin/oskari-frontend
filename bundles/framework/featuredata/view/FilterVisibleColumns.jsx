import React, { useState } from 'react';
import styled from 'styled-components';
import { Select, Message } from 'oskari-ui';
import PropTypes from 'prop-types';
import { FEATUREDATA_DEFAULT_HIDDEN_FIELDS } from '../plugin/FeatureDataPluginHandler';
import { FEATUREDATA_BUNDLE_ID } from './FeatureDataContainer';

const FilterVisibleColumnsContainer = styled('div')`
    margin-left: auto;
    .filter-visible-columns-container-focused .ant-select-selection-overflow-item.ant-select-selection-overflow-item-rest {
        width: 0px!important;
    }

    .ant-select-selection-overflow-item.ant-select-selection-overflow-item-rest >  .ant-select-selection-item {
        background: none;
        border: none;
        padding-left: 0.5em;
    }
`;
;

const SelectFixedWidth = styled(Select)`
    min-width: 20em;
`;

const BlurredMessage = (props) => {
    const { visibleColumns, allColumns } = props;
    return <div>{visibleColumns?.length}/{allColumns?.length} <Message bundleKey={FEATUREDATA_BUNDLE_ID} messageKey={'visibleColumns.propertiesSelected'}/></div>;
};

BlurredMessage.propTypes = {
    allColumns: PropTypes.array,
    visibleColumns: PropTypes.array

};

const createOptions = (allColumns) => {
    if (!allColumns || !allColumns.length) {
        return;
    }

    return allColumns
        .filter(key => !FEATUREDATA_DEFAULT_HIDDEN_FIELDS.includes(key))
        .map(key => {
            return {
                label: key,
                value: key
            };
        });
};


export const FilterVisibleColumns = (props) => {
    const { allColumns, visibleColumns, updateVisibleColumns } = props;
    const options = createOptions(allColumns);
    const [focused, setFocused] = useState();

    return <FilterVisibleColumnsContainer>
        <SelectFixedWidth className={focused ? 'filter-visible-columns-container-focused' : 'filter-visible-columns-container-blurred'}
            mode='multiple'
            options={options}
            defaultValue={visibleColumns}
            value={visibleColumns}
            showArrow='true'
            tagRender={() => null}
            maxTagCount={0}
            maxTagPlaceholder={() => focused ? null : <BlurredMessage allColumns={allColumns} visibleColumns={visibleColumns} /> }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(value) => updateVisibleColumns(value)}/>
    </FilterVisibleColumnsContainer>;
};

FilterVisibleColumns.propTypes = {
    allColumns: PropTypes.array,
    visibleColumns: PropTypes.array,
    updateVisibleColumns: PropTypes.func
};
