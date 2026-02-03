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
const RADIUS = 20;

function preload() {
  // 使用 Graphics 生成蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('blueCircle', RADIUS * 2, RADIUS * 2);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(400, 300, 'blueCircle');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
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
  
  // 计算新位置（基于 delta 时间实现平滑移动）
  const deltaSeconds = delta / 1000;
  player.x += velocityX * deltaSeconds;
  player.y += velocityY * deltaSeconds;
  
  // 限制在画布边界内
  player.x = Phaser.Math.Clamp(player.x, RADIUS, config.width - RADIUS);
  player.y = Phaser.Math.Clamp(player.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);