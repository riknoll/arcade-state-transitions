namespace stateTransitions {
    type SpriteHandler = ((sprite: Sprite) => void);
    type GlobalHandler = (() => void);
    type SpriteStateChangeHandler = ((sprite: Sprite, oldState: string, newState: string) => void);
    type StateChangeHandler = ((oldState: string, newState: string) => void);

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

    class TransitionState<U, V> {
        protected state: string;
        protected stateStartTime: number;
        protected nextStateTransitionTime: number;
        protected nextState: string;
        protected handlers: EventHandler<U>[] = [];
        protected buttonHandlers: ButtonEventHandler<U>[] = [];
        protected runningAsync = false;
        protected stateChangeHandler: V;

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
                this.runStateChangeHandler(this.stateChangeHandler, previous || "", this.state)
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

        onStateChange(handler: V) {
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

        protected runStateChangeHandler(handler: V, previous: string, next: string): void {
            // Subclass
        }
    }

    class SpriteState extends TransitionState<SpriteHandler, SpriteStateChangeHandler> {
        constructor(public sprite: Sprite) {
            super();
        }

        runHandler(handler: SpriteHandler) {
            handler(this.sprite);
        }

        protected runStateChangeHandler(handler: SpriteStateChangeHandler, previous: string, next: string): void {
            handler(this.sprite, previous, next);
        }
    }

    class GlobalState extends TransitionState<GlobalHandler, StateChangeHandler> {
        constructor() {
            super();
        }

        runHandler(handler: GlobalHandler) {
            handler();
        }

        protected runStateChangeHandler(handler: StateChangeHandler, previous: string, next: string): void {
            handler(previous, next);
        }
    }

    function _createState() {
        return new State();
    }

    export function _state() {
        return __util.getState(_createState);
    }

    export function resolveButton(player: Player, button: Button) {
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