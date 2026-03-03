# sprite on state change

Runs code whenever a sprite changes from one state to another. If the sprite is not currently being tracked by the state system, it will be added. Registering another handler will overwrite the previously registered handler. You can use this event to "hijack" state changes triggered elsewhere, if you change the state while inside this handler it will cancel the state change that triggered this event.

```sig
let mySprite: Sprite;
stateTransitions.spriteOnStateChange(mySprite, function(sprite: Sprite, oldState: string, newState: string) {

})
```

## Parameters

* **target**: The sprite to register the event on
* **handler**: The code to run when the sprite's state changes.

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
