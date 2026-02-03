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
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的矩形
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy();

  // 创建玩家矩形精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'playerRect');
  
  // 设置原点为中心点，便于边界检测
  player.setOrigin(0.5, 0.5);

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
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

  // 更新位置
  player.x += velocityX;
  player.y += velocityY;

  // 限制在画布边界内
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;

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