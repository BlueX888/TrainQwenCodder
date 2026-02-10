const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 240;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

function preload() {
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.generateTexture('player', PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'player'
  );
  
  // 设置精灵原点为中心
  player.setOrigin(0.5, 0.5);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加说明文字
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离
  const deltaSeconds = delta / 1000;
  const moveDistance = SPEED * deltaSeconds;
  
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
  
  // 更新玩家位置
  player.x += velocityX * deltaSeconds;
  player.y += velocityY * deltaSeconds;
  
  // 限制在画布边界内（考虑精灵的宽高）
  const halfWidth = PLAYER_WIDTH / 2;
  const halfHeight = PLAYER_HEIGHT / 2;
  
  player.x = Phaser.Math.Clamp(
    player.x,
    halfWidth,
    config.width - halfWidth
  );
  
  player.y = Phaser.Math.Clamp(
    player.y,
    halfHeight,
    config.height - halfHeight
  );
}

new Phaser.Game(config);