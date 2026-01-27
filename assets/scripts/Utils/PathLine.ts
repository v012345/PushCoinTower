import { CCBoolean, CCInteger, Component, Enum, Line, Node, Vec3, _decorator } from "cc";
import { EDITOR } from "cc/env";
const { ccclass, property, executeInEditMode, requireComponent } = _decorator;

export enum KnotMode {
	Uniform,	//均匀模式
	NonUniform,	//非均匀模式
}

enum eBSPLINE_TYPE {
	eClamped,
	eOpen
}
Enum(KnotMode);

@ccclass('PathLine')
@executeInEditMode
@requireComponent(Line)
export class PathLine extends Component {

	@property([Node])
	private ctrlNodes: Node[] = [];

	@property(CCInteger)
	private segment: number = 16;

	@property(CCBoolean)
	private useBSpline = false;

	@property({ type: KnotMode, visible: function (this: PathLine) { return this.useBSpline; } })
	private knotMode: KnotMode = KnotMode.NonUniform;

	@property([Line])
	exLineNodeArray: Line[] = [];

	private _pathPoints: Vec3[];
	private _ctrlPoints: Vec3[];

	private line: Line;

	protected onLoad(): void {


		if (this.useBSpline) {
			this.createPathPointsWithBS();
		} else {
			this.createPathPoints();
		}

		this.line = this.node.getComponent(Line);

		// if (!this.line) {
		// 	this.node.addComponent(Line);
		// 	this.line.worldSpace = false;
		// 	let w = new CurveRange();
		// 	w.mode = CurveRange.Mode.Constant;
		// 	w.constant = 0.1;
		// 	this.line.width = w;
		// 	let c = new GradientRange();
		// 	c.mode = GradientRange.Mode.Color;
		// 	c.color = Color.GREEN;// new Color(0, 1, 0, 1);
		// 	this.line.color = c;
		// }
		if (this.line && this._pathPoints) {
			//this.line.positions = this._pathPoints.slice(0,100);
			// for(let i =0;i<100;i++){
			// 	this.line.positions[i] = this._pathPoints[i];
			// }
			this.createLine();
		}

		if (!EDITOR) {
			for (let i = 0; i < this.ctrlNodes.length; i++) {
				this.ctrlNodes[i] && (this.ctrlNodes[i].active = false);
			}
		}
	}


	public get pathPoints(): Vec3[] {
		return this._pathPoints;
	}
	public get ctrlPoints(): Vec3[] {
		return this._ctrlPoints;
	}

	public createPathPoints() {
		// 记录控制点位置
		this._ctrlPoints = [];
		for (let i = 0; i < this.ctrlNodes.length; i++) {
			this.ctrlNodes[i] && this._ctrlPoints.push(this.ctrlNodes[i].getPosition());
		}

		let len = this._ctrlPoints.length;
		if (len < 2) return;
		if (len == 2) {
			this._pathPoints = [this._ctrlPoints[0], this._ctrlPoints[1]];
		} else if (len == 3) {
			this._pathPoints = this.bezier2PosList(this._ctrlPoints[0], this._ctrlPoints[1], this._ctrlPoints[2], this.segment);
		} else if (len == 4) {
			this._pathPoints = this.bezier3PosList(this._ctrlPoints[0], this._ctrlPoints[1], this._ctrlPoints[2], this._ctrlPoints[3], this.segment);
		} else {
			this._pathPoints = this.getBezierPos(this._ctrlPoints, this.segment);
		}
	}

	public createPathPointsWithBS() {
		this._ctrlPoints = [];
		for (let i = 0; i < this.ctrlNodes.length; i++) {
			this.ctrlNodes[i] && this._ctrlPoints.push(this.ctrlNodes[i].getPosition());
		}
		let len = this._ctrlPoints.length;
		if (len < 2) return;
		let degree = 20;
		let knots;
		if (this.knotMode == KnotMode.Uniform) {
			knots = this.generateUniformKnots(len, degree);
		}
		else if (this.knotMode == KnotMode.NonUniform) {
			knots = this.generateNonUniformKnots(this._ctrlPoints, degree);
		}

		this._pathPoints = this.makeBspline(this._ctrlPoints, knots, this.segment);
		this._pathPoints.pop()
	}

	protected update(dt: number): void {
		if (EDITOR && this.line) {
			if (this.useBSpline) {
				this.createPathPointsWithBS();
			} else {
				this.createPathPoints();
			}

			this.createLine();
		}
	}

