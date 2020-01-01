import React from 'react';
import PropTypes from 'prop-types';
import { DataProviderSelect } from './DataProviderSelect';
import { LocalizationComponent, TextInput, UrlInput, Message } from 'oskari-ui';
import { MapLayerGroups } from './MapLayerGroups';
import { StyledTab, StyledComponentGroup, StyledComponent } from './StyledFormComponents';
import { LocaleConsumer, Controller } from 'oskari-ui/util';
import styled from 'styled-components';

const PaddedLabel = styled('div')`
    padding-bottom: 5px;
`;
const Padding = styled('div')`
    padding-top: 10px;
`;

const GeneralTabPane = (props) => {
    const { mapLayerGroups, dataProviders, layer, bundleKey, controller } = props;
    const credentialProps = {
        allowCredentials: true,
        defaultOpen: false,
        usernameValue: layer.username,
        passwordValue: layer.password,
        panelText: <Message messageKey='usernameAndPassword'/>,
        usernameText: <Message messageKey='username'/>,
        passwordText: <Message messageKey='password'/>,
        usernameOnChange: controller.setUsername,
        passwordOnChange: controller.setPassword
    };
    const getMsg = Oskari.getMsg.bind(null, bundleKey);
    const localized = {
        labels: {},
        values: {}
    };
    Oskari.getSupportedLanguages().forEach(language => {
        const langPrefix = typeof getMsg(language) === 'object' ? language : 'generic';
        localized.labels[language] = {
            name: getMsg(`${langPrefix}.placeholder`, [language]),
            description: getMsg(`${langPrefix}.descplaceholder`, [language])
        };
        localized.values[language] = {
            name: layer[`name_${language}`],
            description: layer[`title_${language}`]
        };
    });
    return (
        <StyledTab>
            <Message messageKey='interfaceAddress' />
            <StyledComponentGroup>
                <StyledComponent>
                    <div>
                        <UrlInput
                            key={layer.id}
                            value={layer.url}
                            onChange={(url) => controller.setLayerUrl(url)}
                            credentials={credentialProps}
                        />
                    </div>
                </StyledComponent>
            </StyledComponentGroup>
            <Message messageKey='uniqueName' />
            <StyledComponent>
                <TextInput type='text' value={layer.name} onChange={(evt) => controller.setLayerName(evt.target.value)} />
            </StyledComponent>
            <StyledComponentGroup>
                <LocalizationComponent
                    labels={localized.labels}
                    value={localized.values}
                    languages={Oskari.getSupportedLanguages()}
                    onChange={controller.setLocalizedNames}
                    LabelComponent={PaddedLabel}
                >
                    <TextInput type='text' name='name'/>
                    <Padding/>
                    <TextInput type='text' name='description'/>
                    <Padding/>
                </LocalizationComponent>
            </StyledComponentGroup>
            <Message messageKey='dataProvider' />
            <StyledComponent>
                <DataProviderSelect key={layer.id}
                    value={layer.organizationName}
                    onChange={(evt) => controller.setDataProvider(evt)}
                    dataProviders={dataProviders} />
            </StyledComponent>
            <Message messageKey='mapLayerGroups' />
            <StyledComponent>
                <MapLayerGroups layer={layer} mapLayerGroups={mapLayerGroups} controller={controller} lang={Oskari.getLang()} />
            </StyledComponent>
        </StyledTab>
    );
};

GeneralTabPane.propTypes = {
    mapLayerGroups: PropTypes.array.isRequired,
    dataProviders: PropTypes.array.isRequired,
    controller: PropTypes.instanceOf(Controller).isRequired,
    layer: PropTypes.object,
    bundleKey: PropTypes.string.isRequired
};

const contextWrap = LocaleConsumer(GeneralTabPane);
export { contextWrap as GeneralTabPane };
