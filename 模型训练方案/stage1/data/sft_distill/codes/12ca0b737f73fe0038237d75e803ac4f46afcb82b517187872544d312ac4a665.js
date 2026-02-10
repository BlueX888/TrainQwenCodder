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
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 30;
  const hexCenterX = 40;
  const hexCenterY = 40;
  
  // 绘制六边形
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = hexCenterX + hexRadius * Math.cos(angle);
    const y = hexCenterY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 80, 80);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(
    Phaser.Math.Between(100, 700),
    Phaser.Math.Between(100, 500),
    'hexagon'
  );
  
  // 设置随机方向的速度，速率为360
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 360;
  const velocityY = Math.sin(angle) * 360;
  hexagon.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 确保世界边界启用碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);