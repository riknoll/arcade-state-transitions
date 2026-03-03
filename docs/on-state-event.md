# on state event

Runs code when the global state enters, exits, or updates a given state. Registering another handler for the same state/event combination will overwrite the previously registered handler.

```sig
stateTransitions.onStateEvent(stateTransitions.TransitionEvent.Enter, "", function() {
    
})
```

## Parameters

* **event**: The event to trigger the handler on (enter, exit, or update)
* **eventState**: The state to trigger the event on
* **handler**: The code to run when the event is triggered

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
