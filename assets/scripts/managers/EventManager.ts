import { _decorator, Component, Node, EventTarget } from 'cc';
const { ccclass, property } = _decorator;

export const GameEvent = new EventTarget();
@ccclass('EventManager')
export class EventManager extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
}


