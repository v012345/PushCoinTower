import { GameGlobal } from "./GameGlobal";
import { LeadActor } from "./LeadActor";
import { GameEvent } from "./managers/EventManager";

export class Player {
    private static _instance: Player;

    private money = 0;

    static getMoney() {
        return this.I.money;
    }

    static setMoney(v: number) {
        this.I.money = v;
        GameEvent.emit("BalanceChanged", v);
    }
    static addMoney(v: number) {
        this.I.money += v;
        GameEvent.emit("BalanceChanged", this.I.money);
    }
    static setLeadAcotor(Actor: IActor) {
        LeadActor.Actor = Actor;
        LeadActor.Script = Actor;
    }

    private static get I(): Player {
        if (!this._instance) {
            this._instance = new Player();
        }
        return this._instance;
    }
}