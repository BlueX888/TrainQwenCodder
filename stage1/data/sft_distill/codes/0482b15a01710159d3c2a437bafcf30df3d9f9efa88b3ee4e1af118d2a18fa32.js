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
  // 使用 Graphics 绘制灰色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(25, 25, 50, 50); // 绘制椭圆（中心点，宽度，高度）
  
  // 生成纹理
  graphics.generateTexture('ellipse', 50, 50);
  graphics.destroy();
  
  // 创建带物理属性的玩家精灵
  player = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置玩家碰撞边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 根据方向键设置速度
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
      // 对角线移动时，将速度调整为 120 * sqrt(2)/2 ≈ 84.85
      // 保持总速度为 120
      const normalizedSpeed = 120 / Math.sqrt(2);
      player.setVelocity(
        player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }
  }
}

new Phaser.Game(config);