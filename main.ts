//% color="#357ba1"
//% block="State"
//% groups='["Global", "Sprites"]'
namespace stateTransitions {
    type SpriteHandler = ((sprite: Sprite) => void);
    type GlobalHandler = (() => void);

    export enum Button {
        //% block="A"
        A = ControllerButton.A,
        //% block="B"
        B = ControllerButton.B,
        //% block="up"
        Up = ControllerButton.Up,
        //% block="down"
        Down = ControllerButton.Down,
        //% block="right"
        Right = ControllerButton.Right,
        //% block="left"
        Left = ControllerButton.Left,
        //% block="menu"
        Menu = 999
    }

    export enum Player {
        //% block="player 1"
        One,
        //% block="player 2"
        Two,
        //% block="player 3"
        Three,
        //% block="player 4"
        Four
    }

    export enum TransitionEvent {
        //% block="enter"
        Enter,
        //% block="exit"
        Exit,
        //% block="update"
        Update,
        //% block="async update (forever)"
        AsyncUpdate
    }

    export class State {
        protected sprites: SpriteState[] = [];
        globalState = new GlobalState();
        protected registeredButtons: controller.Button[] = [];

        constructor() {
            game.onUpdate(() => {
                this.update();
            });
        }

        update() {
            let shouldFilter = false;

            this.globalState.update();

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

        registerButtonEvents(button: controller.Button) {
            if (this.registeredButtons.indexOf(button) !== -1) {
                return;
            }

            this.registeredButtons.push(button);

            this.registerButtonEvent(button, ControllerButtonEvent.Pressed);
            this.registerButtonEvent(button, ControllerButtonEvent.Released);
            this.registerButtonEvent(button, ControllerButtonEvent.Repeated);
        }

        protected registerButtonEvent(button: controller.Button, event: ControllerButtonEvent) {
            button.addEventListener(event, () => {
                this.globalState.fireButtonEvent(button, event);
                for (const state of this.sprites) {
                    state.fireButtonEvent(button, event);
                }
            });
        }
    }

    class HandlerEntry<U> {
        constructor(public weight: number, public handler: U) {}
    }

    class EventHandler<U> {
        backgroundHandlers: HandlerEntry<U>[];
        constructor(public kind: TransitionEvent, public state: string, public handler: U) {
            this.backgroundHandlers = [];
        }

        insertBackgroundHandler(weight: number, handler: U) {
            const newEntry = new HandlerEntry(weight, handler);

            for (let i = 0; i < this.backgroundHandlers.length; i++) {
                if (this.backgroundHandlers[i].weight < weight) {
                    this.backgroundHandlers.insertAt(i, newEntry)
                    return;
                }
            }

            this.backgroundHandlers.push(newEntry);
        }
    }

    class ButtonEventHandler<U> {
        backgroundHandlers: HandlerEntry<U>[];

        constructor(public button: controller.Button, public event: ControllerButtonEvent, public state: string, public handler: U) {
            this.backgroundHandlers = [];
        }

        insertBackgroundHandler(weight: number, handler: U) {
            const newEntry = new HandlerEntry(weight, handler);

            for (let i = 0; i < this.backgroundHandlers.length; i++) {
                if (this.backgroundHandlers[i].weight < weight) {
                    this.backgroundHandlers.insertAt(i, newEntry)
                    return;
                }
            }

            this.backgroundHandlers.push(newEntry);
        }
    }

    class TransitionState<U> {
        protected state: string;
        protected stateStartTime: number;
        protected nextStateTransitionTime: number;
        protected nextState: string;
        protected handlers: EventHandler<U>[] = [];
        protected buttonHandlers: ButtonEventHandler<U>[] = [];
        protected runningAsync = false;
        protected stateChangeHandler: (previous: string, current: string) => void;

