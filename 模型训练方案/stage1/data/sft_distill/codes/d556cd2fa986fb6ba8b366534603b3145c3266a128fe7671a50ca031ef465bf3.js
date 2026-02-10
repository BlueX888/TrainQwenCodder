const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const PLAYER_SPEED = 360;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建粉色矩形玩家
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  
  // 将 graphics 转换为纹理
  graphics.generateTexture('playerTexture', PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.destroy();
  
  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'playerTexture'
  );
  
  // 设置玩家原点为中心
  player.setOrigin(0.5, 0.5);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const moveDistance = PLAYER_SPEED * (delta / 1000);
  
  // 重置速度
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
  
  // 归一化对角线移动速度
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新玩家位置
  player.x += velocityX * moveDistance;
  player.y += velocityY * moveDistance;
  
  // 边界限制（考虑矩形的宽高）
  const halfWidth = PLAYER_WIDTH / 2;
  const halfHeight = PLAYER_HEIGHT / 2;
  
  if (player.x - halfWidth < 0) {
    player.x = halfWidth;
  } else if (player.x + halfWidth > config.width) {
    player.x = config.width - halfWidth;
  }
  
  if (player.y - halfHeight < 0) {
    player.y = halfHeight;
  } else if (player.y + halfHeight > config.height) {
    player.y = config.height - halfHeight;
  }
}

new Phaser.Game(config);