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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillStar(32, 32, 5, 16, 32, 0); // 5个角的星形
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建带物理属性的星形精灵，放置在画布中心
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
  star.setVelocity(0, 0);
  
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
  
  // 如果同时按下两个方向键，需要归一化速度以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    const velocityX = star.body.velocity.x;
    const velocityY = star.body.velocity.y;
    const normalizedSpeed = SPEED / Math.sqrt(2);
    star.setVelocity(
      velocityX !== 0 ? Math.sign(velocityX) * normalizedSpeed : 0,
      velocityY !== 0 ? Math.sign(velocityY) * normalizedSpeed : 0
    );
  }
}

new Phaser.Game(config);