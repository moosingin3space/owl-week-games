import React from "react"
import { useInView } from "react-intersection-observer"
import { StaticImage } from "gatsby-plugin-image"
import { useMachine } from "@xstate/react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Button from "../components/button"
import Modal from "../components/modal"
import PercentageCircle from "../components/percentage-circle"
import Gauge from "../components/gauge"

import { Character, UxEvent, UxState, uxMachine, PlayerState, characters, spells } from "../machines/dueling-club"

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
    send: (event: UxEvent) => void;
}

interface CharacterStats {
    character: Character | null
    state: PlayerState
}

const getStyleFor = (state: PlayerState): string => {
    if (state.matches('flipped')) {
        return duelingStyles.flippedPlayer;
    }
    if (state.matches('disarmed')) {
        return duelingStyles.disarmedPlayer;
    }
    if (state.matches('bound')) {
        return duelingStyles.boundPlayer;
    }

    return '';
};

const CharacterStatsDisplay: React.FC<CharacterStats> = ({ character, state }) => (
    <PercentageCircle percentage={state.context.hp}>
        <div className={`grid ${getStyleFor(state)}`}>
            <img src={`/dueling-club/${character?.name}-headshot.png`} width={128} height={128}
                style={{ gridArea: "1/1" }}/>
            <div className="relative" style={{ gridArea: "1/1" }}>
            </div>
        </div>
    </PercentageCircle>
)

interface Completion {
    victor: Character | null
    win: boolean
}

const CompletionPage: React.FC<Completion & HasSend> = ({victor, win, send}) => (
    <div className="grid">
        <img src="/dueling-club/bg-landscape.png" width={700} height={394} style={{ gridArea: "1/1" }} className="w-full"/>
        <div className="flex flex-col relative items-center" style={{ gridArea: "1/1" }}>
            <span className="text-xl text-center text-white">
                { victor ? (win ? "You won!" : "Your opponent has won!") : "The duel results in a draw." }
            </span>
            <Button text={"Play again!"} onClick={() => send({ type: "AGAIN" })}/>
            {victor ? <img src={`/dueling-club/${victor.name}-left.png`} width={300} height={300} className="mh-full"/> : <span/>}
        </div>
    </div>
)

interface BattlefieldProps extends HasSend {
    current: UxState,
}

const BattlefieldPage: React.FC<BattlefieldProps> = ({current, send}) => {
    const spellTarget = current.matches('battle.waitSpellTarget');
    const resolvingAnimation = current.matches('battle.resolving');
    const waitNext = current.matches('battle.waitNext');

    const showModal = spellTarget || resolvingAnimation || waitNext;
    let modalComponent = <h3>Not implemented</h3>;
    if (spellTarget) {
        const accuracy = current.context.human!.state.context.accuracy;
        modalComponent = (
            <div className="flex flex-col items-center p-6">
                <h3 className="font-bold" >Target your spell!</h3>
                <Gauge yellowThresh={accuracy / 2.5} greenThresh={accuracy} buttonLabel={"Cast"}
                    onStopped={(targetPosition) => send({ type: 'TARGET_SPELL', targetPosition })}/>
            </div>
        );
    } else if (resolvingAnimation || waitNext) {
        modalComponent = (
            <div className="flex flex-col items-center p-6 bg-black text-white">
                <h3>Resolving...</h3>
                <div className="flex flex-row">
                    <img src={`/dueling-club/wand.gif`} width={200} height={50} style={{ transform: "scale(-1, 1)" }}/>
                    <img src={`/dueling-club/wand.gif`} width={200} height={50}/>
                </div>
                { waitNext ? <Button text={"Next"} onClick={() => send({ type: 'NEXT_TURN' })}/> : null }
            </div>
        );
    }
    return (
        <GameGrid field={(
            <div className="flex flex-row">
                <CharacterStatsDisplay character={current.context.humanCharacter} state={current.context.human!.state}/>
                <div className="flex-grow"/>
                <CharacterStatsDisplay character={current.context.aiCharacter} state={current.context.ai!.state}/>
            </div>
        )} className="flex flex-col">
            {spells.map(spell => (
                <div key={spell.display} className="flex flex-row w-full border border-black p-2 justify-between items-center bg-gray-300">
                    <img src={`/dueling-club/${spell.icon}.png`} width={128} height={128}/>
                    <div className="flex flex-col items-center">
                        <span className="text-xl text-center">{spell.display}</span>
                        <span className="text-sm text-center">{spell.description}</span>
                    </div>
                    <Button text={"Cast"} onClick={() => send({ type: "CHOOSE_SPELL", selected: spell })}/>
                </div>
            ))}
            <Modal visible={showModal}>
                {modalComponent}
            </Modal>
        </GameGrid>
    )
}

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
        {characters.map(character => <CharacterDisplay key={character.name} {...character} send={send}/>)}
    </GameGrid>
)

const StartPage : React.FC<HasSend> = ({send}) => (
    <div className="grid">
        <img src="/dueling-club/background.png" width={700} height={394} style={{ gridArea: "1/1" }} className="w-full"/>
        <div className="flex flex-col items-center relative p-4"
                style={{
                    gridArea: "1/1",
                }}>
            <div className="flex-grow"></div>
            <h1 className={`text-4xl text-black mb-1 ${duelingStyles.outlined}`}>Welcome to Dueling Club!</h1>
            <Button text={"Click to play!"} onClick={() => send({ type: 'START' })}/>
            <div className="flex-grow"></div>
        </div>
    </div>
)

const DuelingClubPage : React.FC<{}> = () => {
    const [current, send] = useMachine(uxMachine, {
        devTools: true,
    })
    let component = <h3>Not implemented</h3>;
    let scrollBody = true;
    if (current.matches('intro')) {
        component = <StartPage send={send}/>;
    } else if (current.matches('config')) {
        component = <CharacterSelectPage send={send}/>;
        scrollBody = false;
    } else if (current.matches('battle')) {
        component = <BattlefieldPage send={send} current={current}/>;
        scrollBody = false;
    } else if (current.matches('win')) {
        component = <CompletionPage send={send} victor={current.context.humanCharacter} win={true}/>;
    } else if (current.matches('loss')) {
        component = <CompletionPage send={send} victor={current.context.aiCharacter} win={false}/>;
    } else if (current.matches('draw')) {
        component = <CompletionPage send={send} victor={null} win={false}/>;
    }

    return (
        <Layout scrollBody={scrollBody}>
            <SEO title="Dueling Club" />
            {component}
        </Layout>
    )
}

export default DuelingClubPage
