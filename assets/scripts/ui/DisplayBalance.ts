import { _decorator, Component, Game, LabelComponent, Node } from 'cc';
import { GameEvent } from '../managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('DisplayBalance')
export class DisplayBalance extends Component {
    label: LabelComponent;
    start() {
        this.label = this.node.getComponent(LabelComponent);
        GameEvent.on('BalanceChanged', (newBalance: number) => {
            this.label.string = newBalance.toString();
        })
    }

    update(deltaTime: number) {

    }
}


