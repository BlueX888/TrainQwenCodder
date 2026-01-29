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
const SPEED = 120;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(25, 25, 50, 30); // 中心点(25,25)，宽50，高30
  
  // 生成纹理
  graphics.generateTexture('ellipse', 50, 50);
  graphics.destroy();
  
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'ellipse');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键输入更新位置
  if (cursors.left.isDown) {
    player.x -= distance;
  }
  if (cursors.right.isDown) {
    player.x += distance;
  }
  if (cursors.up.isDown) {
    player.y -= distance;
  }
  if (cursors.down.isDown) {
    player.y += distance;
  }
  
  // 限制在画布边界内（考虑精灵的宽高）
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);