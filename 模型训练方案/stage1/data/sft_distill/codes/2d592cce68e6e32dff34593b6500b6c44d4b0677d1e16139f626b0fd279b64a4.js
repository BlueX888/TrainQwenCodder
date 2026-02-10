const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let circle;
let cursors;
const SPEED = 360;
const RADIUS = 25;

function preload() {
  // 使用 Graphics 创建白色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('circle', RADIUS * 2, RADIUS * 2);
  graphics.destroy();
}

function create() {
  // 创建圆形精灵，初始位置在画布中心
  circle = this.add.sprite(400, 300, 'circle');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键状态更新位置
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