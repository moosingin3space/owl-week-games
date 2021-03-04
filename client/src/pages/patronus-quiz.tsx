import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { useMachine } from "@xstate/react"

import Img from "gatsby-image"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Button from "../components/button"
import Attribution from "../components/attribution"

import { quizMachine, QuizEvent } from "../machines/quizMachine"
import { Question, Answer, results } from "../machines/quizQuestions"

interface HasSend {
    send: (event: QuizEvent) => void;
}

type QuestionProps = {
    question: Question
    selectedAnswer: Answer | null
}

type ResultProps = {
    result: string
}

const Column : React.FC<{}> = ({children}) => (
    <section className="flex flex-col items-center">
        {children}
    </section>
)

const StartPage : React.FC<HasSend> = ({send}) => {
    const data = useStaticQuery(graphql`
      query {
        patronusBgImage: file(relativePath: { eq: "patronus-quiz/background.png" }) {
            childImageSharp {
                fixed(width: 450, height: 450) {
                    ...GatsbyImageSharpFixed
                }
            }
        }
      }
    `)

    return (
        <Column>
            <h1 className="text-4xl">Choose your Patronus!</h1>
            <div className="flex flex-col items-center">
                <Img fixed={data.patronusBgImage.childImageSharp.fixed} />
                <Attribution
                    name={"Boo!"}
                    url={"https://www.sketchport.com/drawing/3270929/boo"}
                    author={{
                        name: "Aya Mulder",
                        url: "https://www.sketchport.com/user/1148026/aya-mulder"
                    }}
                    license={{
                        name: "CC-BY 2.0",
                        url: "https://creativecommons.org/licenses/by/4.0/?ref=ccsearch&atype=html"
                    }}
                    modifications="Cropped from original"
                />
            </div>
            <p className="text-xl">Answer the questions to find your Patronus animal!</p>
            <Button text="Click to begin!" onClick={() => send({ type: 'START' })}/>
        </Column>
    )
}

const QuestionPage : React.FC<HasSend & QuestionProps> = ({send, question, selectedAnswer}) => {
    return (
        <Column>
            <img src={question.image} width={350} height={350}/>
            { question.attribution ? <Attribution {...question.attribution}/> : null }
            <Column>
                <h3 className="text-2xl">{question.title}</h3>
                <ul>
                    {question.answers.map((answer) => {
                        let classes = ['border-2', 'border-solid', 'rounded-md', 'border-black'];
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
                                <label htmlFor={answer.point} className="inline-block w-full p-6">
                                    {answer.text}
                                </label>
                            </li>
                        )
                    })}
                </ul>
                <Button text="Next" onClick={() => send({ type: 'NEXT' })} enabled={selectedAnswer != null}/>
            </Column>
        </Column>
    )
}

const ResultPage : React.FC<HasSend & ResultProps> = ({send, result}) => {
    const res = results.get(result)
    // TODO assert this being non-null
    const description = res ? res.text : "Error: couldn't compute a result!"
    return (
        <Column>
            <h3 className="text-2xl">Your Patronus is a {result}</h3>
            <img src={res!.image} width={350} height={350}/>
            { res!.attribution ? <Attribution {...res!.attribution}/> : null }
            <p>{description}</p>
            <Button text="Play again!" onClick={() => send({ type: 'AGAIN' })}/>
        </Column>
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
        })
        component = <ResultPage send={send} result={runningAnswer!}/>
    }

    return (
        <Layout>
            <SEO title="Patronus Quiz" />
            {component}
        </Layout>
    )
}

export default PatronusQuizPage
