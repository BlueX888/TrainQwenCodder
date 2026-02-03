const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let player;
let cursors;
const SPEED = 120;
const RADIUS = 20;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillCircle(RADIUS, RADIUS, RADIUS);
  graphics.generateTexture('blueCircle', RADIUS * 2, RADIUS * 2);
  graphics.destroy();

  // 创建物理精灵，初始位置在画布中心
  player = this.physics.add.sprite(400, 300, 'blueCircle');
  player.setCollideWorldBounds(true); // 与世界边界碰撞

  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);

  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(SPEED);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(SPEED);
  }

  // 对角线移动时速度归一化
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      player.body.velocity.normalize().scale(SPEED);
    }
  }

  // 手动限制在边界内（作为额外保险，虽然 setCollideWorldBounds 已经处理）
  player.x = Phaser.Math.Clamp(player.x, RADIUS, config.width - RADIUS);
  player.y = Phaser.Math.Clamp(player.y, RADIUS, config.height - RADIUS);
}

// 启动游戏
new Phaser.Game(config);