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
  // 不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形（正六边形，半径40）
  const hexRadius = 40;
  const centerX = 50;
  const centerY = 50;
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（160速度，斜向移动）
  const speed = 160;
  const angle = Phaser.Math.DegToRad(45); // 45度角
  hexagon.setVelocity(
    speed * Math.cos(angle),
    speed * Math.sin(angle)
  );
  
  // 设置边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 确保世界边界启用碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);