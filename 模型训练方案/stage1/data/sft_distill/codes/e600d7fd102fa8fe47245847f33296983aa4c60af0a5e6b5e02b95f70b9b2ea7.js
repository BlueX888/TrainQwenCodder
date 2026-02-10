const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let pointer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制六边形（中心点在 40, 40）
  const hexRadius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = 40 + hexRadius * Math.cos(angle);
    const y = 40 + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 80, 80);
  graphics.destroy();
  
  // 创建六边形精灵
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 获取指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算平滑跟随
  // 速度80表示每秒移动80像素的速度因子
  const speed = 80;
  
  // 计算移动因子（基于帧时间）
  const lerpFactor = 1 - Math.pow(1 - speed / 1000, delta);
  
  // 使用线性插值实现平滑跟随
  hexagon.x = Phaser.Math.Linear(hexagon.x, pointer.x, lerpFactor);
  hexagon.y = Phaser.Math.Linear(hexagon.y, pointer.y, lerpFactor);
}

new Phaser.Game(config);