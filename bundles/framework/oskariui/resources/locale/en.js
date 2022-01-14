Oskari.registerLocalization({
    lang: 'en',
    key: 'oskariui',
    value: {
        error: {
            generic: 'Something went wrong'
        },
        table: {
            sort: {
                desc: 'Click to sort descending',
                asc: 'Click to sort ascending',
                cancel: 'Click to cancel sorting'
            }
        },
        StyleEditor: {
            subheaders: {
                styleFormat: 'Geometry type',
                name: 'Style name',
                style: 'Style',
                pointTab: 'Point',
                lineTab: 'Line',
                areaTab: 'Area'
            },
            fill: {
                color: 'Fill colour',
                area: {
                    pattern: 'Fill pattern'
                }
            },
            image: {
                shape: 'Icon',
                size: 'Size',
                fill: {
                    color: 'Fill colour'
                }
            },
            stroke: {
                color: 'Colour',
                lineCap: 'Endings',
                lineDash: 'Dash',
                lineJoin: 'Corners',
                width: 'Width',
                area: {
                    color: 'Colour',
                    lineDash: 'Dash',
                    lineJoin: 'Corners',
                    width: 'Line width'
                }
            }
        },
        FileInput: {
            drag: 'Drag {maxCount, plural, one {a file} other {files}} here or select by browsing.',
            noFiles: 'No file selected.',
            error: {
                invalidType: 'File format is not allowed.',
                allowedExtensions: 'Allowed file extensions: {allowedExtensions}.',
                multipleNotAllowed: 'Only single file is allowed to be uploaded.',
                fileSize: 'The selected file is too large. It can be at most {maxSize, number} Mb.'
            }
        },
        LocalizationComponent: {
            locale: {
                fi: 'in Finnish',
                en: 'in English',
                sv: 'in Swedish'
            }
        },
        Spin: {
            loading: 'Loading...'
        }
    }
});