	createLine() {
		if (this._pathPoints) {
			if (this._pathPoints.length < 100) {
				this.line.positions = this._pathPoints;
			} else {
				this.line.positions = this._pathPoints.slice(0, 100);
				for (let i = 0; i < this.exLineNodeArray.length; i++) {
					this.exLineNodeArray[i].positions = this._pathPoints.slice(i * 100 + 100, i * 100 + 200);
				}
			}
		}
	}


	private bezier2(c1: Vec3, c2: Vec3, c3: Vec3, t: number) {
		const t1 = 1 - t;
		const tt = t * t;
		let x = t1 * t1 * c1.x + 2 * t * t1 * c2.x + tt * c3.x;
		let y = t1 * t1 * c1.y + 2 * t * t1 * c2.y + tt * c3.y;
		let z = t1 * t1 * c1.z + 2 * t * t1 * c2.z + tt * c3.z;
		return new Vec3(x, y, z);
	}

	private bezier3(c1: Vec3, c2: Vec3, c3: Vec3, c4: Vec3, t: number) {
		const t1 = 1 - t;
		const tt = t * t;
		let x = t1 * (t1 * (c1.x + (c2.x * 3 - c1.x) * t) + c3.x * 3 * tt) + c4.x * t * tt;
		let y = t1 * (t1 * (c1.y + (c2.y * 3 - c1.y) * t) + c3.y * 3 * tt) + c4.y * t * tt;
		let z = t1 * (t1 * (c1.z + (c2.z * 3 - c1.z) * t) + c3.z * 3 * tt) + c4.z * t * tt;
		return new Vec3(x, y, z);
	}

	/**
	 * 
	 * @param c1 
	 * @param c2 
	 * @param c3 
	 * @param precison 精度，需要计算的该条贝塞尔曲线上的点的数目， 包含c1和c3
	 */
	private bezier2PosList(c1: Vec3, c2: Vec3, c3: Vec3, precison: number): Array<Vec3> {
		let arr: Vec3[] = [c1];
		let r = 1 / precison;
		let t = r;
		for (let i = 0; i < precison - 2; i++) {
			arr.push(this.bezier2(c1, c2, c3, t));
			t += r;
		}
		arr.push(c3);

		return arr;
	}

	/**
	 * 
	 * @param c1 
	 * @param c2 
	 * @param c3 
	 * @param c4 
	 * @param precison 精度，需要计算的该条贝塞尔曲线上的点的数目， 包含c1和c4
	 */
	private bezier3PosList(c1: Vec3, c2: Vec3, c3: Vec3, c4: Vec3, precison: number): Array<Vec3> {
		let arr: Vec3[] = [c1];
		let r = 1 / precison;
		let t = r;
		for (let i = 0; i < precison - 2; i++) {
			arr.push(this.bezier3(c1, c2, c3, c4, t));
			t += r;
		}
		arr.push(c4);

		return arr;
	}


	/**
	* 
	* @param ctrlPosArr 贝塞尔曲线控制点坐标
	* @param precison 精度，需要计算的该条贝塞尔曲线上的点的数目
	* @return resArr 该条贝塞尔曲线上的点（二维坐标）
	*/
	private getBezierPos(ctrlPosArr: Array<Vec3>, precison: number): Array<Vec3> {
		let resArr: Array<Vec3> = new Array<Vec3>();

		/**贝塞尔曲线控制点数目（阶数）*/
		let number: number = ctrlPosArr.length;
		if (number < 2) {
			// cc.log("控制点数不能小于 2");
			return resArr;
		}

		/**杨辉三角数据 */
		let yangHuiArr: Array<number> = this.getYangHuiTriangle(number);

		//计算坐标
		for (let i = 0; i < precison; i++) {
			let t: number = i / precison;
			let tmpX: number = 0;
			let tmpY: number = 0;
			let tmpZ: number = 0;
			for (let j = 0; j < number; j++) {
				tmpX += Math.pow(1 - t, number - j - 1) * ctrlPosArr[j].x * Math.pow(t, j) * yangHuiArr[j];
				tmpY += Math.pow(1 - t, number - j - 1) * ctrlPosArr[j].y * Math.pow(t, j) * yangHuiArr[j];
				tmpZ += Math.pow(1 - t, number - j - 1) * ctrlPosArr[j].z * Math.pow(t, j) * yangHuiArr[j];
			}
			resArr[i] = new Vec3(tmpX, tmpY, tmpZ);
		}

		return resArr;
	}

