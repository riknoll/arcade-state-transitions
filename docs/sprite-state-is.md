# sprite state is

Checks if the sprite is currently in the given state. Returns false if the sprite is not being tracked by the state system.

```sig
let mySprite: Sprite;
stateTransitions.spriteStateIs(mySprite, "")
```

## Parameters

* **sprite**: The sprite to check
* **toCheck**: The state to check

```package
arcade-state-transitions=github:riknoll/arcade-state-transitions
```
