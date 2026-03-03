//% color="#357ba1"
//% block="State"
//% groups='["Global", "Sprites"]'
namespace stateTransitions {
    /**
     * Gets the current state of the sprite. Returns undefined if the sprite is not being tracked by the state system.
     *
     *
     * @param sprite The sprite to get the state of
     * @returns The current state of the sprite, or undefined if the sprite is not being tracked
     */
    //% blockId=state_transitions_spriteState
    //% block="$sprite state"
    //% help=github:arcade-state-transitions/docs/sprite-state
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% group="Sprites"
    //% weight=100
    export function spriteState(sprite: Sprite): string {
        const state = _state().getStateForSprite(sprite);

        if (state) {
            return state.getState();
        }

        return undefined;
    }

    /**
     * Returns the time in milliseconds since the sprite's state last changed. Returns -1 if the sprite is not being tracked by the state system.
     *
     *
     * @param sprite The sprite to get the time for
     * @returns The time in milliseconds since the sprite's state last changed, or -1 if the sprite is not being tracked
     */
    //% blockId=state_transitions_spriteTimeInState
    //% block="$sprite time since state change"
    //% help=github:arcade-state-transitions/docs/sprite-time-in-state
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% group="Sprites"
    //% weight=90
    export function spriteTimeInState(sprite: Sprite): number {
        const state = _state().getStateForSprite(sprite);

        if (state) {
            return state.getTimeInState();
        }

        return -1;
    }

    /**
     * Changes the state of the given sprite to the new state. If millis is provided, the state will change after the given time instead of immediately.
     *
     *
     * @param sprite The sprite to change the state of
     * @param newState The new state to change to
     * @param millis The time in milliseconds to wait before changing the state
     */
    //% blockId=state_transitions_spriteChangeState
    //% block="$sprite change state to $newState||in $millis|ms"
    //% help=github:arcade-state-transitions/docs/sprite-change-state
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% newState.shadow=state_transitions_spriteStateShadow
    //% millis.shadow=timePicker
    //% group="Sprites"
    //% weight=80
    export function spriteChangeState(sprite: Sprite, newState: string, millis?: number): void {
        const state = _state().getStateForSprite(sprite, true);

        if (millis !== undefined) {
            state.changeStateInTime(newState, millis);
        }
        else {
            state.changeState(newState);
        }
    }

    /**
     * Runs code when a sprite enters, exits, or updates in a given state. If the sprite is not currently being tracked
     * by the state system, it will be added. Registering another handler for the same state/event will overwrite the previously
     * registered handler.
     *
     *
     * @param target The sprite to register the event on
     * @param event The event to trigger the handler on (enter, exit, or update)
     * @param eventState The state to trigger the event on
     * @param handler The function to run when the event is triggered
     */
    //% blockId=state_transitions_spriteOnStateEvent
    //% block="$target on state $event $eventState with $sprite"
    //% help=github:arcade-state-transitions/docs/sprite-on-state-event
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% eventState.shadow=state_transitions_spriteStateShadow
    //% group="Sprites"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=70
    export function spriteOnStateEvent(target: Sprite, event: TransitionEvent, eventState: string, handler: (sprite: Sprite) => void): void {
        const state = _state().getStateForSprite(target, true);

        state.onEvent(event, eventState, handler);
    }

    /**
     * Runs code when a button event happens in a given state. If the sprite is not currently being tracked
     * by the state system, it will be added. Registering another handler for the same state/event/button combination will overwrite the previously
     * registered handler.
     *
     *
     * @param target The Sprite to register the event on
     * @param eventState The state to trigger the event on
     * @param player The player whose button event to listen for
     * @param button The button to listen to
     * @param event The type of button event to register for (pressed, released, or repeated)
     * @param handler The code to run when the event is triggered
     */
    //% blockId=state_transitions_spriteOnButtonEvent
    //% block="$target on $player $button button $event in state $eventState with $sprite"
    //% help=github:arcade-state-transitions/docs/sprite-on-button-event
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% eventState.shadow=state_transitions_spriteStateShadow
    //% group="Sprites"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=68
    export function spriteOnButtonEvent(target: Sprite, eventState: string, player: Player, button: Button, event: ControllerButtonEvent, handler: (sprite: Sprite) => void): void {
        const state = _state().getStateForSprite(target, true);

        state.onButtonEvent(resolveButton(player, button), event, eventState, handler);
    }

    /**
     * Runs code whenever a sprite changes from one state to another. If the sprite is not currently being tracked
     * by the state system, it will be added. Registering another handler will overwrite the previously registered handler.
     * You can use this event to "hijack" state changes triggered elsewhere, if you change the state while inside this
     * handler it will cancel the state change that triggered this event.
     *
     *
     * @param target The sprite to register the event on
     * @param handler The code to run when the sprite's state changes.
     */
    //% blockId=state_transitions_spriteOnStateChange
    //% block="$target on state change from $oldState to $newState for $sprite"
    //% help=github:arcade-state-transitions/docs/sprite-on-state-change
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% group="Sprites"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=66
    export function spriteOnStateChange(target: Sprite, handler: (sprite: Sprite, oldState: string, newState: string) => void): void {
        const state = _state().getStateForSprite(target, true);

        state.onStateChange(handler);
    }

