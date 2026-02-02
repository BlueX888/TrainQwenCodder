const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let cursors;
const SPEED = 300;
const RADIUS = 20;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  
  // 生成纹理
  graphics.generateTexture('playerCircle', RADIUS * 2, RADIUS * 2);
  graphics.destroy();
  
  // 创建玩家精灵，设置在画布中心
  player = this.add.sprite(
    config.width / 2,
    config.height / 2,
    'playerCircle'
  );
  
  // 获取方向键输入
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
    velocityX = -distance;
  } else if (cursors.right.isDown) {
    velocityX = distance;
  }
  
  if (cursors.up.isDown) {
    velocityY = -distance;
  } else if (cursors.down.isDown) {
    velocityY = distance;
  }
  
  // 更新玩家位置
  player.x += velocityX;
  player.y += velocityY;
  
  // 限制在画布边界内（考虑圆形半径）
  player.x = Phaser.Math.Clamp(
    player.x,
    RADIUS,
    config.width - RADIUS
  );
  player.y = Phaser.Math.Clamp(
    player.y,
    RADIUS,
    config.height - RADIUS
  );
}

// 启动游戏
new Phaser.Game(config);