import React, { useRef } from "react"
import { useInView } from "react-intersection-observer"
import { StaticImage } from "gatsby-plugin-image"
import { useMachine } from "@xstate/react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Button from "../components/button"
import PercentageCircle from "../components/percentage-circle"

import { duelingMachine, DuelingEvent, DuelingContext, Character, Stats, characters, spells } from "../machines/dueling"

import * as duelingStyles from "./dueling-club.module.css"

interface GameGridProps {
    field: React.ReactNode
    className?: string
    style?: React.CSSProperties
}
const GameGrid: React.FC<GameGridProps> = ({field, className, style, children}) => {
    const { ref: topRef, inView: topInView } = useInView({
        initialInView: true,
        threshold: 0.5,
    })
    const { ref: bottomRef, inView: bottomInView } = useInView({
        threshold: 0.5,
    })

    const numChildren = React.Children.count(children)
    const taggedChildren = React.Children.map(children, (child, index) => {
        if (index == 0) {
            return (<div ref={topRef}>{child}</div>)
        }
        if (index == numChildren-1) {
            return (<div ref={bottomRef}>{child}</div>)
        }
        // in all other cases, pass the child down
        return child
    })

    return (
        <div className={duelingStyles.gameGrid}>
            <div className={duelingStyles.gameField}>
                {field}
            </div>
            <div className={duelingStyles.gameControl}>
                <div className={`${duelingStyles.scrollBox} ${className ? className : ''}`} style={style}>
                    {taggedChildren}
                </div>
                {topInView ? null : <div className={duelingStyles.scrollUpIcon} aria-hidden={true}/>}
                {bottomInView ? null : <div className={duelingStyles.scrollDownIcon} aria-hidden={true}/>}
            </div>
        </div>
    )
}

interface HasSend {
    send: (event: DuelingEvent) => void;
}

interface CharacterStats {
    character: Character | null
    stats: Stats
}

const CharacterStatsDisplay: React.FC<CharacterStats> = ({ character, stats }) => (
    <div className="flex flex-col">
        <PercentageCircle percentage={stats.hp}>
            <div className="grid">
                <img src={`/dueling-club/${character?.name}-headshot.png`} width={128} height={128}
                    style={{ gridArea: "1/1" }}/>
                <div className="relative" style={{ gridArea: "1/1" }}>
                    {stats.effect}
                </div>
            </div>
        </PercentageCircle>
        <div className="flex-grow"/>
        {/* TODO explanations */}
    </div>
)

interface Completion {
    victor: Character | null
    win: boolean
}

const CompletionPage: React.FC<Completion & HasSend> = ({victor, win, send}) => (
    <div className="grid overflow-y-auto">
        <img src="/dueling-club/bg-landscape.png" width={700} height={394} style={{ gridArea: "1/1" }} className="w-full"/>
        <div className="flex flex-col relative items-center" style={{ gridArea: "1/1" }}>
            {victor ? <img src={`/dueling-club/${victor.name}-left.png`} width={300} height={300}/> : <span/>}
            <span className="text-xl text-center text-white">
                { victor ? (win ? "You won!" : "Your opponent has won!") : "The duel results in a draw." }
            </span>
            <Button text={"Play again!"} onClick={() => send({ type: "AGAIN" })}/>
        </div>
    </div>
)

const BattlefieldPage: React.FC<HasSend & DuelingContext> = ({player, opponent, character, opponentCharacter, send}) => (
    <GameGrid field={(
        <div className="flex flex-row">
            <CharacterStatsDisplay character={character} stats={player}/>
            <div className="flex-grow"/>
            <CharacterStatsDisplay character={opponentCharacter} stats={opponent}/>
        </div>
    )} className="flex flex-col">
        {spells.map(spell => (
            <div className="flex flex-row w-full border border-black p-2 justify-between items-center bg-gray-300">
                <img src={`/dueling-club/${spell.icon}.png`} width={128} height={128}/>
                <div className="flex flex-col items-center">
                    <span className="text-xl text-center">{spell.display}</span>
                    <span className="text-sm text-center">{spell.description}</span>
                </div>
                <Button text={"Cast"} onClick={() => send({ type: "CAST_SPELL", spell })}/>
            </div>
        ))}
    </GameGrid>
)

const CharacterDisplay: React.FC<Character & HasSend> = ({ name, send }) => {
    return (
        <div className="flex flex-col items-center border border-black p-2 my-2 bg-purple-600 bg-opacity-75">
            <img src={`/dueling-club/${name}-headshot.png`} width={128} height={128}/>
            <Button text="Choose" onClick={() => send({ type: "PICK_CHARACTER", selected: { name } })}/>
        </div>
    )
}

const CharacterSelectPage: React.FC<HasSend> = ({send}) => (
    <GameGrid field={(
        <span className="text-3xl text-white">
            Choose your character from the list.
        </span>
    )} className="flex flex-col items-stretch">
        {characters.map(character => <CharacterDisplay {...character} send={send}/>)}
    </GameGrid>
)

const StartPage : React.FC<HasSend> = ({send}) => (
    <div className="grid">
        <StaticImage src="../images/dueling-club/background.png" alt="Two wizards dueling"
            placeholder="blurred" layout="fullWidth"
            style={{
                gridArea: "1/1",
            }}/>
        <div className="flex flex-col items-center relative p-4"
                style={{
                    gridArea: "1/1",
                }}>
            <div className="flex-grow"></div>
            <h1 className="text-4xl text-white mb-1">Welcome to Dueling Club!</h1>
            <Button text={"Click to play!"} onClick={() => send({ type: 'START' })}/>
        </div>
    </div>
)

const DuelingClubPage : React.FC<{}> = () => {
    const [current, send] = useMachine(duelingMachine, {
        devTools: true,
    })
    let component = <h3>Not implemented</h3>;
    if (current.matches('intro')) {
        component = <StartPage send={send}/>;
    } else if (current.matches('characterSelect')) {
        component = <CharacterSelectPage send={send}/>;
    } else if (current.matches('battle')) {
        component = <BattlefieldPage send={send} {...current.context}/>;
    } else if (current.matches('victory')) {
        component = <CompletionPage send={send} victor={current.context.character} win={true}/>;
    } else if (current.matches('defeat')) {
        component = <CompletionPage send={send} victor={current.context.opponentCharacter} win={false}/>;
    } else if (current.matches('draw')) {
        component = <CompletionPage send={send} victor={null} win={false}/>;
    }

    return (
        <Layout scrollBody={false}>
            <SEO title="Dueling Club" />
            {component}
        </Layout>
    )
}

export default DuelingClubPage