    /**
     * Checks if the sprite is currently in the given state. Returns false if the sprite is not being tracked by the state system.
     *
     *
     * @param sprite The sprite to check
     * @param toCheck The state to check
     * @returns True if the sprite is currently in the given state, false if it is not or if the sprite is not being tracked
     */
    //% blockId=state_transitions_spriteStateIs
    //% block="$sprite state is $toCheck"
    //% help=github:arcade-state-transitions/docs/sprite-state-is
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% toCheck.shadow=state_transitions_spriteStateShadow
    //% group="Sprites"
    //% weight=60
    export function spriteStateIs(sprite: Sprite, toCheck: string): boolean {
        return spriteState(sprite) === toCheck;
    }

    /**
     * Gets the global state. Returns undefined if the global state has not been set.
     *
     *
     * @returns The current global state, or undefined if the global state has not been set
     */
    //% blockId=state_transitions_state
    //% block="global state"
    //% help=github:arcade-state-transitions/docs/state
    //% group="Global"
    //% weight=100
    export function state(): string {
        return _state().globalState.getState();
    }

    /**
     * Gets the time in milliseconds since the global state last changed. Returns -1 if the global state has not been set.
     *
     *
     * @returns The time in milliseconds since the global state last changed, or -1 if the global state has not been set
     */
    //% blockId=state_transitions_timeInState
    //% block="time since global state change"
    //% help=github:arcade-state-transitions/docs/time-in-state
    //% group="Global"
    //% weight=90
    export function timeInState(): number {
        const time = _state().globalState.getTimeInState();

        if (isNaN(time)) {
            return -1;
        }

        return time;
    }

    /**
     * Changes the global state. If the millis parameter is provided, the state will change after the given time instead of immediately.
     *
     *
     * @param newState The state to change the global state to
     * @param millis The time to wait before changing the state, in milliseconds
     */
    //% blockId=state_transitions_changeState
    //% block="change global state to $newState||in $millis|ms"
    //% help=github:arcade-state-transitions/docs/change-state
    //% newState.shadow=state_transitions_globalStateShadow
    //% millis.shadow=timePicker
    //% group="Global"
    //% weight=80
    export function changeState(newState: string, millis?: number): void {
        if (millis !== undefined) {
            _state().globalState.changeStateInTime(newState, millis);
        }
        else {
            _state().globalState.changeState(newState);
        }
    }

    /**
     * Runs code when the global state enters, exits, or updates a given state. Registering another handler for the same state/event combination will
     * overwrite the previously registered handler.
     *
     *
     * @param event The event to trigger the handler on (enter, exit, or update)
     * @param eventState The state to trigger the event on
     * @param handler The code to run when the event is triggered
     */
    //% blockId=state_transitions_onStateEvent
    //% block="on global state $event $eventState"
    //% help=github:arcade-state-transitions/docs/on-state-event
    //% eventState.shadow=state_transitions_globalStateShadow
    //% group="Global"
    //% weight=70
    export function onStateEvent(event: TransitionEvent, eventState: string, handler: () => void): void {
        _state().globalState.onEvent(event, eventState, handler);
    }

    /**
     * Runs code when a button event happens in the global state. Registering another handler for the same state/event/button combination will overwrite the previously
     * registered handler.
     *
     *
     * @param eventState The state to trigger the event on
     * @param player The player whose button event to listen for
     * @param button The button to listen to
     * @param event The type of button event to register for (pressed, released, or repeated)
     * @param handler The code to run when the event is triggered
     */
    //% blockId=state_transitions_onButtonEvent
    //% block="on $player $button button $event in global state $eventState"
    //% help=github:arcade-state-transitions/docs/on-button-event
    //% eventState.shadow=state_transitions_globalStateShadow
    //% group="Global"
    //% weight=68
    export function onButtonEvent(eventState: string, player: Player, button: Button, event: ControllerButtonEvent, handler: () => void): void {
        const state = _state().globalState

        state.onButtonEvent(resolveButton(player, button), event, eventState, handler);
    }

    /**
     * Runs code whenever the global state changes from one state to another. Registering another handler will overwrite the previously registered handler.
     * You can use this event to "hijack" state changes triggered elsewhere, if you change the state while inside this handler it will cancel the state change
     * that triggered this event.
     *
     *
     * @param handler The code to run when the global state changes.
     */
    //% blockId=state_transitions_onStateChange
    //% block="on global state change from $oldState to $newState"
    //% help=github:arcade-state-transitions/docs/on-state-change
    //% group="Global"
    //% draggableParameters="reporter"
    //% weight=66
    export function onStateChange(handler: (oldState: string, newState: string) => void): void {
        const state = _state().globalState;

        state.onStateChange(handler);
    }

