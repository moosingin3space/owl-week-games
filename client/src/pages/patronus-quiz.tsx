import React, { useEffect } from "react"
import { useMachine } from "@xstate/react"

import Layout, { ScrollType } from "../components/layout"
import SEO from "../components/seo"
import Button from "../components/button"
import Attribution from "../components/attribution"
import Scroller from "../components/scroller"

import { quizMachine, QuizEvent } from "../machines/quizMachine"
import { Question, Answer, results } from "../machines/quizQuestions"

interface HasSend {
    send: (event: QuizEvent) => void;
}

interface MaybeHasClasses {
    extraClasses?: Array<string>
    style?: React.CSSProperties
}

type QuestionProps = {
    question: Question
    selectedAnswer: Answer | null
}

type ResultProps = {
    result: string
}

const Column : React.FC<MaybeHasClasses> = ({extraClasses, style, children}) => {
    let classes = ['flex', 'flex-col', 'items-center'];
    if (extraClasses) {
        for (const cl of extraClasses) {
            classes.push(cl);
        }
    }
    return (
        <section className={classes.join(' ')} style={style}>
            {children}
        </section>
    )
}

const QuestionRoot : React.FC<{}> = ({children}) => (
    <section
        className="flex flex-col items-center justify-center md:flex-row"
    >
        {children}
    </section>
)

const StartPage : React.FC<HasSend> = ({send}) => {
    return (
        <Column>
            <h1 className="text-4xl">Choose your Patronus!</h1>
            <div className="flex flex-col items-center">
                <img src="/patronus-quiz/background.jpg" width={450} height={400} className="w-full"/>
                <Attribution
                    name={"La Luz Reflejo Resumen"}
                    url={"https://pixabay.com/es/illustrations/la-luz-reflejo-resumen-llamarada-1330837/"}
                    author={{
                        name: "Gerd Altmann",
                        url: "https://pixabay.com/es/users/geralt-9301/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1330837"
                    }}
                    license={{
                        name: "Pixabay License",
                        url: "https://pixabay.com/es/service/license/"
                    }}
                />
            </div>
            <p className="text-xl">Answer the questions to find your Patronus animal!</p>
            <Button text="Click to begin!" onClick={() => send({ type: 'START' })}/>
        </Column>
    )
}

const QuestionPage : React.FC<HasSend & QuestionProps> = ({send, question, selectedAnswer}) => {
    return (
        <QuestionRoot>
            <Column>
                <img src={question.image} width={450} height={450} style={{ maxWidth: "100%", height: "auto" }}/>
                { question.attribution ? <Attribution {...question.attribution}/> : null }
            </Column>
            <Column extraClasses={["md:px-8 md:w-96 max-w-full"]}>
                <h3 className="text-2xl">{question.title}</h3>
                <ul className="w-full">
                    {question.answers.map((answer) => {
                        let classes = ['border-2', 'border-solid', 'rounded-md', 'border-black', 'w-full'];
                        if (answer == selectedAnswer) {
                            classes.push('bg-yellow-300')
                        } else {
                            classes.push('hover:bg-yellow-100')
                        }
                        return (
                            <li key={answer.point} className={classes.join(' ')}>
                                <input type="radio" name="q" value={answer.point} id={answer.point}
                                    onChange={() => send({ type: 'SELECT', selected: answer })}
                                    checked={answer == selectedAnswer}
                                    className="hidden"
                                />
                                <label htmlFor={answer.point} className="inline-block w-full p-6 hover:cursor-pointer">
                                    {answer.text}
                                </label>
                            </li>
                        )
                    })}
                </ul>
                <Button text="Next" onClick={() => send({ type: 'NEXT' })} enabled={selectedAnswer != null}/>
            </Column>
        </QuestionRoot>
    )
}

const ResultPage : React.FC<HasSend & ResultProps> = ({send, result}) => {
    const res = results.get(result)
    // TODO assert this being non-null
    const description = res ? res.text : "Error: couldn't compute a result!"
    return (
        <QuestionRoot>
            <Column>
                <h3 className="text-2xl">Your Patronus is a {result}</h3>
                <img src={res!.image} width={450} height={450}/>
                { res!.attribution ? <Attribution {...res!.attribution}/> : null }
            </Column>
            <Column extraClasses={["md:px-8 md:w-96 max-w-full"]}>
                <p>{description}</p>
                <Button text="Play again!" onClick={() => send({ type: 'AGAIN' })}/>
            </Column>
        </QuestionRoot>
    )
}

const PatronusQuizPage : React.FC<{}> = () => {
    const [current, send] = useMachine(quizMachine, {
        devTools: true,
    })

    let component = <h3>Not implemented</h3>;
    if (current.matches('intro')) {
        component = <StartPage send={send}/>;
    } else if (current.matches('unansweredQuestion') || current.matches('answeredQuestion')) {
        component = <QuestionPage send={send} question={current.context.questions[0]} selectedAnswer={current.context.selectedAnswer}/>;
    } else if (current.matches('done')) {
        const score = current.context.currentScore
        let runningCount = 0
        let runningAnswer : string|null = null
        score.forEach((count, answer) => {
            if (count > runningCount) {
                runningCount = count
                runningAnswer = answer
            }
            // TODO what if a tie
        })
        component = <ResultPage send={send} result={runningAnswer!}/>
    }

    return (
        <Layout scrollType={ScrollType.FullPage}>
            <SEO title="Patronus Quiz" />
            {component}
        </Layout>
    )
}

export default PatronusQuizPage
