import { Node } from 'cc';
import { GameGlobal } from "./GameGlobal";
import { PlayableSDK } from './PASDK/PlayableSDK';

export class LeadActor {
    private static _instance: LeadActor;
    static Actor: IActor;
    static Script: any;


    private static get I(): LeadActor {
        if (!this._instance) {
            this._instance = new LeadActor();
        }
        return this._instance;
    }
    static move(): void {
        if (GameGlobal.GameOver) {
            PlayableSDK.download()
            return;
        }
        LeadActor.Actor.move();
    }
    static stop(): void {
        LeadActor.Actor.stop();
    }
}