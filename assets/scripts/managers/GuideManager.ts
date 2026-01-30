import { _decorator, Component, Node, Button, tween, Animation, UITransform, Vec3, Game } from 'cc';
import { GameEvent } from './EventManager';
import { AudioManager } from '../PASDK/AudioManager';
import { GameGlobal } from '../GameGlobal';
import { EventEnum } from '../Event/EventEnum';
import { Tractor } from '../prefabs/Tractor';
import { Player } from '../Player';
import { PlayableSDK } from '../PASDK/PlayableSDK';
const { ccclass, property } = _decorator;

@ccclass('GuideManager')
export class GuideManager extends Component {

    @property(Node)
    tipNode: Node;
    @property(Node)
    handNode: Node;
    @property(Node)
    speedUpBtn: Node;
    @property(Node)
    sawBladeUpBtn: Node;
    @property(Node)
    cargoBedUpBtn: Node;
    @property(Animation)
    cargoBedIsFull: Animation;
    @property(Node)
    uiLayer: Node;
    cargoBedLevel: number = -1;
    isGuiding: boolean = false;
    stopTime: number = 0;
    UINode: Node;
    guideCondtionMatrix: [[() => boolean, () => boolean, () => boolean],
        [() => boolean, () => boolean, () => boolean],
        [() => boolean, () => boolean, () => boolean]];

