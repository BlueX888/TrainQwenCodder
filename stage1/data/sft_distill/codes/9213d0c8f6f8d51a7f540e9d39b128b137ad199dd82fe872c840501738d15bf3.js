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
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy();

  // 创建玩家精灵并设置初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerRect');
  player.setOrigin(0.5, 0.5);

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算每帧移动距离
  const deltaSeconds = delta / 1000;
  const moveDistance = SPEED * deltaSeconds;

  // 重置速度
  let velocityX = 0;
  let velocityY = 0;

  // 检测方向键状态
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

  // 限制在画布边界内
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;

  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);