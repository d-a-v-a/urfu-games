import React, { useState, useEffect } from "react";
import { observer, useLocalObservable } from "mobx-react-lite";
import { NavLink, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
    Button,
    Rating
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

import Block from "../components/Block";
import Competence from "../components/Competence";
import {
    CommentForm,
    CommentsListView
} from "../components/comments";
import { Game } from "../models/game";
import { useStore } from "../hooks";
import * as globals from "../globals";

import styles from "./GamePage.module.css";

function GamePage({ history }) {
    const params = useParams(); // { gameId: string }

    const { auth } = useStore();

    const game = useLocalObservable(() => Game.create());

    const handleCommentFormSubmit = (text) => game.comment(text);
    const handleRatingChange = (evt, value) => game.rate(value);
    const handlePlayButtonClick = () => {
        if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== "development") {
            window.ym(globals.YM_ID, "reachGoal", "play_button_click");
        }
    };
    const handleDeleteButtonClick = () => {
        game.delete()
            .then(() => history.push("/"))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        game.load(params.gameId).catch(err => {
            if (err.response.status == 404) history.push("/404");
            else {
                console.error(err);
                history.push("/");
            }
        });
    }, []);
    useEffect(() => {
        if (game.loaded)
            game.loadComments().catch(err => console.error(err));
    }, [game.loaded]);
    return (
        <>
            <Helmet>
                <title>{game.loaded ? game.name : "Загрузка"}</title>
            </Helmet>
            {game.loaded && (
                <>
                    <div className={styles.wrapper}>
                        <Block className={styles.paper}>
                            {auth.user && auth.user.isAdmin() && (
                                <button onClick={handleDeleteButtonClick}>Удалить</button>
                            )}
                            <div className={styles.contentWrapper}>
                                <div className={styles.content}>
                                    <div className={styles.topBlock}>
                                        <div className={styles.cover}>
                                            <img src={game.image} alt="cover" />
                                        </div>
                                        <div className={styles.gameData}>
                                            <p className={styles.name}>{game.name}</p>
                                            <div className={styles.details}>
                                                {game.participants.length > 0 && (
                                                    <p>
                                                        <span className={styles.caption}>Участники: </span>
                                                        <span>
                                                            {game.participants.map(p => p.login).join(", ")}
                                                        </span>
                                                    </p>
                                                )}
                                                <span className={styles.caption}>Компетенции: </span>
                                                <span className={styles.competencies}>
                                                    {game.competencies.map((c, i) => (
                                                        <Competence key={i} competence={c} enablePopup />
                                                    ))}
                                                </span> 
                                            </div> 
                                            <div className={styles.ratingContainer}>
                                                <Rating 
                                                    className={styles.rating}
                                                    size="large" 
                                                    value={game.rating} 
                                                    readOnly={true}
                                                />
                                                <Rating 
                                                    className={styles.rating}
                                                    size="large" 
                                                    onChange={handleRatingChange} 
                                                    readOnly={!auth.authenticated}
                                                />
                                                <span className={styles.ratingCaption}>{Math.round(game.rating)}</span>
                                            </div>
                                            <div className={styles.gameButtonsContainer}>
                                                <NavLink 
                                                    className={styles.playButtonLink} 
                                                    to={`/games/${params.gameId}/play`}
                                                >
                                                    <Button className={styles.playButton} variant="contained" onClick={handlePlayButtonClick}>
                                                        Играть
                                                    </Button>
                                                </NavLink>
                                                { auth.authenticated && 1 === 0 && (
                                                    <NavLink 
                                                        className={styles.settingsButtonLink} 
                                                        to={`/games/${params.gameId}/settings`}
                                                    >
                                                        <Button className={styles.settingsButton} variant="contained">
                                                            <SettingsIcon />
                                                        </Button>
                                                    </NavLink>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.descriptionBlock}>
                                        <p className={styles.blockCaption}>Описание</p>
                                        <div className={styles.descriptionContainer}>
                                            <span className={styles.description}>
                                                {game.description}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.commentsBlock}>
                                        <p className={styles.blockCaption}>
                                            {`Комментарии (${game.comments.size})`}
                                        </p>
                                        <div>
                                            {auth.authenticated && <CommentForm onSubmit={handleCommentFormSubmit} />}
                                            <CommentsListView store={game.comments} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Block>
                    </div>
                </>
            )}
        </>
    );
}

export default observer(GamePage);
