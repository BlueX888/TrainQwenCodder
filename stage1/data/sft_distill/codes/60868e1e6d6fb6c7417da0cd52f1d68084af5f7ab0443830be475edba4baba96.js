const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 300;
const RADIUS = 25;

function preload() {
  // 使用 Graphics 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('player', RADIUS * 2, RADIUS * 2);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'player');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, '使用方向键移动青色圆形', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
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
  
  // 限制在画布边界内（考虑圆形半径）
  player.x = Phaser.Math.Clamp(player.x, RADIUS, config.width - RADIUS);
  player.y = Phaser.Math.Clamp(player.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);