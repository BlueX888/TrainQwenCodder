const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 80;

function preload() {
  // 程序化生成青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算时间增量（秒）
  const deltaSeconds = delta / 1000;
  
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
  
  // 更新位置
  player.x += velocityX * deltaSeconds;
  player.y += velocityY * deltaSeconds;
  
  // 限制在画布边界内（考虑圆形半径25）
  const radius = 25;
  player.x = Phaser.Math.Clamp(player.x, radius, config.width - radius);
  player.y = Phaser.Math.Clamp(player.y, radius, config.height - radius);
}

new Phaser.Game(config);