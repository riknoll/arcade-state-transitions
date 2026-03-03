# sprite on background button event

Runs code when a button event happens in a given state, as a background listener. This is functionally the same as spriteOnButtonEvent, but the handler will not be overwritten if you register more than one for the same state/event/button combination, instead they will all run in order of weight (lowest to highest). This allows you to have multiple handlers for the same state/event/button without them interfering with each other. If the sprite is not currently being tracked by the state system, it will be added. Background handlers run AFTER all regular handlers.

```sig
stateTransitions.spriteOnBackgroundButtonEvent(sprites.create(img`.`, SpriteKind.Player), "", stateTransitions.Player.One, stateTransitions.Button.A, ControllerButtonEvent.Pressed, 0, function(sprite: Sprite) {

})
```

## Parameters

* **target**: The sprite to register the event on
* **eventState**: The state to trigger the event on
* **player**: The player whose button event to listen for
* **button**: The button to listen to
* **event**: The button event to listen for (pressed, released, or repeated)
* **weight**: The weight to run the handler in, lower numbers run first. Background handlers run after all regular handlers, so the weight of a background handler is effectively added to the end of the regular handlers. Handlers with the same weight run in the order they were registered.
* **handler**: The code to run when the event is triggered

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
