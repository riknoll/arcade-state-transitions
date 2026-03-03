# arcade-state-transitions

A minimal state machine extension for Microsoft MakeCode Arcade.

This extension is divided into two parse: global state and sprite state.

### Global state

A lot of times when you are making a game, you'll have multiple "states" that your game is moving through.

For example, a turn-based RPG you might have:
* A state where you are walking around in an overworld
* A state when the player is in a battle
* A state when the pause menu is open
* A state when the player is buying something from the shop

Odds are that in your game, you're going to have very different code running for each of these states.
For example, in the "Battle" state pressing A might cause the player to swing a sword whereas in the "Overworld" state pressing A might be used to talk to an NPC.


This extension lets you register separate `on game update`, `on button pressed`, and `forever` event handlers in your game that only run when a specific state is active.
This makes it way easier to organize your code than if you were to use a bunch of variables to keep track of what state you're currently in.

### Sprite state

...but that's not all! Sprites will often have their own state as well.

For example, let's consider a guard in a stealth game that's walking around with a flashlight.
If we were to break down the states that this guard might have, it could look like this:
* A "normal" state where the guard is walking around on their patrol route
* An "alert" state where the guard has heard the player's footsteps and is getting suspicious
* A "chasing" state where the guard has seen the player and is chasing after them

Just like with the global state, you'll probably want very different code to run when the guard is in each of these states.
This extension makes it super easy to do so! Not only that, but each of the events is nestable so you can put all of logic for a sprite in a single function.


### See also

This extension pairs super well with [riknoll/arcade-improved-sprite-data](https://github.com/riknoll/arcade-improved-sprite-data) and [riknoll/arcade-multi-events](https://github.com/riknoll/arcade-multi-events). Try using all three of them together!