    start() {
        let cb = () => {
            this.stopTime += 1;
        }
        GameEvent.on(EventEnum.BtnClicked, () => {
            this.stopTime = 0;
            this.tipNode.active = false;
            this.handNode.active = false;
        }, this);
        GameEvent.on(EventEnum.HeartBeat, cb, this);
        GameEvent.on('TractorMove', this.hasLearnedMove, this);
        GameEvent.on('TractorMove', this.updateStopTime, this);

        GameEvent.on('TractorMove', () => {
            AudioManager.audioPlay("Train", true);
        }, this);
        GameEvent.on('TractorStop', () => {
            AudioManager.audioStop("Train");
        }, this);
        GameEvent.on('CargoBedIsFull', this.showCargoBedIsFullTip, this);
        GameEvent.on('TractorMoveBack', () => {
            AudioManager.audioStop("Collide");
            AudioManager.audioPlay("Collide", false);
        }, this);
        GameEvent.on(EventEnum.SawBladeNeedUpgrade, this.toLearnSawBladeUp, this);
        let c = this.handNode.getParent();
        this.schedule(() => {
            if (this.isGuiding) return;
            if (this.stopTime < 4) return;
            this.handNode.setParent(c);
            this.tipNode.active = true;
            this.handNode.active = true;
            this.handNode.setPosition(0, 0, 0);
            GameEvent.off('TractorMove', this.hasLearnedMove, this);
            GameEvent.on('TractorMove', this.hasLearnedMove, this);
        }, 2);
        GameEvent.on(EventEnum.DomeCollapse, () => {
            GameEvent.off('TractorMove', this.hasLearnedMove, this);
            GameEvent.off('TractorMove', this.updateStopTime, this);
            GameEvent.off(EventEnum.HeartBeat, cb, this);
            this.scheduleOnce(() => {
                GameGlobal.GameOver = true;
            }, 1);
            this.scheduleOnce(() => {
                this.handNode.setParent(c);
                this.tipNode.active = true;
                this.handNode.active = true;
                this.handNode.setPosition(0, 0, 0);
            }, 3);
        }, this);
        let guideMatrix = [[false, false, false],
        [false, false, false],
        [false, false, false]];

        this.guideCondtionMatrix = [[
            () => { return Player.getMoney() >= GameGlobal.CargoBedUp[2][0] && GameGlobal.Tractor.cargoBedLevel < 2; },
            () => { return Player.getMoney() >= GameGlobal.CargoBedUp[3][0] && GameGlobal.Tractor.cargoBedLevel < 3; },
            () => { return Player.getMoney() >= GameGlobal.CargoBedUp[4][0] && GameGlobal.Tractor.cargoBedLevel < 4; }
        ], [
            () => { return Player.getMoney() >= GameGlobal.GearsUp[2] && GameGlobal.Tractor.sawBladeLevel < 2; },
            () => { return Player.getMoney() >= GameGlobal.GearsUp[3] && GameGlobal.Tractor.sawBladeLevel < 3; },
            () => { return Player.getMoney() >= GameGlobal.GearsUp[4] && GameGlobal.Tractor.sawBladeLevel < 4; }
        ], [
            () => { return Player.getMoney() >= GameGlobal.SpeedUp[2][0] && GameGlobal.Tractor.speedLevel < 2; },
            () => { return Player.getMoney() >= GameGlobal.SpeedUp[3][0] && GameGlobal.Tractor.speedLevel < 3; },
            () => { return Player.getMoney() >= GameGlobal.SpeedUp[4][0] && GameGlobal.Tractor.speedLevel < 4; }
        ]
        ]
        let LevelCondtionMatrix = [[
            () => { return GameGlobal.Tractor.cargoBedLevel >= 2; },
            () => { return GameGlobal.Tractor.cargoBedLevel >= 3; },
            () => { return GameGlobal.Tractor.cargoBedLevel >= 4; }
        ], [
            () => { return GameGlobal.Tractor.sawBladeLevel >= 2; },
            () => { return GameGlobal.Tractor.sawBladeLevel >= 3; },
            () => { return GameGlobal.Tractor.sawBladeLevel >= 4; }
        ], [
            () => { return GameGlobal.Tractor.speedLevel >= 2; },
            () => { return GameGlobal.Tractor.speedLevel >= 3; },
            () => { return GameGlobal.Tractor.speedLevel >= 4; }
        ]
        ]
        let needToClickBtn =
            [[this.cargoBedUpBtn, this.cargoBedUpBtn, this.cargoBedUpBtn],
            [this.sawBladeUpBtn, this.sawBladeUpBtn, this.sawBladeUpBtn],
            [this.speedUpBtn, this.speedUpBtn, this.speedUpBtn]]
        GameEvent.on(EventEnum.HeartBeat, () => {
            if (GameGlobal.GameOver) {
                // this.handNode.active = false;
                return;
            }
            if (!this.isGuiding) {
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (!guideMatrix[j][i]) {
                            if (this.guideCondtionMatrix[j][i]()) {
                                let btn = needToClickBtn[j][i];
                                let button_pos = btn.worldPosition.clone();
                                let uiTransform = this.uiLayer.getComponent(UITransform);
                                let pos_nodeSpace = uiTransform.convertToNodeSpaceAR(new Vec3(button_pos.x, button_pos.y, 0));
                                this.handNode.setPosition(pos_nodeSpace);
                                // this.handNode.setPosition(this.sawBladeUpBtn.getPosition());
                                this.handNode.active = true;
                                return;
                            } else {
                                if (LevelCondtionMatrix[j][i]()) {
                                    guideMatrix[j][i] = true;
                                }
                            }
                        }
                    }
                }
            }
        }, this);

    }
    LearnToMove() {
        this.handNode.setParent(this.UINode);
        this.tipNode.active = true;
        this.handNode.active = true;
        this.handNode.setPosition(0, 0, 0);
    }
    showCargoBedIsFullTip() {
        // GameEvent.off("CargoBedIsFull", this.showCargoBedIsFullTip, this);
        if (this.cargoBedLevel != GameGlobal.Tractor.cargoBedLevel) {
            AudioManager.audioPlay("Reject", false);
            this.cargoBedIsFull.play()
            this.cargoBedLevel = GameGlobal.Tractor.cargoBedLevel;
        }

        // tween(this.node).delay(3).call(() => {
        //     GameEvent.on('CargoBedIsFull', this.showCargoBedIsFullTip, this);
        // }).start();
    }
    toLearnSawBladeUp() {
        let nextLv = GameGlobal.Tractor.sawBladeLevel + 1;
        let Tractor = GameGlobal.Tractor;
        this.isGuiding = true;
        if (nextLv <= Tractor.sawBlades.length) {
            if (GameGlobal.CargoBedUp[Tractor.cargoBedLevel][1] >= GameGlobal.GearsUp[nextLv]) {
                let button_pos = this.sawBladeUpBtn.worldPosition.clone();
                let uiTransform = this.uiLayer.getComponent(UITransform);
                let pos_nodeSpace = uiTransform.convertToNodeSpaceAR(new Vec3(button_pos.x, button_pos.y, 0));
                this.handNode.setPosition(pos_nodeSpace);
                // this.handNode.setPosition(this.sawBladeUpBtn.getPosition());
                this.handNode.active = true;
                let cb = () => { this.handNode.active = false; this.isGuiding = false; GameEvent.off('SawBladeUpgrade', cb, this); };
                GameEvent.on('SawBladeUpgrade', cb, this);
                let cb1 = () => { this.handNode.active = false; this.isGuiding = false; GameEvent.off(EventEnum.PushedCoinTower, cb1, this); };
                GameEvent.on(EventEnum.PushedCoinTower, cb1, this);
            } else {
                let button_pos = this.cargoBedUpBtn.worldPosition.clone();
                let uiTransform = this.uiLayer.getComponent(UITransform);
                let pos_nodeSpace = uiTransform.convertToNodeSpaceAR(new Vec3(button_pos.x, button_pos.y, 0));
                this.handNode.setPosition(pos_nodeSpace);
                // this.handNode.setPosition(this.sawBladeUpBtn.getPosition());
                this.handNode.active = true;
                let cb = () => {
                    this.handNode.active = false;
                    GameEvent.off(EventEnum.CargoBedUpgrade, cb, this);
                    let button_pos = this.sawBladeUpBtn.worldPosition.clone();
                    let uiTransform = this.uiLayer.getComponent(UITransform);
                    let pos_nodeSpace = uiTransform.convertToNodeSpaceAR(new Vec3(button_pos.x, button_pos.y, 0));
                    this.handNode.setPosition(pos_nodeSpace);
                    // this.handNode.setPosition(this.sawBladeUpBtn.getPosition());
                    this.handNode.active = true;
                    let cb1 = () => { this.handNode.active = false; this.isGuiding = false; GameEvent.off(EventEnum.SawBladeUpgrade, cb1, this); };
                    GameEvent.on(EventEnum.SawBladeUpgrade, cb1, this);



                };
                GameEvent.on(EventEnum.CargoBedUpgrade, cb, this);
            }
        }
        // // AudioManager.audioPlay("Reject", false);
        // let btn = this.cargoBedUpBtn.getComponent(Button);
        // btn.interactable = false; // 禁用
        // btn = this.speedUpBtn.getComponent(Button);
        // btn.interactable = false; // 禁用

    }

    updateStopTime() {
        this.stopTime = 0;
    }

    hasLearnedMove() {
        this.tipNode.active = false;
        this.handNode.active = false;
        GameEvent.off('TractorMove', this.hasLearnedMove, this);
    }

    update(deltaTime: number) {

    }
}


