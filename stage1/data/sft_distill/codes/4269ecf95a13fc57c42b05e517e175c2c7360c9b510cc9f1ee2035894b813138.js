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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制菱形（四个顶点）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(size, 0);      // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建物理精灵
  const diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置初始速度（随机方向，速度为300）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 300;
  const velocityY = Math.sin(angle * Math.PI / 180) * 300;
  diamond.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  diamond.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  diamond.setBounce(1, 1);
  
  // 设置物理体大小以匹配菱形（使用圆形物理体更适合菱形）
  diamond.body.setCircle(25);
}

new Phaser.Game(config);