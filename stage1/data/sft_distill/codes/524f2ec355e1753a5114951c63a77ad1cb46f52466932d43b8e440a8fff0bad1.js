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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点（半径为30）
  const radius = 30;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexagonPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillPolygon(hexagonPoints);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置速度（200速度，分解为x和y方向）
  // 使用45度角，速度分量为 200/√2 ≈ 141.4
  const speed = 200 / Math.sqrt(2);
  hexagon.setVelocity(speed, speed);
  
  // 设置反弹系数为1（完美弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 启用世界边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 添加说明文字
  this.add.text(10, 10, '绿色六边形以200速度移动\n碰到边界时反弹', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

new Phaser.Game(config);