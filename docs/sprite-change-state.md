# sprite change state

Changes the state of the given sprite to the new state. If millis is provided, the state will change after the given time instead of immediately.

```sig
let mySprite: Sprite;
stateTransitions.spriteChangeState(mySprite, "")
```

## Parameters

* **sprite**: The sprite to change the state of
* **newState**: The new state to change to
* **millis**: The time in milliseconds to wait before changing the state

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
