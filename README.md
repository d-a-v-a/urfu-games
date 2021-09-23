# UrFU Games Server
Первый компонент(back-end) проекта «UrFU Games» реализует API, систему аутентификации/авторизации и логику работы с базой данных MongoDB

# Настройка
Перед запуском необходимо в директории /src создать .env файл со следующим содержимым:
```
MONGO_URI={uri_адрес_mongodb}
MONGO_USR={имя_пользователя}
MONGO_PWD={пароль_пользователя}
MONGO_DBN={имя_базы_данных}
JWT_SECRET={jwt_секрет}
USER_PWD_SALT={соль_для_хеширования_паролей_пользователей}
```

