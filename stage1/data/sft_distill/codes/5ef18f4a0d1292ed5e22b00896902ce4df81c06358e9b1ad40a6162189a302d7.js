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
const SPEED = 120;
const RADIUS = 20;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  
  // 生成纹理
  graphics.generateTexture('playerCircle', RADIUS * 2, RADIUS * 2);
  graphics.destroy();
  
  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(config.width / 2, config.height / 2, 'playerCircle');
  
  // 创建方向键输入
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
  
  // 限制在画布边界内
  player.x = Phaser.Math.Clamp(player.x, RADIUS, config.width - RADIUS);
  player.y = Phaser.Math.Clamp(player.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);