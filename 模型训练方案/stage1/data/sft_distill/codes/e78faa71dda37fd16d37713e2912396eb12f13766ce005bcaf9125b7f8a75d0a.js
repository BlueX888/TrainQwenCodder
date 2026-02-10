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

let hexagon;
let cursors;
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径30像素）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    hexPoints.push({ x, y });
  }
  
  // 绘制白色六边形
  graphics.fillStyle(0xffffff, 1);
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建带物理属性的六边形精灵
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置碰撞边界
  hexagon.setCollideWorldBounds(true);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  hexagon.setVelocity(0, 0);
  
  // 检测方向键输入并设置速度
  if (cursors.left.isDown) {
    hexagon.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    hexagon.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    hexagon.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    hexagon.setVelocityY(SPEED);
  }
  
  // 对角线移动时归一化速度，保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    hexagon.body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);