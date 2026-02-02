const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点在64,64，边长为64）
  graphics.beginPath();
  graphics.moveTo(64, 0);      // 上顶点
  graphics.lineTo(128, 64);    // 右顶点
  graphics.lineTo(64, 128);    // 下顶点
  graphics.lineTo(0, 64);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为0（完全透明）
  diamond.setAlpha(0);
  
  // 创建渐变动画：从透明(0)到不透明(1)，持续1.5秒，循环播放
  this.tweens.add({
    targets: diamond,
    alpha: 1,              // 目标透明度为1（完全不透明）
    duration: 1500,        // 持续时间1.5秒（1500毫秒）
    ease: 'Linear',        // 线性渐变
    yoyo: true,            // 来回播放（渐入后渐出）
    repeat: -1             // 无限循环（-1表示永久重复）
  });
}

new Phaser.Game(config);