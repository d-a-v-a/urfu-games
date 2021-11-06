import { v4 as uuid } from "uuid";
import { Request, Response, NextFunction } from "express";
import multer, { diskStorage } from "multer";
import path from "path";
import fs from "fs";
import { Document } from "mongoose";
import { matchedData } from "express-validator";

import { LogicError, AccessError } from "../../../utils/errors";
import { Game, IGame } from "../../../models/game";
import Comment from "../../../models/comment";
import { Role } from "../../../models/user";
import GameDTO from "../../../utils/dto/game";

type GameDocument = IGame & Document<any, any, IGame>;

type AddGameData = {
    competencies: Array<string>,
    name: string,
    description: string,
    participant: Array<string>
}

export async function addGame(req: Request, res: Response, next: NextFunction) {
    try {
        const data = <AddGameData> matchedData(req, { locations: ["body"] });
        const user: any = req.user;
        
        const id: string = uuid();
        const game: GameDocument = await Game.create({ 
            ...data,
            id,
            author: user.id,
            url: `/games/${id}`,
            createdAt: Date.now()
        });

        res.json(new GameDTO(game));
    }
    catch (err) {
        next(err);
    }
}

type GetGameData = {
    gameId: string
};

export async function getGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const data = <GetGameData> matchedData(req, { locations: [ "params" ] });
        const game: GameDocument = await Game.findOne({ id: data.gameId });

        res.json(new GameDTO(game));
    }
    catch (err) {
        next(err);
    }
}

export async function getGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const games: Array<GameDocument> = await Game.find();

        res.json(games.map(game => new GameDTO(game)));
    }
    catch (err) {
        next(err);
    }
}

type UpdateGameData = {
    gameId: string,
    competencies: Array<string> | undefined,
    name: string | undefined,
    description: string | undefined,
    participants: Array<string> | undefined
}

export async function updateGame(req: Request, res: Response, next: NextFunction) {
    try {
        const data = <UpdateGameData> matchedData(req, { locations: [ "body", "params" ] });
        const user: any = req.user;
        const game: GameDocument = await Game.findOne({ id: data.gameId });

        if (game.author !== user.id && user.role !== Role.Admin) 
            res.status(403).json({ errors: [ new AccessError(req.originalUrl) ] });
        else {
            game.set(data);

            await game.save();

            res.json(new GameDTO(game));
        }
    }
    catch(err) {
        next(err);
    }
}

export const uploadGame = [
    multer({ 
        storage: 
            diskStorage({
                destination(req: Request, file: Express.Multer.File, cb: (error: Error, destination: string) => void) {
                    const directory: string = path.join(process.env.PUBLIC_DIR, "/games", req.params.id);

                    // Создадим директорию, если её не существует
                    if (!fs.existsSync(directory)) 
                        fs.mkdirSync(directory, { recursive: true });

                    cb(null, directory);
                },
                filename(req: Request, file: Express.Multer.File, cb: (error: Error, filename: string) => void) {
                    cb(null, file.originalname);
                }
            })
    })
        .array("files", 50),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.files.length === 0) {
                res.status(400).json({ errors: [
                    new LogicError(req.originalUrl, "Ни одного файла не было загружено.")
                ]});
            }
            else {
                const game: GameDocument = await Game.findOne({ id: req.params.id });
    
                const filesLoaded: Array<string> = [];
                for (const file of <Array<Express.Multer.File>> req.files)
                    filesLoaded.push(file.originalname);
    
                game.uploaded = true; 
    
                await game.save();
    
                res.json({ filesLoaded });
            }
        }
        catch (err) {
            next(err);
        }
    }
];

type DeleteGameData = {
    gameId: string
}

export async function deleteGame(req: Request, res: Response, next: NextFunction) {
    try {
        const data = <DeleteGameData> matchedData(req, { locations: [ "params" ] });
        const game: GameDocument = await Game.findOne({ id: data.gameId });
        const user: any = req.user;

        // Если игра не принадлежит пользователю и он не является администратором
        if (game.author !== user.id && user.role !== Role.Admin) 
            res.status(403).json({ errors: [ new AccessError(req.originalUrl) ] });
        else {
            const directory: string = path.join(process.env.PUBLIC_DIR, "/games", data.gameId);

            await game.delete();

            if (fs.existsSync(directory)) // Удаляем директорию, содержащую файлы игры, если она существует
                fs.rmSync(directory, { recursive: true });

            await Comment.deleteMany({ gameId: game.id }); // Удаляем комментарии, относящиеся к игре

            res.json(new GameDTO(game));
        }
    }
    catch (err) {
        next(err);
    }
}