    /**
     * Checks if the global state is in a specific state. Returns false if the global state has not been set.
     *
     *
     * @param toCheck The state to check
     * @returns True if the global state is currently in the given state, false if it is not or if the global state has not been set.
     */
    //% blockId=state_transitions_stateIs
    //% block="global state is $toCheck"
    //% help=github:arcade-state-transitions/docs/state-is
    //% toCheck.shadow=state_transitions_globalStateShadow
    //% group="Global"
    //% weight=60
    export function stateIs(toCheck: string): boolean {
        return state() === toCheck;
    }

    /**
     * A shadow block for sprite state names.
     *
     *
     * @param name The name of the state
     */
    //% block="$name"
    //% help=github:arcade-state-transitions/docs/_global-state-shadow
    //% blockId=state_transitions_spriteStateShadow
    //% blockHidden=true shim=TD_ID
    //% name.fieldEditor="autocomplete" name.fieldOptions.decompileLiterals=true
    //% name.fieldOptions.key="_spriteStateShadow"
    export function _spriteStateShadow(name: string) {
        return name
    }

    /**
     * A shadow block for global state names.
     *
     *
     * @param name The name of the state
     */
    //% block="$name"
    //% blockId=state_transitions_globalStateShadow
    //% blockHidden=true shim=TD_ID
    //% name.fieldEditor="autocomplete" name.fieldOptions.decompileLiterals=true
    //% name.fieldOptions.key="_globalStateShadow"
    export function _globalStateShadow(name: string) {
        return name
    }

    /**
     * Adds a background listener for a state event on a sprite. This is functionally the same as spriteOnStateEvent,
     * but the handler will not be overwritten if you register more than one for the same event/state combination, instead they will all run in order of weight (lowest to highest).
     * This allows you to have multiple handlers for the same event/state without them interfering with each other. If the sprite is not currently being tracked
     * by the state system, it will be added. Background handlers run AFTER all regular handlers.
     *
     *
     * @param target The sprite to register the event on
     * @param event The event to trigger the handler on (enter, exit, or update)
     * @param eventState The state to trigger the event on
     * @param weight The order to run the handler in, lower numbers run first. Background handlers run after all regular handlers, so the weight of a background handler is effectively added to the end of the regular handlers. Handlers with the same weight run in the order they were registered.
     * @param handler The code to run when the event is triggered
     */
    //% blockId=state_transitions_spriteOnBackgroundStateEvent
    //% block="$target add listener for $event state $eventState weight $weight with $sprite"
    //% help=github:arcade-state-transitions/docs/sprite-on-background-state-event
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% eventState.shadow=state_transitions_spriteStateShadow
    //% group="Background"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=70
    export function spriteOnBackgroundStateEvent(target: Sprite, event: TransitionEvent, eventState: string, weight: number, handler: (sprite: Sprite) => void): void {
        const state = _state().getStateForSprite(target, true);

        state.onEvent(event, eventState, handler, weight);
    }

    /**
     * Runs code when a button event happens in a given state, as a background listener. This is functionally the same as spriteOnButtonEvent, but the handler will not be
     * overwritten if you register more than one for the same state/event/button combination, instead they will all run in order of weight (lowest to highest). This allows
     * you to have multiple handlers for the same state/event/button without them interfering with each other. If the sprite is not currently being tracked by the state system,
     * it will be added. Background handlers run AFTER all regular handlers.
     *
     *
     * @param target The sprite to register the event on
     * @param eventState The state to trigger the event on
     * @param player The player whose button event to listen for
     * @param button The button to listen to
     * @param event The button event to listen for (pressed, released, or repeated)
     * @param weight The weight to run the handler in, lower numbers run first. Background handlers run after all regular handlers, so the weight of a background handler is effectively added to the end of the regular handlers. Handlers with the same weight run in the order they were registered.
     * @param handler The code to run when the event is triggered
     */
    //% blockId=state_transitions_spriteOnBackgroundButtonEvent
    //% block="$target add listener for $player $button $event in state $eventState weight $weight with $sprite"
    //% help=github:arcade-state-transitions/docs/sprite-on-background-button-event
    //% target.shadow=variables_get
    //% target.defl=mySprite
    //% eventState.shadow=state_transitions_spriteStateShadow
    //% group="Background"
    //% handlerStatement
    //% draggableParameters="reporter"
    //% weight=68
    export function spriteOnBackgroundButtonEvent(target: Sprite, eventState: string, player: Player, button: Button, event: ControllerButtonEvent, weight: number, handler: (sprite: Sprite) => void): void {
        const state = _state().getStateForSprite(target, true);

        state.onButtonEvent(resolveButton(player, button), event, eventState, handler, weight);
    }
}