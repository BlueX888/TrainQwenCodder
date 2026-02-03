const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 120;

function preload() {
  // 使用 Graphics 创建绿色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 圆心在(25,25)，半径25
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
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
  
  // 根据时间差计算位移（delta 单位是毫秒）
  const deltaSeconds = delta / 1000;
  player.x += velocityX * deltaSeconds;
  player.y += velocityY * deltaSeconds;
  
  // 限制在画布边界内（考虑圆形半径25）
  const radius = 25;
  player.x = Phaser.Math.Clamp(player.x, radius, config.width - radius);
  player.y = Phaser.Math.Clamp(player.y, radius, config.height - radius);
}

new Phaser.Game(config);