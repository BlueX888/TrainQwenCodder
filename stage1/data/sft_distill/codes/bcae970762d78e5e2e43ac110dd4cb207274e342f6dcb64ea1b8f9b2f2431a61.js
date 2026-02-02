const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 300;
const RADIUS = 20;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('playerCircle', RADIUS * 2, RADIUS * 2);
  graphics.destroy();

  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerCircle');

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动增量（delta 单位是毫秒，需要转换为秒）
  const deltaSeconds = delta / 1000;
  const moveDistance = SPEED * deltaSeconds;

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -SPEED;
  } else if (cursors.right.isDown) {
    velocityX = SPEED;
  }

  if (cursors.up.isDown) {
    velocityY = -SPEED;
  } else if (cursors.down.isDown) {
    velocityY = SPEED;
  }

  // 更新玩家位置
  player.x += velocityX * deltaSeconds;
  player.y += velocityY * deltaSeconds;

  // 限制在画布边界内（考虑圆形半径）
  player.x = Phaser.Math.Clamp(player.x, RADIUS, config.width - RADIUS);
  player.y = Phaser.Math.Clamp(player.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);