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

let star;
let cursors;
const SPEED = 160;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制星形（中心点在 32, 32，半径 30）
  graphics.fillStar(32, 32, 5, 10, 30, 0);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵，放置在画布中心
  star = this.physics.add.sprite(400, 300, 'starTexture');
  
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
  
  // 如果同时按下两个方向键，进行对角线移动速度归一化
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    const velocityX = star.body.velocity.x;
    const velocityY = star.body.velocity.y;
    const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    if (magnitude > 0) {
      star.setVelocity(
        (velocityX / magnitude) * SPEED,
        (velocityY / magnitude) * SPEED
      );
    }
  }
}

// 启动游戏
new Phaser.Game(config);