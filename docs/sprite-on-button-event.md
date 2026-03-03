# sprite on button event

Runs code when a button event happens in a given state. If the sprite is not currently being tracked by the state system, it will be added. Registering another handler for the same state/event/button combination will overwrite the previously registered handler.

```sig
stateTransitions.spriteOnButtonEvent(sprites.create(img`.`, SpriteKind.Player), "", stateTransitions.Player.One, stateTransitions.Button.A, ControllerButtonEvent.Pressed, function(sprite: Sprite) {

})
```

## Parameters

* **target**: The Sprite to register the event on
* **eventState**: The state to trigger the event on
* **player**: The player whose button event to listen for
* **button**: The button to listen to
* **event**: The type of button event to register for (pressed, released, or repeated)
* **handler**: The code to run when the event is triggered

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
