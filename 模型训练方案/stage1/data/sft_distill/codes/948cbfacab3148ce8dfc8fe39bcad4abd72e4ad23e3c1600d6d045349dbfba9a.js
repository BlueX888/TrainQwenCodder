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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillEllipse(40, 40, 80, 60); // 绘制椭圆 (中心x, 中心y, 宽度, 高度)
  graphics.generateTexture('ellipse', 80, 80);
  graphics.destroy();

  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置精灵的碰撞边界，使其不能移出画布
  player.setCollideWorldBounds(true);
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  }
  
  // 处理对角线移动时的速度归一化
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      // 对角线移动时，将速度调整为 160 * sqrt(2)/2 ≈ 113.137
      const velocityX = player.body.velocity.x;
      const velocityY = player.body.velocity.y;
      const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (magnitude > 0) {
        player.setVelocity(
          (velocityX / magnitude) * 160,
          (velocityY / magnitude) * 160
        );
      }
    }
  }
}

new Phaser.Game(config);