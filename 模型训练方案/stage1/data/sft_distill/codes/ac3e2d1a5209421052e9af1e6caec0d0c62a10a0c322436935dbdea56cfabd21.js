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
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制六边形
  const hexRadius = 40;
  const hexagonPath = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexagonPath.push(x, y);
  }
  
  graphics.fillPoints(hexagonPath, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（200速度，使用勾股定理分解到x和y方向）
  const speed = 200;
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = speed * Math.cos(Phaser.Math.DegToRad(angle));
  const velocityY = speed * Math.sin(Phaser.Math.DegToRad(angle));
  hexagon.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 可选：添加文字提示
  this.add.text(10, 10, '绿色六边形以200速度移动\n碰到边界时反弹', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

new Phaser.Game(config);