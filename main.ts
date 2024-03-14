//% color="#357ba1"
//% block="State"
//% groups='["Global", "Sprites"]'
namespace stateTransitions {
    type SpriteHandler = ((sprite: Sprite) => void);
    type GlobalHandler = (() => void);

    export class State {
        protected sprites: SpriteState[] = [];
        globalState = new GlobalState();

        constructor() {
            game.onUpdate(() => {
                this.update();
            })
        }

        update() {
            let shouldFilter = false;

            for (const sprite of this.sprites) {
                if (sprite.sprite.flags & sprites.Flag.Destroyed) {
                    shouldFilter = true;
                    continue;
                }
                sprite.update();

                if (sprite.sprite.flags & sprites.Flag.Destroyed) {
                    shouldFilter = true;
                }
            }

            if (shouldFilter) {
                this.sprites = this.sprites.filter(sprite => !(sprite.sprite.flags & sprites.Flag.Destroyed));
            }
        }

        getStateForSprite(sprite: Sprite, createIfNotExists = false) {
            for (const state of this.sprites) {
                if (state.sprite === sprite) return state;
            }

            if (createIfNotExists) {
                const newState = new SpriteState(sprite);
                this.sprites.push(newState);
                return newState;
            }

            return undefined;
        }
    }

    export enum TransitionEvent {
        Enter,
        Exit,
        Update,
        AsyncUpdate
    }

    class EventHandler<U> {
        constructor(public kind: TransitionEvent, public state: string, public handler: U) {
        }
    }

    class TransitionState<U> {
        protected state: string;
        protected stateStartTime: number;
        protected nextStateTransitionTime: number;
        protected nextState: string;
        protected handlers: EventHandler<U>[] = [];
        protected runningAsync = false;

        constructor() {
        }

        update() {
            if (this.nextStateTransitionTime !== undefined && game.runtime() > this.nextStateTransitionTime) {
                this.changeState(this.nextState);
            }

            this.fireEvent(TransitionEvent.Update);

            if (!this.runningAsync) {
                const asyncHandler = this.getHandler(TransitionEvent.AsyncUpdate);

                if (asyncHandler) {
                    this.runningAsync = true;
                    control.runInParallel(() => {
                        this.runHandler(asyncHandler);
                        this.runningAsync = false;
                    });
                }
            }
        }

        changeState(state: string) {
            this.nextStateTransitionTime = undefined;
            this.nextState = undefined;

            if (this.state === state) return;

            this.fireEvent(TransitionEvent.Exit);

            this.state = state;
            this.stateStartTime = game.runtime();

            this.fireEvent(TransitionEvent.Enter);
        }

        getState() {
            return this.state;
        }

        getTimeInState() {
            return game.runtime() - this.stateStartTime;
        }

        changeStateInTime(state: string, millis: number) {
            this.nextState = state;
            this.nextStateTransitionTime = game.runtime() + millis;
        }

        protected getHandler(event: TransitionEvent, state?: string) {
            state = state || this.state;

            for (const handler of this.handlers) {
                if (handler.state === state && handler.kind === event) {
                    return handler;
                }
            }

            return undefined;
        }

        protected fireEvent(event: TransitionEvent) {
            const handler = this.getHandler(event);

            if (handler) {
                this.runHandler(handler);
            }
        }

        protected runHandler(handler: EventHandler<U>): void {

        }
    }

    class SpriteState extends TransitionState<SpriteHandler> {
        constructor(public sprite: Sprite) {
            super();
        }

        onEvent(event: TransitionEvent, state: string, handler: SpriteHandler) {
            const existing = this.getHandler(event, state);

            if (existing) {
                existing.handler = handler;
            }
            else {
                this.handlers.push(new EventHandler(event, state, handler));
            }
        }

        runHandler(handler: EventHandler<SpriteHandler>) {
            handler.handler(this.sprite);
        }
    }

    class GlobalState extends TransitionState<GlobalHandler> {
        constructor() {
            super();
        }

        onEvent(event: TransitionEvent, state: string, handler: GlobalHandler) {
            const existing = this.getHandler(event, state);

            if (existing) {
                existing.handler = handler;
            }
            else {
                this.handlers.push(new EventHandler(event, state, handler));
            }
        }

