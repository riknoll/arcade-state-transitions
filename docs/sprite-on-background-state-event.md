# sprite on background state event

Adds a background listener for a state event on a sprite. This is functionally the same as spriteOnStateEvent, but the handler will not be overwritten if you register more than one for the same event/state combination, instead they will all run in order of weight (lowest to highest). This allows you to have multiple handlers for the same event/state without them interfering with each other. If the sprite is not currently being tracked by the state system, it will be added. Background handlers run AFTER all regular handlers.

```sig
stateTransitions.spriteOnBackgroundStateEvent(sprites.create(img`.`, SpriteKind.Player), stateTransitions.TransitionEvent.Enter, "", 0, function(sprite: Sprite) {

})
```

## Parameters

* **target**: The sprite to register the event on
* **event**: The event to trigger the handler on (enter, exit, or update)
* **eventState**: The state to trigger the event on
* **weight**: The order to run the handler in, lower numbers run first. Background handlers run after all regular handlers, so the weight of a background handler is effectively added to the end of the regular handlers. Handlers with the same weight run in the order they were registered.
* **handler**: The code to run when the event is triggered

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
