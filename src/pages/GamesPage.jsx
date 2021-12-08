import React from "react";
import Flickity from "react-flickity-component";
import { Button, Typography, Box } from "@material-ui/core";
import { Link, NavLink } from "react-router-dom";
import { observer } from "mobx-react-lite";

import Header from "../components/Header";
import Block from "../components/Block";
import GameCard from "../components/GameCard";
import Competence from "../components/Competence";
import CompetenciesList from "../components/CompetenciesList";
import { useStore } from "../hooks";

import "flickity/css/flickity.css";
import styles from "./GamesPage.module.css";

function GamesPage() {
    const { games, competencies } = useStore();

    const [isMobile, setIsMobile] = React.useState(false);

    const fetchAll = async ()=> {
        await games.loadGames();

        await competencies.load();
    };

    React.useEffect(() => {
        window.addEventListener("resize", () => setIsMobile(window.innerWidth < 1000));
       
        fetchAll(() => {}, () => {});
    }, []);
    return (        
        <>
            <div className={styles.pageGrid}>
                <div className={styles.sideBar}>
                    <CompetenciesList className={styles.competenciesList}>
                        {competencies.all().map((c, i) => (
                            <Competence key={i} competence={c} enablePopup />
                        ))}
                    </CompetenciesList>
                </div>
                <Block className={styles.content}>
                    <div className={styles.gamesWrapper}>
                        <div className={styles.gamesSection}>
                            <div className={styles.gamesSectionCaptionWrapper}>
                                <h2 className={styles.gamesSectionCaption}>Рекомендуемые</h2>
                                { /* 
                                <NavLink to="/games/:gameId" className={styles.showAll}>
                                    <Typography variant="h6">
                                        {isMobile ? "Все" : "Показать все"}
                                    </Typography>
                                </NavLink>
                                */ }
                            </div>
                            <GamesCardsCarousel>
                                { games.all().map((game, i, arr) => (
                                    <>
                                        <GameCard key={i} className={styles.carouselCard} game={game} />
                                        <GameCard key={i + arr.length} className={styles.carouselCard} game={game} />
                                    </>
                                ))} 
                            </GamesCardsCarousel>
                        </div>
                        <div className={styles.gamesSection}>
                            <div className={styles.gamesSectionCaptionWrapper}>
                                <h2 className={styles.gamesSectionCaption}>Все игры</h2>
                            </div>
                            <div className={styles.gamesGrid}>
                                { games.all().map((game, i, arr) => (
                                    <>
                                        <GameCard key={i} game={game} />
                                        <GameCard key={i + arr.length} game={game} />
                                    </>
                                ))} 
                            </div>
                        </div>
                    </div>
                </Block>
            </div>
        </>
    );
}

function GamesCardsCarousel({ children }) {
    const flickityOptions = {
        wrapAround: false,
        contain: true,
        freeSroll: false,
        pageDots: false,
        groupCells: true,
        arrowShape: "M 0,50 L 60,00 L 50,30 L 80,30 L 80,70 L 50,70 L 60,100 Z",
        prevNextButtons: true,
        cellAlign: "center",
    };

    return (
        <Flickity options={flickityOptions}>
            {children}
        </Flickity>
    );
}

export default observer(GamesPage);
