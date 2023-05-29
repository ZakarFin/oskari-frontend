Oskari.registerLocalization({
    lang: 'sv',
    key: 'oskariui',
    value: {
        buttons: {
            add: 'Lägg till',
            cancel: 'Avbryt',
            close: 'Stäng',
            delete: 'Ta bort',
            edit: 'Redigera',
            save: 'Spara',
            submit: 'Skicka',
            import: 'Importera',
            yes: 'Ja',
            no: 'Nej',
            next: 'Nästa',
            previous: 'Föregående',
            print: 'Få utskrift',
            search: 'Sök',
            reset: 'Återställa',
            copy: 'Kopiera till klippbordet'
        },
        messages: {
            confirm: 'Är du säker på att du vill fortsätta?',
            confirmDelete: 'Vill du säkert ta bort?',
            copied: 'Kopieras'
        },
        error: {
            generic: 'Something went wrong'
        },
        table: {
            sort: {
                desc: 'Sortera i fallande ordning',
                asc: 'Sortera i stigande ordning',
                cancel: 'Annullera sorteringen'
            },
            emptyText: 'Ingen data.'
        },
        ColorPicker: {
            tooltip: 'Välj färg',
            moreColors: 'Mera färger'
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
            tooltips: {
                transparent: 'Ingen fyllning',
                solid: 'Täckande fyllning',
                thin_diagonal: 'Tunn diagonal linje',
                thick_diagonal: 'Tjock diagonal linje',
                thin_horizontal: 'Tunn horisontal linje',
                thick_horizontal: 'Tjock horisontal linje'
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
            otherLanguages: 'Andra språk',
            othersTip: 'Översättningar kommer att visas när tjänsten används på olika språk',
            locale: {
                generic: 'på ({0})',
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
