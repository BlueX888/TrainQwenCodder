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
  // 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('pinkRect', 50, 50);
  graphics.destroy();

  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'pinkRect');
  player.setOrigin(0.5, 0.5);

  // 获取方向键
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

  // 更新玩家位置
  player.x += velocityX;
  player.y += velocityY;

  // 限制在画布边界内（考虑精灵的宽高）
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;

  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);