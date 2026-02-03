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
  
  // 设置六边形参数
  const hexRadius = 80; // 六边形半径
  const centerX = 100; // 绘制中心点
  const centerY = 100;
  
  // 绘制六边形
  graphics.fillStyle(0x00aaff, 1);
  graphics.beginPath();
  
  // 计算六边形的六个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
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
  
  // 添加描边
  graphics.lineStyle(4, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  const textureSize = hexRadius * 2 + 20;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  graphics.destroy(); // 销毁 graphics 对象
  
  // 创建精灵对象
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放动画
  this.tweens.add({
    targets: hexSprite,
    scaleX: 0.64,
    scaleY: 0.64,
    duration: 1500, // 1.5秒
    yoyo: true, // 自动恢复到原始值
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Hexagon scaling: 100% → 64% → 100%', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);