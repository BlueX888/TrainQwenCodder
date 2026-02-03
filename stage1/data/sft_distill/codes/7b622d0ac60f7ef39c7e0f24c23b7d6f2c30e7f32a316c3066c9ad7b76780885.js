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
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  
  // 绘制一个指向上方的三角形（以中心为原点）
  graphics.fillTriangle(
    0, -20,    // 顶点（上）
    -15, 20,   // 左下角
    15, 20     // 右下角
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 30, 40);
  graphics.destroy();
  
  // 创建物理精灵对象，初始位置在画布中心
  player = this.physics.add.sprite(400, 300, 'triangle');
  
  // 设置碰撞边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(SPEED);
  }
  
  // 对角线移动时归一化速度（保持速度恒定）
  if (cursors.left.isDown || cursors.right.isDown) {
    if (cursors.up.isDown || cursors.down.isDown) {
      player.body.velocity.normalize().scale(SPEED);
    }
  }
  
  // 额外的边界限制（虽然已经设置了 collideWorldBounds）
  player.x = Phaser.Math.Clamp(player.x, 15, 785);
  player.y = Phaser.Math.Clamp(player.y, 20, 580);
}

// 启动游戏
new Phaser.Game(config);