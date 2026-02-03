const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let circle;
let cursors;
const SPEED = 80;
const RADIUS = 25;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建灰色圆形
  circle = this.add.graphics();
  circle.fillStyle(0x808080, 1); // 灰色
  circle.fillCircle(0, 0, RADIUS);
  
  // 设置初始位置为画布中心
  circle.x = config.width / 2;
  circle.y = config.height / 2;
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键输入更新位置
  if (cursors.left.isDown) {
    circle.x -= distance;
  }
  if (cursors.right.isDown) {
    circle.x += distance;
  }
  if (cursors.up.isDown) {
    circle.y -= distance;
  }
  if (cursors.down.isDown) {
    circle.y += distance;
  }
  
  // 限制圆形在画布边界内（考虑圆形半径）
  circle.x = Phaser.Math.Clamp(circle.x, RADIUS, config.width - RADIUS);
  circle.y = Phaser.Math.Clamp(circle.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);