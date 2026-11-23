import { ArcadeGamePlayer } from "./arcade-game-player";

export function MathArmyGame() {
  return <ArcadeGamePlayer name="Math Army" src="/learn/math/math-army/play" readySelector=".lvbtn"
    restartNote="Restart game returns to the level menu and discards the current run; saved account stars are kept." />
}
