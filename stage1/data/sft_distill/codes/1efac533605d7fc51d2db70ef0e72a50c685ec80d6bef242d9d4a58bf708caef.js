const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 160;

function preload() {
  // 创建橙色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('orangeRect', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建玩家矩形，初始位置在画布中心
  player = this.add.sprite(400, 300, 'orangeRect');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间）
  const moveDistance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -moveDistance;
  } else if (cursors.right.isDown) {
    velocityX = moveDistance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -moveDistance;
  } else if (cursors.down.isDown) {
    velocityY = moveDistance;
  }
  
  // 更新玩家位置
  player.x += velocityX;
  player.y += velocityY;
  
  // 限制在画布边界内（考虑矩形的宽高）
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  player.x = Phaser.Math.Clamp(player.x, halfWidth, config.width - halfWidth);
  player.y = Phaser.Math.Clamp(player.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);