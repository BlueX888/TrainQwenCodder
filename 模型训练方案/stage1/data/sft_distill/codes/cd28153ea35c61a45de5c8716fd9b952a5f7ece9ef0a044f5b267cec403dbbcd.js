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

let player;
let cursors;
const SPEED = 240;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.generateTexture('playerRect', PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.destroy();

  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'playerRect'
  );

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算每帧移动距离（速度 * 时间差）
  const distance = SPEED * (delta / 1000);

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -distance;
  } else if (cursors.right.isDown) {
    velocityX = distance;
  }

  if (cursors.up.isDown) {
    velocityY = -distance;
  } else if (cursors.down.isDown) {
    velocityY = distance;
  }

  // 更新玩家位置
  player.x += velocityX;
  player.y += velocityY;

  // 边界限制（考虑矩形的宽高）
  const halfWidth = PLAYER_WIDTH / 2;
  const halfHeight = PLAYER_HEIGHT / 2;

  if (player.x - halfWidth < 0) {
    player.x = halfWidth;
  } else if (player.x + halfWidth > config.width) {
    player.x = config.width - halfWidth;
  }

  if (player.y - halfHeight < 0) {
    player.y = halfHeight;
  } else if (player.y + halfHeight > config.height) {
    player.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);