	/**
	 * 获取杨辉三角对应阶数的值
	 * @param num 杨辉三角阶数
	 */
	private getYangHuiTriangle(num: number): Array<number> {
		//计算杨辉三角
		let yangHuiArr = new Array<number>();

		if (num === 1) {
			yangHuiArr[0] = 1;
		} else {
			yangHuiArr[0] = yangHuiArr[1] = 1;

			for (let i = 3; i <= num; i++) {
				let t = new Array<number>();
				for (let j = 0; j < i - 1; j++) {
					t[j] = yangHuiArr[j];
				}

				yangHuiArr[0] = yangHuiArr[i - 1] = 1;
				for (let j = 0; j < i - 2; j++) {
					yangHuiArr[j + 1] = t[j] + t[j + 1];
				}
			}
		}

		// cc.log(yangHuiArr);
		return yangHuiArr;
	}

	deBoor(controlPoints: Vec3[], t: number[], d: number, u: number, j: number): Vec3 {
		const arr = controlPoints.map((point) => new Vec3(point.x, point.y, point.z));
		const length = t[j + 2] - t[j + 1];
		u *= length;
		u += t[j + 1];

		for (let h = 0; h < d; h++) {
			for (let i = 0; i < d - h; i++) {
				const low = j + i + h - (d - 2); // (d-2) 是一个 hack，可能不适合 d > 3
				const high = low + d - h;
				const l = (t[low] !== t[high]) ? (u - t[low]) / (t[high] - t[low]) : 0;

				arr[i].x = (1 - l) * arr[i].x + l * arr[i + 1].x;
				arr[i].y = (1 - l) * arr[i].y + l * arr[i + 1].y;
				arr[i].z = (1 - l) * arr[i].z + l * arr[i + 1].z;
			}
		}
		return arr[0];
	};

	getControlPoints(controlPoints: Vec3[], degree: number, index: number): Vec3[] {
		const arr: Vec3[] = new Array(degree + 1);
		for (let i = index; i < index + degree + 1; i++) {
			arr[i - index] = new Vec3(controlPoints[i].x, controlPoints[i].y, controlPoints[i].z);
		}
		return arr;
	};

	makeBspline(controlPoints: Vec3[], knots: number[], tesselation: number): Vec3[] {
		const d = knots.length - controlPoints.length - 1; // degree
		if (controlPoints.length <= d) {
			throw new TypeError("cp.length < d, k === cp + d + 1");
		}

		const b: Vec3[] = new Array(tesselation * (controlPoints.length - d) + 1); // spline
		for (let j = d - 1; j < controlPoints.length - 1; j++) { // knot index
			const cp = this.getControlPoints(controlPoints, d, j - d + 1);
			for (let i = 0; i < tesselation; i++) {
				b[i + (j - d + 1) * tesselation] = this.deBoor(cp, knots, d, i / tesselation, j);
			}
		}
		const lastJ = controlPoints.length - 2;
		b[b.length - 1] = this.deBoor(this.getControlPoints(controlPoints, d, lastJ - d), knots, d, 1, lastJ - 1); // end point
		return b;
	};

	generateUniformKnots(controlPointsCount: number, degree: number): number[] {
		const knots: number[] = [];
		const totalKnots = controlPointsCount + degree + 1;

		// 添加前面的重复节点
		for (let i = 0; i <= degree; i++) {
			knots.push(1);
		}

		// 添加中间的节点
		for (let i = 1; i <= controlPointsCount - degree; i++) {
			knots.push(i);
		}

		// 添加后面的重复节点
		for (let i = 0; i <= degree; i++) {
			knots.push(controlPointsCount - degree);
		}

		return knots;
	}

	generateNonUniformKnots(controlPoints: Vec3[], degree: number): number[] {
		const knots: number[] = [];
		const controlPointsCount = controlPoints.length;

		// 添加前面的重复节点
		for (let i = 0; i <= degree; i++) {
			knots.push(0);
		}

		// 根据控制点的数量生成节点
		for (let i = 1; i <= controlPointsCount - degree; i++) {
			knots.push(i / (controlPointsCount - degree + 1)); // 归一化
		}

		// 添加后面的重复节点
		for (let i = 0; i <= degree; i++) {
			knots.push(1);
		}

		return knots;
	}



}