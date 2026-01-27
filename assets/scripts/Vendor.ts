import { GameGlobal } from "./GameGlobal";
import { GameEvent } from "./managers/EventManager";
import { Player } from "./Player";

export class Vendor {
    private static _instance: Vendor;

    getPrice(itemId: number): number {
        return 0;
    }
    static initStore() {
        GameEvent.emit("ShowSawBladePrice", GameGlobal.GearsUp[2]);
        GameEvent.emit("ShowCargoBedPrice", GameGlobal.CargoBedUp[2][0]);
        GameEvent.emit("ShowSpeedPrice", GameGlobal.SpeedUp[2][0]);
    }

    private static get I(): Vendor {
        if (!this._instance) {
            this._instance = new Vendor();
        }
        return this._instance;
    }
}