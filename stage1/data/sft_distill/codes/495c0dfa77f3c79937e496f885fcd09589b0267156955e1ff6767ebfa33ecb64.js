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
const SPEED = 120;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色六边形
  const graphics = this.add.graphics();
  
  // 设置白色填充
  graphics.fillStyle(0xffffff, 1);
  
  // 计算六边形的顶点（半径为30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    hexPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建玩家精灵（在画布中心）
  player = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置碰撞世界边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键监听
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
  
  // 如果同时按下两个方向键，标准化速度向量以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);