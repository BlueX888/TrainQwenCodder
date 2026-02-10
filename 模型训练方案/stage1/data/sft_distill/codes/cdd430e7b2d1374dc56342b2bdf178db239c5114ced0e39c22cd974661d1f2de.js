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
  
  // 六边形参数
  const hexRadius = 80;
  const centerX = 100;
  const centerY = 100;
  
  // 绘制六边形（6个顶点）
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
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
  
  // 生成纹理
  graphics.generateTexture('hexagon', 200, 200);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建使用六边形纹理的精灵，初始透明度为 0
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  hexSprite.setAlpha(0);
  
  // 创建渐变动画：从透明(0)到不透明(1)，持续1秒，循环播放
  this.tweens.add({
    targets: hexSprite,
    alpha: 1,              // 目标透明度
    duration: 1000,        // 持续时间 1 秒
    ease: 'Linear',        // 线性缓动
    yoyo: true,            // 来回播放（1->0->1）
    repeat: -1             // 无限循环
  });
}

new Phaser.Game(config);