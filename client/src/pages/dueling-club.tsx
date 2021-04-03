import React from "react"
import { StaticImage } from "gatsby-plugin-image"
import { useMachine } from "@xstate/react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Button from "../components/button"

import { duelingMachine, DuelingEvent, DuelingContext, Character, Stats, characters } from "../machines/dueling"

interface HasSend {
    send: (event: DuelingEvent) => void;
}

interface CharacterStats {
    character: Character | null
    stats: Stats
}

const CharacterStatsDisplay: React.FC<CharacterStats> = ({ character, stats }) => (
    <div className="flex flex-col">
        <div className="grid">
            <img src={`/dueling-club/${character?.name}-left.png`} width={400} height={400}
                style={{ gridArea: "1/1" }}/>
            <div className="relative" style={{ gridArea: "1/1" }}>
                {stats.effect}
            </div>
        </div>
        {/* TODO HP bar */}
        <div className="flex-grow"/>
        {/* TODO explanations */}
    </div>
)

const BattlefieldPage: React.FC<HasSend & DuelingContext> = ({player, opponent, character, opponentCharacter, send}) => (
    <div className="flex flex-col">
        <div className="grid">
            <StaticImage src="../images/dueling-club/field.png" alt="Dueling field"
                    placeholder="blurred" layout="fullWidth"
                    style={{
                        gridArea: "1/1",
                    }}/>
            <div className="flex flex-row relative"
                    style={{
                        gridArea: "1/1",
                    }}>
                <CharacterStatsDisplay character={character} stats={player}/>
                <div className="flex-grow"/>
                <CharacterStatsDisplay character={opponentCharacter} stats={opponent}/>
            </div>
        </div>
        {/* TODO spells */}
    </div>
)

const CharacterDisplay: React.FC<Character & HasSend> = ({ name, send }) => {
    return (
        <div className="flex flex-row items-center border border-black p-2 my-2 bg-purple-600 bg-opacity-75">
            <img src={`/dueling-club/${name}-left.png`} width={400} height={400} style={{ maxWidth: "70%" }}/>
            <div className="flex-grow"></div>
            <Button text="Choose" onClick={() => send({ type: "PICK_CHARACTER", selected: { name } })}/>
        </div>
    )
}

const CharacterSelectPage: React.FC<HasSend> = ({send}) => (
    <div className="grid">
        <StaticImage src="../images/dueling-club/field.png" alt="Dueling field"
            placeholder="blurred" layout="fullWidth"
            style={{
                gridArea: "1/1",
            }}/>
        <div className="flex flex-col items-center relative p-4"
            style={{
                gridArea: "1/1",
            }}>
            <span className="text-3xl text-white">
                Choose your character from the list.
            </span>
            <div className="w-full flex flex-col items-stretch">
                {characters.map(character => <CharacterDisplay {...character} send={send}/>)}
            </div>
        </div>
    </div>
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
        // draw victory
    } else if (current.matches('defeat')) {
        // draw defeat
    }
    return (
        <Layout>
            <SEO title="Dueling Club" />
            {component}
        </Layout>
    )
}

export default DuelingClubPage
