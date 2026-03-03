# on state change

Runs code whenever the global state changes from one state to another. Registering another handler will overwrite the previously registered handler. You can use this event to "hijack" state changes triggered elsewhere, if you change the state while inside this handler it will cancel the state change that triggered this event.

```sig
stateTransitions.onStateChange(function(oldState: string, newState: string) {
    
})
```

## Parameters

* **handler**: The code to run when the global state changes.

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
