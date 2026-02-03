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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 50, 50);
  
  // 生成纹理
  graphics.generateTexture('playerTexture', 50, 50);
  graphics.destroy();
  
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerTexture');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键状态更新位置
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
  
  // 限制玩家在画布边界内
  // 考虑方块的宽高（50x50），边界为方块中心点的有效范围
  const halfWidth = 25;
  const halfHeight = 25;
  
  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);