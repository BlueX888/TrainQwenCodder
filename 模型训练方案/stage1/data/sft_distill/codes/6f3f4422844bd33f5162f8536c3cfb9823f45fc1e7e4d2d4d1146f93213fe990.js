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
  scene: { preload, create, update }
};

let hexagon;

function preload() {
  // 使用 Graphics 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 计算六边形的顶点（中心在 32,32，半径 30）
  const radius = 30;
  const centerX = 32;
  const centerY = 32;
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制六边形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  
  // 清理 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建带物理属性的六边形精灵
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置世界边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 设置初始速度（随机方向，速度为360）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 360);
  hexagon.setVelocity(velocity.x, velocity.y);
}

function update(time, delta) {
  // 保持速度恒定为360
  const currentVelocity = hexagon.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度不是360，进行归一化并重新设置
  if (Math.abs(currentSpeed - 360) > 0.1) {
    const normalizedX = (currentVelocity.x / currentSpeed) * 360;
    const normalizedY = (currentVelocity.y / currentSpeed) * 360;
    hexagon.setVelocity(normalizedX, normalizedY);
  }
}

new Phaser.Game(config);