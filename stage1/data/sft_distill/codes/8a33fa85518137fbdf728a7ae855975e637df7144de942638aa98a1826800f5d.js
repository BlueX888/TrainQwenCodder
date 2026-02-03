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
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 计算六边形顶点（中心在32,32，半径30）
  const radius = 30;
  const centerX = 32;
  const centerY = 32;
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建带物理属性的六边形精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（随机方向，速度240）
  const angle = Math.random() * Math.PI * 2;
  const velocityX = Math.cos(angle) * 240;
  const velocityY = Math.sin(angle) * 240;
  hexagon.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 可选：添加轻微旋转效果
  hexagon.setAngularVelocity(50);
}

new Phaser.Game(config);