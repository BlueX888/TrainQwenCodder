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

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制紫色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9933ff, 1); // 紫色
  
  // 绘制星形（5个角）
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 18;
  const points = 5;
  
  graphics.beginPath();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  this.star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（斜向移动，速度为160）
  // 使用勾股定理：vx² + vy² = 160²
  // 让它以45度角移动：vx = vy = 160 / √2 ≈ 113
  const velocity = 160 / Math.sqrt(2);
  this.star.setVelocity(velocity, velocity);
  
  // 设置世界边界碰撞
  this.star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  this.star.setBounce(1, 1);
}

function update(time, delta) {
  // 游戏逻辑更新（本例中不需要额外逻辑）
}

new Phaser.Game(config);