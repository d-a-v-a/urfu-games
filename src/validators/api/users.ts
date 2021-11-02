import { body, param, query, oneOf } from "express-validator";

import User from "../../models/user";
import requestValidator from "../request_validator";

export const getUsers = [
    query("id")
        .optional()
        .customSanitizer(id => {
            if (!Array.isArray(id))
                return [ id ];
            return id;
        }),
    query("id.*")
        .isUUID(),
    requestValidator
];

export const getUser = [
    param("id")
        .isUUID()
        .custom(async (id: string) => {
            if (!await User.exists({ id }))
                throw new Error("Пользователь с указанным id не существует");
        }),
    requestValidator
];

export const updateUser = [
    param("id")
        .isUUID()
        .custom(async (id: string) => {
            if (!await User.exists({ id }))
                throw new Error("Пользователь с указанным id не существует");
        }),
    body("name")
        .optional()
        .isLength({ min: 0, max: 50 }),
    body("surname")
        .optional()
        .isLength({ min: 0, max: 50 }),
    body("patronymic")
        .optional()
        .isLength({ min: 0, max: 50 }),
    body("email")
        .optional()
        .isEmail(),
    requestValidator
];
