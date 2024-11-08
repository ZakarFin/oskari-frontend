import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'oskari-ui';
import { Row, Col, ColFixed, StyledButton, StyledDateSlider, CalendarIcon } from './styled';
import { ThemeConsumer } from 'oskari-ui/util';
import { getHeaderTheme } from 'oskari-ui/theme';
import { Input } from './Input';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

/**
 * NOTE! Hardcoded to year 2019 so no leap years
 */
const DAYS = 365;

export const DateControl = ThemeConsumer(({ theme, isMobile, changeHandler, sliderDateValue, dateValue, currentTimeHandler }) => {
    const helper = getHeaderTheme(theme);
    const color = helper.getAccentColor();
    const hover = Oskari.util.getColorEffect(color, 30);
    const changeSliderDate = (val) => {
        const d = new Date(2019, 0, val);
        const timeToSet = dayjs(d).format('D/M');
        changeHandler(timeToSet);
    };

    const marksForDate = () => {
        const months = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
        let i = 0;
        return months.reduce((marks, month) => {
            i++;
            return {
                ...marks,
                [month]: {
                    label: i
                }
            };
        }, {});
    };

    const setCurrentTime = () => {
        const d = new Date();
        const fMinutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
        const curTime = `${d.getHours()}:${fMinutes}`;
        const curDate = `${d.getDate()}/${d.getMonth() + 1}`;
        currentTimeHandler(curTime, curDate);
    };

    return (
        <Row>
            <Col>
                <Input value={dateValue} changeHandler={changeHandler}><CalendarIcon /></Input>
            </Col>
            {!isMobile &&
                <ColFixed>
                    <StyledDateSlider
                        color={color}
                        hover={hover}
                        marks={marksForDate()}
                        min={1} max={DAYS} step={1}
                        value={sliderDateValue}
                        onChange={changeSliderDate}
                        tooltip={{ open: false }}/>
                </ColFixed>
            }
            <Col>
                <StyledButton hover={hover} color={color} onClick={setCurrentTime}>
                    <Message messageKey={'present'} />
                </StyledButton>
            </Col>
        </Row>
    );
});

DateControl.propTypes = {
    isMobile: PropTypes.bool.isRequired,
    changeHandler: PropTypes.func.isRequired,
    sliderDateValue: PropTypes.number.isRequired,
    dateValue: PropTypes.string.isRequired,
    currentTimeHandler: PropTypes.func.isRequired
};
