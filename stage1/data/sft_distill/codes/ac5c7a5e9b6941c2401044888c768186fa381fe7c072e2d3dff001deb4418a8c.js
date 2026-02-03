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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制菱形（使用四个点构成的多边形）
  const size = 80;
  const centerX = size;
  const centerY = size;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size); // 上顶点
  graphics.lineTo(centerX + size, centerY); // 右顶点
  graphics.lineTo(centerX, centerY + size); // 下顶点
  graphics.lineTo(centerX - size, centerY); // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建使用菱形纹理的精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0
  diamond.setAlpha(0);
  
  // 创建渐变动画
  this.tweens.add({
    targets: diamond,
    alpha: 1, // 目标透明度为 1（完全不透明）
    duration: 500, // 持续时间 0.5 秒
    yoyo: true, // 来回播放（从 0 到 1 再从 1 到 0）
    repeat: -1, // 无限循环
    ease: 'Linear' // 线性渐变
  });
}

new Phaser.Game(config);