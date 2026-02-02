const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  
  // 六边形参数
  const hexRadius = 60; // 六边形半径
  const centerX = hexRadius + 10; // 中心点（留出边距）
  const centerY = hexRadius + 10;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1); // 绿色填充
  graphics.lineStyle(3, 0xffffff, 1); // 白色边框
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算六边形的6个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度开始，确保顶点在上方
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
  graphics.strokePath();
  
  // 生成纹理
  const textureSize = (hexRadius + 10) * 2;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建六边形精灵并居中显示
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0（完全透明）
  hexagon.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: hexagon,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 500, // 持续时间 0.5 秒（500 毫秒）
    yoyo: true, // 往返播放（透明->不透明->透明）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加文字提示
  this.add.text(400, 500, '六边形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);