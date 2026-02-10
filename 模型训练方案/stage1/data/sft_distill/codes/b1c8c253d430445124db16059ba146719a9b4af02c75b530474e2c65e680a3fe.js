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

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建粉色六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点坐标（中心在64,64，半径50）
  const hexRadius = 50;
  const centerX = 64;
  const centerY = 64;
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    points.push({ x, y });
  }
  
  // 绘制粉色六边形
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 128, 128);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置随机方向的速度，总速度为240
  const angle = Math.random() * Math.PI * 2;
  const velocityX = Math.cos(angle) * 240;
  const velocityY = Math.sin(angle) * 240;
  hexagon.setVelocity(velocityX, velocityY);
  
  // 设置世界边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1，实现完美反弹
  hexagon.setBounce(1, 1);
}

function update(time, delta) {
  // 不需要每帧更新逻辑
}

new Phaser.Game(config);