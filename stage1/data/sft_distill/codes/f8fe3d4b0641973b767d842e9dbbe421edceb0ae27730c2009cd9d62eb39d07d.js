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
  
  // 计算六边形的顶点坐标
  const hexRadius = 80; // 六边形半径
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = hexRadius + hexRadius * Math.cos(angle);
    const y = hexRadius + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.fillPolygon(hexPoints);
  
  // 绘制边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePolygon(hexPoints);
  
  // 生成纹理
  const textureSize = hexRadius * 2;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 Graphics 对象，纹理已生成
  
  // 创建六边形精灵并居中显示
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  this.tweens.add({
    targets: hexSprite,
    scaleX: 0.32, // 缩放到 32%
    scaleY: 0.32,
    duration: 3000, // 3秒
    yoyo: true, // 动画结束后反向播放（恢复原始大小）
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 550, '六边形缩放动画（3秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);