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

let circle;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(0, 0, 50); // 圆心在 (0,0)，半径 50
  
  // 添加一个标记线，用于观察旋转效果
  graphics.lineStyle(3, 0xff0000, 1);
  graphics.lineBetween(0, 0, 50, 0);
  
  // 创建容器并将 Graphics 添加进去
  circle = this.add.container(400, 300);
  circle.add(graphics);
  
  // 添加说明文字
  this.add.text(10, 10, '圆形以每秒 240 度的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 每秒旋转 240 度
  // delta 是毫秒，需要转换为秒
  // 240 度 = 240 * (Math.PI / 180) 弧度
  const rotationSpeed = 240 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000); // 本帧旋转量
  
  // 累加旋转角度
  circle.rotation += rotationDelta;
}

new Phaser.Game(config);