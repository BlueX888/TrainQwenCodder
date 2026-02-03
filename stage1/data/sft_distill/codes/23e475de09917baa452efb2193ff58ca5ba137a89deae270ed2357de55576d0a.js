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
  }
};

let player;
let cursors;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFC0CB, 1); // 粉色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  
  // 生成纹理
  graphics.generateTexture('pinkCircle', 50, 50);
  graphics.destroy();
  
  // 创建物理精灵，放置在画布中心
  player = this.physics.add.sprite(400, 300, 'pinkCircle');
  
  // 设置精灵碰撞世界边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
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
  
  // 如果同时按下两个方向键，需要归一化速度向量
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    // 计算对角线速度，保持总速度为120
    const diagonalSpeed = 120 / Math.sqrt(2);
    
    if (cursors.left.isDown) {
      player.setVelocityX(-diagonalSpeed);
    } else if (cursors.right.isDown) {
      player.setVelocityX(diagonalSpeed);
    }
    
    if (cursors.up.isDown) {
      player.setVelocityY(-diagonalSpeed);
    } else if (cursors.down.isDown) {
      player.setVelocityY(diagonalSpeed);
    }
  }
}

new Phaser.Game(config);