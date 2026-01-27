import { _decorator, Camera, Node, Vec3 } from 'cc';
import { MainGame } from "./MainGame";
import { Actor } from './Actor';
import { Tractor } from './prefabs/Tractor';
import { Coin } from './prefabs/Coin';
// import { CoinNumber } from './Utils/CoinNumber';
// import { Train } from './Train';
// import { Factory } from './Factory';



export class GameGlobal {
    static GameOver = false;
    static realWidth = 720;
    static realHeight = 720;
    static viewScale: number = 1;
    public static mainGame: MainGame;
    public static MainCamera: Camera;
    public static cameraMoving: boolean = false;
    public static effectLay: Node;
    public static UILayer: Node;
    // public static coinNumber: CoinNumber;
    // public static coin: number = 0;
    // public static train: Train;
    // public static factory: Factory;
    // public static failNum: number = 0;
    public static cargoBed: Node;
    public static CoinsPool: Array<Coin> = [];
    public static Tractor: Tractor;
    public static levelMap: Record<number, number> = {
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 2,
        9: 2,
        10: 2,
        11: 2,
        12: 2,
        13: 3,
        14: 3,
        15: 3,
        16: 3,
        17: 3,
    };
    public static ItemPrice: Record<number, number> = {
        1: 5, // id price
        2: 10,
        3: 15,
        4: 20,
        5: 30,
        6: 50,
        7: 80,
        8: 120,
        9: 200,
        10: 300,
    };
    public static CargoBedUp: Record<number, Array<number>> = {
        1: [0, 36], // level: [item_id, capacity]
        2: [30, 81],
        3: [50, 150],
        4: [100, 300],
    };
    public static GearsUp: Record<number, number> = {
        1: 0,
        2: 30,
        3: 50,
        4: 100,
    };
    public static SpeedUp: Record<number, Array<number>> = {
        1: [0, 10],
        2: [30, 15],
        3: [50, 20],
        4: [100, 25],
    };
    public static FirstCoinPosInCargo: Record<number, Vec3> = {
        1: new Vec3(-6, 0.3, -4),
        2: new Vec3(-6, 0.3, -6),
        3: new Vec3(-4, 0.3, -9),
        4: new Vec3(-6, 1.7, -10),
    }
    public static CoinSize: Record<number, Array<number>> = {
        1: [4, 1.1, 4],
        2: [4, 1.1, 4],
        3: [4, 1.1, 3.5],
        4: [4, 1.1, 4],
    }
}