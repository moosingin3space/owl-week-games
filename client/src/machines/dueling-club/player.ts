import { Machine, MachineConfig, MachineOptions, StateNodeConfig, assign } from 'xstate';
import { Spell } from './common';

interface PlayerStateSchema {
    states: {
        normal: {};
        bound: {};
        flipped: {};
        disarmed: {};
        defeat: {};
    };
}

interface PlayerContext {
    hp: number
    effectTurns: number
}

export type PlayerEvent =
    | { type: 'ATTACK', spell: Spell }

const effectMachine : StateNodeConfig<PlayerContext, {}, PlayerEvent> = {
    entry: assign({ effectTurns: (_, event) => event?.spell?.effect?.turns || 0 }),
    on: {
        '': [
            { actions: 'decrementCount' },
            { target: 'normal', cond: 'effectExpired' }
        ],
        ATTACK: { actions: 'computeHp' }
    }
};

const machineConfig: MachineConfig<PlayerContext, PlayerStateSchema, PlayerEvent> = {
    id: 'player',
    initial: 'normal',
    context: {
        hp: 100,
        effectTurns: 0,
    },
    states: {
        normal: {
            on: {
                '': { target: 'defeat', cond: 'hpZero' },
                ATTACK: [
                    { target: 'bound', cond: 'spellBinds' },
                    { target: 'flipped', cond: 'spellFlips' },
                    { target: 'disarmed', cond: 'spellDisarms' },
                    { actions: 'computeHp' }
                ]
            }
        },
        bound: effectMachine,
        flipped: effectMachine,
        disarmed: effectMachine,
        defeat: {
            type: 'final'
        }
    }
};

const machineOptions: Partial<MachineOptions<PlayerContext, PlayerEvent>> = {
    actions: {
        decrementCount: assign({ effectTurns: (context, _) => context.effectTurns-- }),
        computeHp: assign({ hp: (context, _event) => context.hp-- }), // TODO
    },
    guards: {
        spellBinds: (_, event) => event.spell.effect ? event.spell.effect.name == 'bound' : false,
        spellFlips: (_, event) => event.spell.effect ? event.spell.effect.name == 'flipped' : false,
        spellDisarms: (_, event) => event.spell.effect ? event.spell.effect.name == 'disarmed' : false,
        hpZero: (context, _) => context.hp <= 0,
        effectExpired: (context, _) => context.effectTurns <= 0,
    },
};

export const PlayerMachine = Machine(machineConfig, machineOptions)
