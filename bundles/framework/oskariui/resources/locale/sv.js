Oskari.registerLocalization({
    lang: 'sv',
    key: 'oskariui',
    value: {
        error: {
            generic: 'Something went wrong'
        },
        table: {
            sort: {
                desc: 'Sortera i fallande ordning',
                asc: 'Sortera i stigande ordning',
                cancel: 'Annullera sorteringen'
            }
        },
        StyleEditor: {
            subheaders: {
                styleFormat: 'Typ av geometri',
                name: 'Stilets namn',
                style: 'Stilet',
                pointTab: 'Punkten',
                lineTab: 'Linje',
                areaTab: 'Området'
            },
            fill: {
                color: 'Ifyllnadsfärg för område',
                area: {
                    pattern: 'Ifyllnandsmönster för område'
                }
            },
            image: {
                shape: 'Ikon',
                size: 'Storlek',
                fill: {
                    color: 'Ifyllnadsfärg för ikon'
                }
            },
            stroke: {
                color: 'Linjens färg',
                lineCap: 'Linjens ändpunkter',
                lineDash: 'Linjens stil',
                lineJoin: 'Hörn',
                width: 'Bredd',
                area: {
                    color: 'Linjens färg',
                    lineDash: 'Linjens stil',
                    lineJoin: 'Hörn',
                    width: 'Linjens bredd'
                }
            }
        },
        FileInput: {
            drag: 'Dra {maxCount, plural, one {fil} other {filerna}} hit, eller välj genom att bläddra.',
            noFiles: 'Ingen fil vald.',
            error: {
                invalidType: 'Filformatet är inte tillåtet.',
                allowedExtensions: 'Tillåtna filändelser: {allowedExtensions}.',
                multipleNotAllowed: 'Endast en fil kan laddas upp.',
                fileSize: 'Den valda filen är för stor. Den högsta tillåtna storleken är {maxSize, number} Mb.'
            }
        },
        LocalizationComponent: {
            locale: {
                fi: 'på finska',
                en: 'på engelska',
                sv: 'på svenska'
            }
        },
        Spin: {
            loading:'Laddar...'
        }
    }
});
