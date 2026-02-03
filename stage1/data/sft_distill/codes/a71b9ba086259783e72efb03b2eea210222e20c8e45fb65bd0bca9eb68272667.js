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
const SPEED = 120;

function preload() {
  // 使用 Graphics 创建橙色星形纹理
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制星形 (x, y, points, innerRadius, outerRadius)
  graphics.fillStar(32, 32, 5, 16, 32);
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建星形物理精灵，放置在画布中心
  star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置精灵与世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(16, 16, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update() {
  // 重置速度
  star.setVelocity(0, 0);
  
  // 根据方向键设置速度
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
  
  // 对角线移动时标准化速度，保持一致的移动速度
  if (star.body.velocity.x !== 0 && star.body.velocity.y !== 0) {
    star.body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);