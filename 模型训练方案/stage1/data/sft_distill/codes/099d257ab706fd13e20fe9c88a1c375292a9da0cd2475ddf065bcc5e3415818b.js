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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制菱形（四个顶点坐标）
  const size = 40;
  graphics.beginPath();
  graphics.moveTo(size, 0);        // 上顶点
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
  
  // 设置初始速度（80速度，沿对角线方向）
  diamond.setVelocity(80, 80);
  
  // 启用世界边界碰撞
  diamond.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  diamond.setBounce(1, 1);
  
  // 可选：添加文字说明
  this.add.text(10, 10, '黄色菱形以80速度移动并反弹', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);