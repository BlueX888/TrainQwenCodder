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
const SPEED = 160;

function preload() {
  // 使用 Graphics 创建灰色星形纹理
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制星形（中心点在 32, 32，外半径 30，内半径 15，5个角）
  graphics.fillStar(32, 32, 5, 15, 30, 0);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建带物理属性的星形精灵，初始位置在画布中心
  star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置精灵的碰撞边界，使其不会超出画布
  star.setCollideWorldBounds(true);
  
  // 设置物理世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建方向键监听器
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  // 重置速度
  star.setVelocity(0, 0);
  
  // 根据方向键状态设置速度
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
      // 对角线移动时，将速度调整为 SPEED / sqrt(2)
      star.body.velocity.normalize().scale(SPEED);
    }
  }
}

new Phaser.Game(config);