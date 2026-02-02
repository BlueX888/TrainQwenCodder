const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 360;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建粉色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.generateTexture('player', PLAYER_WIDTH, PLAYER_HEIGHT);
  graphics.destroy();

  // 创建玩家精灵，初始位置在画布中心
  player = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'player'
  );

  // 设置原点为中心点
  player.setOrigin(0.5, 0.5);

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);

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

  // 对角线移动时归一化速度
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }

  // 更新玩家位置
  player.x += velocityX * distance;
  player.y += velocityY * distance;

  // 限制在画布边界内（考虑矩形的宽高）
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

// 启动游戏
new Phaser.Game(config);