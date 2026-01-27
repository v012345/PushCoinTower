import { _decorator, Component, Node, Collider, ITriggerEvent, PhysicsGroup, Game } from 'cc';
import { Coin } from './Coin';
import { AudioManager } from '../PASDK/AudioManager';
import { GameEvent } from '../managers/EventManager';
import { EventEnum } from '../Event/EventEnum';
const { ccclass, property } = _decorator;

@ccclass('CoinDome')
export class CoinDome extends Component {
    @property(Collider)
    collider: Collider;
    @property(Node)
    coins: Node;
    onload() {

    }
    start() {
        this.coins.children.forEach(coin => {
            coin.addComponent(Coin)
        })
        this.collider.on('onTriggerEnter', (event: ITriggerEvent) => {
            // return;
            if (event.otherCollider.node.name == "TractorGearsCollider") {
                //     const actor = event.otherCollider.getComponent('TractorGearsCollider').getPusherScript();
                //     if (!this.hasBePushed && actor.level >= this.level) {
                //         this.hasBePushed = true;
                //         this.coinsNodes.forEach(coins => {
                //             coins.getComponent(OneLayerOfCoins).scatter();
                //         });
                //     }
                AudioManager.audioPlay("DomeCollapse", false);
                GameEvent.emit(EventEnum.DomeCollapse);
                this.coins.children.forEach(coin => {
                    coin.getComponent(Coin).drop(true);
                })
                // this.node.destroy();
            }
        }, this);
    }

    update(deltaTime: number) {

    }
}


