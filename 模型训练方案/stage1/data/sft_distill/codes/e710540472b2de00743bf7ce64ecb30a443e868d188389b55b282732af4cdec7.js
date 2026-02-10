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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的矩形
  graphics.generateTexture('playerRect', 50, 50);
  graphics.destroy();

  // 创建玩家精灵（矩形）并放置在屏幕中心
  player = this.add.sprite(400, 300, 'playerRect');
  player.setOrigin(0.5, 0.5);

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const moveDistance = SPEED * (delta / 1000);

  // 根据方向键输入移动矩形
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

  // 限制在画布边界内
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;

  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);