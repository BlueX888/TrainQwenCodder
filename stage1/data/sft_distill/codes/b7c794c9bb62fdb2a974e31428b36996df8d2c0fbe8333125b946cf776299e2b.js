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
    preload,
    create,
    update
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径为30）
  const radius = 30;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 每60度一个顶点，起始角度-30度
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    hexagonPoints.push({ x, y });
  }
  
  // 绘制粉色六边形
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  graphics.moveTo(hexagonPoints[0].x, hexagonPoints[0].y);
  for (let i = 1; i < hexagonPoints.length; i++) {
    graphics.lineTo(hexagonPoints[i].x, hexagonPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（斜向移动，总速度约为240）
  const speed = 240;
  const angle = Math.PI / 4; // 45度角
  hexagon.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 确保物理体大小与纹理匹配
  hexagon.body.setCircle(radius * 0.8); // 使用圆形碰撞体近似六边形
}

function update(time, delta) {
  // 每帧更新逻辑（本例中物理引擎自动处理移动和反弹）
}

new Phaser.Game(config);