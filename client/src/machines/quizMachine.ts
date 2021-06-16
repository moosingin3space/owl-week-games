import { Machine, assign } from 'xstate'
import { Question, Answer, questions } from "./quizQuestions"

interface QuizContext {
    questions: Array<Question>
    currentScore: Map<string, number>
    selectedAnswer: Answer | null
}

interface QuizStateSchema {
    states: {
        intro: {};
        unansweredQuestion: {};
        answeredQuestion: {};
        done: {};
    }
}

export type QuizEvent =
    | { type: 'START' }
    | { type: 'SELECT', selected: Answer }
    | { type: 'NEXT' }
    | { type: 'AGAIN' }

export const quizMachine = Machine<QuizContext, QuizStateSchema, QuizEvent>({
    id: 'quiz',
    initial: 'intro',
    context: {
        questions: questions,
        currentScore: new Map(),
        selectedAnswer: null,
    },
    states: {
        intro: {
            on: {
                START: 'unansweredQuestion'
            }
        },
        unansweredQuestion: {
            entry: 'clearSelectedAnswer',
            on: {
                SELECT: {
                    actions: 'select',
                    target: 'answeredQuestion',
                }
            }
        },
        answeredQuestion: {
            on: {
                SELECT: {
                    actions: 'select',
                },
                NEXT: [
                    {
                        target: 'done',
                        cond: 'lastQuestion',
                    },
                    {
                        actions: 'computeScore',
                        target: 'unansweredQuestion',
                    },
                ]
            }
        },
        done: {
            on: {
                AGAIN: {
                    actions: 'initContext',
                    target: 'unansweredQuestion',
                }
            }
        }
    }
},
    {
        actions: {
            clearSelectedAnswer: assign({ selectedAnswer: (_context, _event) => null }),
            select: assign({
                selectedAnswer: (_context, event) => {
                    if (event.type != 'SELECT') {
                        // TODO assert
                        return null;
                    }
                    return event.selected
                }
            }),
            computeScore: assign({
                currentScore: (context, _event) => {
                    const answer = context.selectedAnswer;
                    let sc = context.currentScore;
                    if (answer == null) {
                        // TODO assert
                        return sc;
                    }
                    const currentPoint = sc.get(answer.point);
                    if (typeof currentPoint != 'undefined') {
                        sc.set(answer.point, currentPoint+1);
                    } else {
                        sc.set(answer.point, 1);
                    }
                    return sc;
                },
                questions: (context, _event) => {
                    const [_currentQ, ...rest] = context.questions;
                    return rest;
                },
            }),
            initContext: assign((_context, _event) => ({
                questions: questions,
                currentScore: new Map(),
                selectedAnswer: null,
            }))
        },
        guards: {
            lastQuestion: (context, _event) => context.questions.length == 1,
        }
    })
