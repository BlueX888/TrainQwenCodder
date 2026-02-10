const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let circle;
let cursors;
const SPEED = 80;
const RADIUS = 25;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('circleTexture', RADIUS * 2, RADIUS * 2);
  graphics.destroy();

  // 创建圆形精灵，初始位置在画布中心
  circle = this.add.sprite(400, 300, 'circleTexture');

  // 获取方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差 / 1000 转换为秒）
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

  // 限制圆形位置在画布边界内
  circle.x = Phaser.Math.Clamp(circle.x, RADIUS, config.width - RADIUS);
  circle.y = Phaser.Math.Clamp(circle.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);