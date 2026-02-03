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
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 计算六边形的顶点坐标
  const hexRadius = 80; // 六边形外接圆半径
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = hexRadius + Math.cos(angle) * hexRadius;
    const y = hexRadius + Math.sin(angle) * hexRadius;
    hexPoints.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillPolygon(hexPoints);
  
  // 添加边框使六边形更明显
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokePolygon(hexPoints);
  
  // 生成纹理
  const textureSize = hexRadius * 2;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy();
  
  // 创建六边形精灵并居中显示
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  this.tweens.add({
    targets: hexSprite,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 1000, // 1秒
    yoyo: true, // 播放完后反向播放（恢复原始大小）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Hexagon scaling to 32% and back (looping)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);