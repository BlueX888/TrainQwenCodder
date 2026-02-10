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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点为 64, 64，边长约 100）
  graphics.beginPath();
  graphics.moveTo(64, 14);      // 上顶点
  graphics.lineTo(114, 64);     // 右顶点
  graphics.lineTo(64, 114);     // 下顶点
  graphics.lineTo(14, 64);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建菱形精灵并放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0（完全透明）
  diamond.setAlpha(0);
  
  // 创建渐变动画：从透明到不透明，持续 2 秒，循环播放
  this.tweens.add({
    targets: diamond,           // 目标对象
    alpha: 1,                   // 目标透明度（完全不透明）
    duration: 2000,             // 持续时间 2 秒
    ease: 'Linear',             // 线性渐变
    yoyo: true,                 // 来回播放（透明->不透明->透明）
    repeat: -1                  // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);