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
  // 使用 Graphics 创建橙色星形纹理
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制星形（中心点在 32, 32，半径 30）
  graphics.fillStar(32, 32, 5, 10, 30, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建星形精灵，位置在画布中心
  star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置碰撞世界边界
  star.setCollideWorldBounds(true);
  
  // 创建光标键
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
  
  // 如果同时按下两个方向键，需要归一化速度向量
  // 避免对角线移动速度过快
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    star.body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);