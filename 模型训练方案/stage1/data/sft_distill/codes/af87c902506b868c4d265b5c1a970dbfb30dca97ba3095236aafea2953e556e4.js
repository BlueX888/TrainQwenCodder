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
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制菱形（四个点组成的多边形）
  const centerX = 50;
  const centerY = 50;
  const size = 40;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);      // 上顶点
  graphics.lineTo(centerX + size, centerY);      // 右顶点
  graphics.lineTo(centerX, centerY + size);      // 下顶点
  graphics.lineTo(centerX - size, centerY);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('diamond', 100, 100);
  
  // 销毁 Graphics 对象（已经生成纹理，不再需要）
  graphics.destroy();
  
  // 创建使用菱形纹理的精灵，放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0（完全透明）
  diamond.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，持续 3 秒，循环播放
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    alpha: 1,                   // 目标透明度值（完全不透明）
    duration: 3000,             // 持续时间 3 秒（3000 毫秒）
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 来回播放（透明->不透明->透明）
    repeat: -1                  // 无限循环（-1 表示永远重复）
  });
  
  // 添加提示文字
  this.add.text(400, 550, '菱形透明度循环动画（3秒周期）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);