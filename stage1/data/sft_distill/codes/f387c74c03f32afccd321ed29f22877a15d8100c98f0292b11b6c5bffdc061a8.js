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
  // 使用 Graphics 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('player', 50, 50);
  graphics.destroy();

  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'player');
  player.setOrigin(0.5, 0.5);

  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;

  // 计算移动距离
  const moveDistance = SPEED * deltaSeconds;

  // 根据方向键更新位置
  if (cursors.left.isDown) {
    player.x -= moveDistance;
  }
  if (cursors.right.isDown) {
    player.x += moveDistance;
  }
  if (cursors.up.isDown) {
    player.y -= moveDistance;
  }
  if (cursors.down.isDown) {
    player.y += moveDistance;
  }

  // 限制在画布边界内（考虑矩形的宽高）
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;

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