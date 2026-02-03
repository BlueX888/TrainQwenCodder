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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const size = 30;
  const centerX = size;
  const centerY = size;
  
  // 绘制六边形（6个顶点）
  graphics.fillStyle(0xffffff, 1);
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', size * 2, size * 2);
  graphics.destroy();
  
  // 创建带物理属性的六边形精灵
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 200;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 200;
  
  hexagon.setVelocity(velocityX, velocityY);
  
  // 设置碰撞边界
  hexagon.setCollideWorldBounds(true);
  hexagon.setBounce(1, 1); // 完全弹性碰撞
}

function update(time, delta) {
  // 检测边界碰撞并反弹（物理引擎的 bounce 已处理，但这里添加额外检测以确保）
  const bounds = hexagon.getBounds();
  
  // 左右边界检测
  if (bounds.left <= 0 && hexagon.body.velocity.x < 0) {
    hexagon.body.velocity.x *= -1;
  } else if (bounds.right >= config.width && hexagon.body.velocity.x > 0) {
    hexagon.body.velocity.x *= -1;
  }
  
  // 上下边界检测
  if (bounds.top <= 0 && hexagon.body.velocity.y < 0) {
    hexagon.body.velocity.y *= -1;
  } else if (bounds.bottom >= config.height && hexagon.body.velocity.y > 0) {
    hexagon.body.velocity.y *= -1;
  }
  
  // 保持速度恒定为200
  const currentSpeed = Math.sqrt(
    hexagon.body.velocity.x ** 2 + hexagon.body.velocity.y ** 2
  );
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - 200) > 1) {
    hexagon.body.velocity.x = (hexagon.body.velocity.x / currentSpeed) * 200;
    hexagon.body.velocity.y = (hexagon.body.velocity.y / currentSpeed) * 200;
  }
}

new Phaser.Game(config);