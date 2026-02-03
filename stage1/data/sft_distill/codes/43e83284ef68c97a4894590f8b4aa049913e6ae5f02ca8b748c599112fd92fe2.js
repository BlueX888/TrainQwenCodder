const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let circleContainer;
const ROTATION_SPEED = Phaser.Math.DegToRad(240); // 每秒 240 度转换为弧度

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  
  // 绘制圆形主体
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 80);
  
  // 绘制一条从圆心指向边缘的线，用于观察旋转
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(80, 0);
  graphics.strokePath();
  
  // 在圆的边缘绘制一个小圆点作为额外的旋转标记
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(80, 0, 10);
  
  // 将 Graphics 放入 Container 中以便旋转
  circleContainer = this.add.container(400, 300);
  circleContainer.add(graphics);
  
  // 添加说明文字
  const text = this.add.text(400, 50, '圆形以每秒 240° 的速度旋转', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 根据时间增量计算旋转角度
  // delta 是毫秒，需要转换为秒
  const rotationDelta = ROTATION_SPEED * (delta / 1000);
  
  // 更新 Container 的旋转角度
  circleContainer.rotation += rotationDelta;
}

new Phaser.Game(config);