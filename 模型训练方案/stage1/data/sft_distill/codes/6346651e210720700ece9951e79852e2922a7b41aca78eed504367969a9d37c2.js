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

let player;
let cursors;

function preload() {
  // 使用 Graphics 创建橙色星形纹理
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFFA500, 1);
  
  // 绘制星形 (x, y, points, innerRadius, outerRadius)
  graphics.fillStar(32, 32, 5, 15, 30);
  
  // 生成纹理
  graphics.generateTexture('star', 64, 64);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建带物理效果的星形精灵
  player = this.physics.add.sprite(400, 300, 'star');
  
  // 设置碰撞世界边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-120);
  } else if (cursors.right.isDown) {
    player.setVelocityX(120);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-120);
  } else if (cursors.down.isDown) {
    player.setVelocityY(120);
  }
  
  // 处理对角线移动时的速度归一化
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      // 对角线移动时，调整速度使总速度保持120
      const normalizedSpeed = 120 / Math.sqrt(2);
      if (cursors.left.isDown) {
        player.setVelocityX(-normalizedSpeed);
      } else if (cursors.right.isDown) {
        player.setVelocityX(normalizedSpeed);
      }
      
      if (cursors.up.isDown) {
        player.setVelocityY(-normalizedSpeed);
      } else if (cursors.down.isDown) {
        player.setVelocityY(normalizedSpeed);
      }
    }
  }
}

// 启动游戏
new Phaser.Game(config);