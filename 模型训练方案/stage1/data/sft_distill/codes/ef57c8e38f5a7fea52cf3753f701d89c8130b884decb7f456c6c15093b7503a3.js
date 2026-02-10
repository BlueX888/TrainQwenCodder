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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制五角星
  // 中心点在 (32, 32)，半径为 30
  const centerX = 32;
  const centerY = 32;
  const outerRadius = 30;
  const innerRadius = 12;
  
  graphics.fillStar(centerX, centerY, 5, innerRadius, outerRadius, 0);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建带物理属性的星形精灵，放置在画布中心
  star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置碰撞世界边界
  star.setCollideWorldBounds(true);
  
  // 获取方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
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
  
  // 如果同时按下两个方向键，需要归一化速度向量
  // 保持对角线移动速度与单方向移动速度一致
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    star.body.velocity.normalize().scale(SPEED);
  }
}

// 启动游戏
new Phaser.Game(config);