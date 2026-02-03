const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 360;
const RADIUS = 20;

function preload() {
  // 使用 Graphics 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('player', RADIUS * 2, RADIUS * 2);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，位置在画布中心
  player = this.add.sprite(400, 300, 'player');
  
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
  
  // 对角线移动时归一化速度
  if (velocityX !== 0 && velocityY !== 0) {
    velocityX *= Math.SQRT1_2; // 约 0.707
    velocityY *= Math.SQRT1_2;
  }
  
  // 更新位置（delta 单位是毫秒，需要转换为秒）
  player.x += velocityX * (delta / 1000);
  player.y += velocityY * (delta / 1000);
  
  // 限制在画布边界内
  player.x = Phaser.Math.Clamp(player.x, RADIUS, config.width - RADIUS);
  player.y = Phaser.Math.Clamp(player.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);