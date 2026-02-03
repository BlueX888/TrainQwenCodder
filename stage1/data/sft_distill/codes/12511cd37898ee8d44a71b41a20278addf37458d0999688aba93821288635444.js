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
const RADIUS = 20;

function preload() {
  // 使用 Graphics 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('playerCircle', RADIUS * 2, RADIUS * 2);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    color: '#ffffff'
  });
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
  
  // 对角线移动时进行归一化处理，保持速度一致
  if (velocityX !== 0 && velocityY !== 0) {
    const factor = Math.sqrt(2) / 2; // 约 0.707
    velocityX *= factor;
    velocityY *= factor;
  }
  
  // 根据 delta 时间更新位置（delta 单位是毫秒）
  player.x += velocityX * (delta / 1000);
  player.y += velocityY * (delta / 1000);
  
  // 限制在画布边界内
  const minX = RADIUS;
  const maxX = config.width - RADIUS;
  const minY = RADIUS;
  const maxY = config.height - RADIUS;
  
  player.x = Phaser.Math.Clamp(player.x, minX, maxX);
  player.y = Phaser.Math.Clamp(player.y, minY, maxY);
}

new Phaser.Game(config);