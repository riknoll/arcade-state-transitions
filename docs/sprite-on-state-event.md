# sprite on state event

Runs code when a sprite enters, exits, or updates in a given state. If the sprite is not currently being tracked by the state system, it will be added. Registering another handler for the same state/event will overwrite the previously registered handler.

```sig
stateTransitions.spriteOnStateEvent(sprites.create(img`.`, SpriteKind.Player), stateTransitions.TransitionEvent.Enter, "", function(sprite: Sprite) {

})
```

## Parameters

* **target**: The sprite to register the event on
* **event**: The event to trigger the handler on (enter, exit, or update)
* **eventState**: The state to trigger the event on
* **handler**: The function to run when the event is triggered

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
