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
const SPEED = 120;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('playerCircle', 50, 50); // 生成 50x50 的纹理
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成

  // 创建玩家精灵，放置在画布中心
  player = this.add.sprite(400, 300, 'playerCircle');

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间增量，转换为秒）
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

  // 限制玩家在画布边界内（考虑圆形半径）
  const radius = 25;
  player.x = Phaser.Math.Clamp(player.x, radius, config.width - radius);
  player.y = Phaser.Math.Clamp(player.y, radius, config.height - radius);
}

// 启动游戏
new Phaser.Game(config);