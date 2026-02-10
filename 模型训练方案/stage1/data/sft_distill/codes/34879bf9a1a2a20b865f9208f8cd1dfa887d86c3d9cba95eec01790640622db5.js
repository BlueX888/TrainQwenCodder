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
  graphics.generateTexture('pinkRect', 50, 50);
  graphics.destroy();

  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'pinkRect');
  player.setOrigin(0.5, 0.5);

  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);

  // 水平移动
  if (cursors.left.isDown) {
    player.x -= distance;
  } else if (cursors.right.isDown) {
    player.x += distance;
  }

  // 垂直移动
  if (cursors.up.isDown) {
    player.y -= distance;
  } else if (cursors.down.isDown) {
    player.y += distance;
  }

  // 限制在画布边界内（考虑矩形的宽高）
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);