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
  const hexRadius = 60;
  const centerX = hexRadius;
  const centerY = hexRadius;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  graphics.beginPath();
  
  // 绘制六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每60度一个顶点
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
  const textureSize = hexRadius * 2;
  graphics.generateTexture('hexagon', textureSize, textureSize);
  
  // 清除 graphics 对象（已生成纹理，不再需要）
  graphics.destroy();
  
  // 创建使用六边形纹理的 Sprite
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: hexSprite,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 2500,        // 2.5 秒
    yoyo: true,            // 自动恢复到原始值
    loop: -1,              // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Hexagon scaling animation (48% - 100%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);