        runHandler(handler: EventHandler<GlobalHandler>) {
            handler.handler();
        }
    }

    function _createState() {
        return new State();
    }

    function _state() {
        return __util.getState(_createState);
    }

    //% blockId=state_transitions_spriteState
    //% block="$sprite state"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% group="Sprites"
    //% weight=100
    export function spriteState(sprite: Sprite) {
        const state = _state().getStateForSprite(sprite);

        if (state) {
            return state.getState();
        }

        return undefined;
    }

    //% blockId=state_transitions_spriteTimeInState
    //% block="$sprite time since state change"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% group="Sprites"
    //% weight=90
    export function spriteTimeInState(sprite: Sprite) {
        const state = _state().getStateForSprite(sprite);

        if (state) {
            return state.getTimeInState();
        }

        return undefined;
    }

    //% blockId=state_transitions_spriteChangeState
    //% block="$sprite change state to $newState||in $millis|ms"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% newState.shadow=state_transitions_spriteStateShadow
    //% millis.shadow=timePicker
    //% group="Sprites"
    //% weight=80
    export function spriteChangeState(sprite: Sprite, newState: string, millis?: number) {
        const state = _state().getStateForSprite(sprite, true);

        if (millis !== undefined) {
            state.changeStateInTime(newState, millis);
        }
        else {
            state.changeState(newState);
        }
    }

    //% blockId=state_transitions_spriteOnStateEvent
    //% block="$target on state $event $eventState with $sprite"
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% eventState.shadow=state_transitions_spriteStateShadow
    //% group="Sprites"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=70
    export function spriteOnStateEvent(target: Sprite, event: TransitionEvent, eventState: string, handler: (sprite: Sprite) => void) {
        const state = _state().getStateForSprite(target, true);

        state.onEvent(event, eventState, handler);
    }

    //% blockId=state_transitions_spriteStateIs
    //% block="$sprite state is $toCheck"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% toCheck.shadow=state_transitions_spriteStateShadow
    //% group="Sprites"
    //% weight=60
    export function spriteStateIs(sprite: Sprite, toCheck: string) {
        return spriteState(sprite) === toCheck;
    }

    //% blockId=state_transitions_state
    //% block="global state"
    //% group="Global"
    //% weight=100
    export function state() {
        return _state().globalState.getState();
    }

    //% blockId=state_transitions_timeInState
    //% block="time since global state change"
    //% group="Global"
    //% weight=90
    export function timeInState() {
        return _state().globalState.getTimeInState();
    }

    //% blockId=state_transitions_changeState
    //% block="change global state to $newState||in $millis|ms"
    //% newState.shadow=state_transitions_globalStateShadow
    //% millis.shadow=timePicker
    //% group="Global"
    //% weight=80
    export function changeState(newState: string, millis?: number) {
        if (millis !== undefined) {
            _state().globalState.changeStateInTime(newState, millis);
        }
        else {
            _state().globalState.changeState(newState);
        }
    }

    //% blockId=state_transitions_onStateEvent
    //% block="on global state $event $eventState"
    //% eventState.shadow=state_transitions_globalStateShadow
    //% group="Global"
    //% weight=70
    export function onStateEvent(event: TransitionEvent, eventState: string, handler: () => void) {
        _state().globalState.onEvent(event, eventState, handler);
    }

    //% blockId=state_transitions_stateIs
    //% block="global state is $toCheck"
    //% toCheck.shadow=state_transitions_globalStateShadow
    //% group="Global"
    //% weight=60
    export function stateIs(toCheck: string) {
        return state() === toCheck;
    }

    //% block="$name"
    //% blockId=state_transitions_spriteStateShadow
    //% blockHidden=true shim=TD_ID
    //% name.fieldEditor="autocomplete" name.fieldOptions.decompileLiterals=true
    //% name.fieldOptions.key="_spriteStateShadow"
    export function _spriteStateShadow(name: string) {
        return name
    }

    //% block="$name"
    //% blockId=state_transitions_globalStateShadow
    //% blockHidden=true shim=TD_ID
    //% name.fieldEditor="autocomplete" name.fieldOptions.decompileLiterals=true
    //% name.fieldOptions.key="_globalStateShadow"
    export function _globalStateShadow(name: string) {
        return name
    }
}