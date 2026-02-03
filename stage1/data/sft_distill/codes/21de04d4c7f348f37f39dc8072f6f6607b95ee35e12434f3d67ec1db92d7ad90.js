const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 360; // 移动速度（像素/秒）
const RADIUS = 20; // 圆形半径

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
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaSeconds = delta / 1000;
  
  // 计算移动距离
  const moveDistance = SPEED * deltaSeconds;
  
  // 初始化移动向量
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -1;
  } else if (cursors.right.isDown) {
    velocityX = 1;
  }
  
  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }
  
  // 归一化对角线移动速度（防止对角线移动过快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;
  
  // 限制在画布边界内（考虑圆形半径）
  player.x = Phaser.Math.Clamp(player.x, RADIUS, config.width - RADIUS);
  player.y = Phaser.Math.Clamp(player.y, RADIUS, config.height - RADIUS);
}

new Phaser.Game(config);