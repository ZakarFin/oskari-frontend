Oskari.registerLocalization(
{
    "lang": "ru",
    "key": "MyPlacesImport",
    "value": {
        "title": "Собственные наборы данных",
        "tool": {
            "tooltip": "Импортировать свои собственные наборы данных."
        },
        "flyout": {
            "title": "Импортировать набор данных",
            "description": "Загрузите набор данных с вашего компьютера в форме ZIP файлов, которые содержат все необходимые файлы одного из следующих форматов: <ul><li>Shapefile (.shp, .shx и .dbf, опционально .prj и .cpg)</li><li>GPX-file (.gpx)</li><li>MapInfo (.mif и .mid)</li><li>Google Maps (.kml и .kmz)</li></ul>ZIP файл может содержать лишь один набор данных и не может превышать {maxSize, number} Мб.",
            "help": "Загрузите набор данных с вашего компьютера в форме ZIP файлов. Проверьте, чтобы все файлы находились в нужном формате и согласованы с системой координат.",
            "success": "Набор данных импортирован с {count, number} объектами. Теперь вы можете его найти в меню \"Мои данные\"",
            "layer": {
                "title": "Информация о наборе данных",
                "name": "Название слоя карты",
                "desc": "Описание",
                "source": "Источник данных",
                "style": "Определение стилей"
            },
            "validations": {
                "file": "Отсутствуют файл."
            },
            "error": {
                "title": "Не удалось импортировать набор данных.",
                "timeout": "Не удалось завершить импорт набора данных из-за ошибки времени ожидания.",
                "abort": "Импорт набора данных был прерван.",
                "generic": "Ошибка импорта набора данных.",

                // Parser errors
                "parser_error": "Не удалось обработать набор данных.",
                // Doesn't have different localization for shp, use same to both
                "noSrs": "Неизвестные данные проекции в исходном файле импортирования. Убедитесь, что все файлы находятся в системе координат карты или что файлы содержат необходимую информацию о преобразовании.",
                "shpNoSrs": "Неизвестные данные проекции в исходном файле импортирования. Убедитесь, что все файлы находятся в системе координат карты или что файлы содержат необходимую информацию о преобразовании.",

                // Error codes from backend
                "no_main_file": "Не улалось найти приемлемый импортируемый файл в ZIP файле. Проверьте, чтобы формат файла поддерживался и был ZIP файлом.",
                "unable_to_store_data": "Не удалось сохранить пользовательские данные в базе данных или нет объектов во входных данных.",
                "file_over_size": "Выбранный файл слишком велик. Самое большое допустимое значение - {maxSize, number} Mб.",
                "no_features": "Не удалось найти объекты во входных данных"
            },
            "warning": {
                "features_skipped": "Осторожно! Во время импортирования <xx> пространственных объектов были отклоненны из-за отсутствия или нарушения координат или геометрии"
            }
        },
        "tab": {
            "title": "Набор данных",
            "editLayer": "Редактировать слой карты",
            "deleteLayer": "Стереть слой карты",
            "grid": {
                "name": "Название",
                "desc": "Описание",
                "source": "Источник данных",
                "edit": "Редактировать",
                "editButton": "Редактировать",
                "remove": "Удалить",
                "removeButton": "Удалить"
            },
            "confirmDeleteMsg": "Вы хотите удалить набор данных \"{name}\"?",
            "buttons": {
                "ok": "OK",
                "save": "Сохранить",
                "cancel": "Отменить",
                "delete": "Удалить",
                "close": "Закрыть"
            },
            "notification": {
                "deletedTitle": "Удаление набора данных",
                "deletedMsg": "Набор данных удален.",
                "editedMsg": "Набор данных обновлен."
            },
            "error": {
                "title": "Ошибка",
                "generic": "Произошла системная ошибка.",
                "deleteMsg": "Не удалось удалить набор данных из-за ошибки в системе. Повторите попытку позже.",
                "editMsg": "Не удалось обновить набор данных из-за ошибки в системе. Повторите попытку позже.",
                "getStyle": "Стиль, определенный для набора данных, не найден. В форме отображаются значения по умолчанию. Измените определения стилей перед сохранением изменений",
                "styleName": "Присвойте название слою карты и повторите попытку."
            }
        },
        "layer": {
            "organization": "Личный набор данных",
            "inspire": "Личный набор данных"
        }
    }
});