        protected transitioningState = false;

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
                        this.runHandler(asyncHandler.handler);
                        this.runningAsync = false;
                    });
                }
            }
        }

        changeState(state: string) {
            this.nextStateTransitionTime = undefined;
            this.nextState = undefined;

            if (this.state === state) return;
            if (this.transitioningState) {
                this.nextState = state;
                return;
            }

            this.transitioningState = true;

            const previous = this.state;

            this.fireEvent(TransitionEvent.Exit);

            // check to see if the state was changed in the exit event
            if (this.nextState && this.nextStateTransitionTime === undefined) {
                state = this.nextState;
                this.nextState = undefined;
            }

            this.state = state;
            this.stateStartTime = game.runtime();
            this.transitioningState = false;

            if (this.stateChangeHandler) {
                this.stateChangeHandler(previous || "", this.state)
            }

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

        onEvent(event: TransitionEvent, state: string, handler: U, weight?: number) {
            let entry = this.getHandler(event, state);

            if (!entry) {
                entry = new EventHandler(event, state, undefined);
                this.handlers.push(entry);
            }

            if (weight !== undefined) {
                entry.insertBackgroundHandler(weight, handler);
            }
            else {
                entry.handler = handler;
            }
        }

        onButtonEvent(button: controller.Button, event: ControllerButtonEvent, state: string, handler: U, weight?: number) {
            _state().registerButtonEvents(button);
            let entry = this.getButtonHandler(button, event, state);

            if (!entry) {
                entry = new ButtonEventHandler(button, event, state, undefined);
                this.buttonHandlers.push(entry);
            }

            if (weight !== undefined) {
                entry.insertBackgroundHandler(weight, handler);
            }
            else {
                entry.handler = handler;
            }
        }

        onStateChange(handler: (previous: string, next: string) => void) {
            this.stateChangeHandler = handler;
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

        protected getButtonHandler(button: controller.Button, event: ControllerButtonEvent, state?: string) {
            state = state || this.state;

            for (const handler of this.buttonHandlers) {
                if (handler.state === state && handler.button === button && handler.event === event) {
                    return handler;
                }
            }

            return undefined;
        }

        protected fireEvent(event: TransitionEvent) {
            const handler = this.getHandler(event);

            if (handler) {
                if (handler.handler) {
                    this.runHandler(handler.handler);
                }

                for (const backgroundHandler of handler.backgroundHandlers) {
                    this.runHandler(backgroundHandler.handler);
                }
            }
        }

        fireButtonEvent(button: controller.Button, event: ControllerButtonEvent) {
            const handler = this.getButtonHandler(button, event);
            if (handler) {
                if (handler.handler) {
                    this.runHandler(handler.handler);
                }

                for (const backgroundHandler of handler.backgroundHandlers) {
                    this.runHandler(backgroundHandler.handler);
                }
            }
        }

        protected runHandler(handler: U): void {
            // Subclass
        }
    }

    class SpriteState extends TransitionState<SpriteHandler> {
        constructor(public sprite: Sprite) {
            super();
        }

        runHandler(handler: SpriteHandler) {
            handler(this.sprite);
        }
    }

    class GlobalState extends TransitionState<GlobalHandler> {
        constructor() {
            super();
        }

        runHandler(handler: GlobalHandler) {
            handler();
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

    //% blockId=state_transitions_spriteOnButtonEvent
    //% block="$target on $player $button button $event in state $eventState with $sprite"
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% eventState.shadow=state_transitions_spriteStateShadow
    //% group="Sprites"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=68
    export function spriteOnButtonEvent(target: Sprite, eventState: string, player: Player, button: Button, event: ControllerButtonEvent, handler: (sprite: Sprite) => void) {
        const state = _state().getStateForSprite(target, true);

        state.onButtonEvent(resolveButton(player, button), event, eventState, handler);
    }

    //% blockId=state_transitions_spriteOnStateChange
    //% block="$target on state change from $oldState to $newState"
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% group="Sprites"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=66
    export function spriteOnStateChange(target: Sprite, handler: (oldState: string, newState: string) => void) {
        const state = _state().getStateForSprite(target, true);

        state.onStateChange(handler);
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

    //% blockId=state_transitions_onButtonEvent
    //% block="on $player $button button $event in global state $eventState"
    //% eventState.shadow=state_transitions_globalStateShadow
    //% group="Global"
    //% weight=68
    export function onButtonEvent(eventState: string, player: Player, button: Button, event: ControllerButtonEvent, handler: () => void) {
        const state = _state().globalState

        state.onButtonEvent(resolveButton(player, button), event, eventState, handler);
    }

    //% blockId=state_transitions_onStateChange
    //% block="on global state change from $oldState to $newState"
    //% group="Global"
    //% draggableParameters="reporter"
    //% weight=66
    export function onStateChange(handler: (oldState: string, newState: string) => void) {
        const state = _state().globalState;

        state.onStateChange(handler);
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

    //% blockId=state_transitions_spriteOnBackgroundStateEvent
    //% block="$target add listener for $event state $eventState weight $weight with $sprite"
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% eventState.shadow=state_transitions_spriteStateShadow
    //% group="Background"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=70
    export function spriteOnBackgroundStateEvent(target: Sprite, event: TransitionEvent, eventState: string, weight: number, handler: (sprite: Sprite) => void) {
        const state = _state().getStateForSprite(target, true);

        state.onEvent(event, eventState, handler, weight);
    }

    //% blockId=state_transitions_spriteOnBackgroundButtonEvent
    //% block="$target add listener for $player $button $event in state $eventState weight $weight with $sprite"
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% eventState.shadow=state_transitions_spriteStateShadow
    //% group="Background"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=68
    export function spriteOnBackgroundButtonEvent(target: Sprite, eventState: string, player: Player, button: Button, event: ControllerButtonEvent, weight: number, handler: (sprite: Sprite) => void) {
        const state = _state().getStateForSprite(target, true);

        state.onButtonEvent(resolveButton(player, button), event, eventState, handler, weight);
    }

    function resolveButton(player: Player, button: Button) {
        let realPlayer: controller.Controller;

        switch (player) {
            case Player.One:
                realPlayer = controller.player1;
                break;
            case Player.Two:
                realPlayer = controller.player2;
                break;
            case Player.Three:
                realPlayer = controller.player3;
                break;
            case Player.Four:
                realPlayer = controller.player4;
                break;
            default:
                throw "Invalid player number!";
        }


        let realButton: controller.Button;

        switch (button) {
            case Button.A:
                realButton = realPlayer.A;
                break;
            case Button.B:
                realButton = realPlayer.B;
                break;
            case Button.Down:
                realButton = realPlayer.down;
                break;
            case Button.Left:
                realButton = realPlayer.left;
                break;
            case Button.Right:
                realButton = realPlayer.right;
                break;
            case Button.Up:
                realButton = realPlayer.up;
                break;
            case Button.Menu:
                // Menu is always player 1
                realButton = controller.menu;
                break;
            default:
                throw "Invalid button number!";
        }

        return realButton;
    }
}