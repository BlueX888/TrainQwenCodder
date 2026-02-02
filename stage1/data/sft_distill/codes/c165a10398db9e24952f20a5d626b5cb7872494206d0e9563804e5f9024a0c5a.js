const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  }
};

let star;
let cursors;
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  
  // 绘制五角星（中心点在 32, 32）
  graphics.fillStar(32, 32, 5, 10, 25, 0);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 设置精灵与世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  star.setVelocity(0);
  
  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    star.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    star.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    star.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    star.setVelocityY(SPEED);
  }
  
  // 处理对角线移动时的速度归一化
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      star.body.velocity.normalize().scale(SPEED);
    }
  }
}

new Phaser.Game(config);