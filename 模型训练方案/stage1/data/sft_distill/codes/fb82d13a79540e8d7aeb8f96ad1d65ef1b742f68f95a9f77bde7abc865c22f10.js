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

let player;
let cursors;
const SPEED = 360;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.generateTexture('player', PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.destroy();

  // 创建玩家精灵，设置在画布中心
  player = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'player'
  );

  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 转换为秒（delta 是毫秒）
  const deltaSeconds = delta / 1000;

  // 计算移动量
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

  // 更新位置
  player.x += velocityX * deltaSeconds;
  player.y += velocityY * deltaSeconds;

  // 限制在画布边界内（考虑矩形的宽高）
  const halfWidth = PLAYER_WIDTH / 2;
  const halfHeight = PLAYER_HEIGHT / 2;

  player.x = Phaser.Math.Clamp(
    player.x,
    halfWidth,
    config.width - halfWidth
  );

  player.y = Phaser.Math.Clamp(
    player.y,
    halfHeight,
    config.height - halfHeight
  );
}

new Phaser.Game(config);