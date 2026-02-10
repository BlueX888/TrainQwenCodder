const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点为 50, 50，尺寸 100x100）
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 顶点
  graphics.lineTo(100, 50);    // 右点
  graphics.lineTo(50, 100);    // 底点
  graphics.lineTo(0, 50);      // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为 0
  diamond.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: diamond,
    alpha: 1,              // 目标透明度为 1（完全不透明）
    duration: 1500,        // 持续时间 1.5 秒
    ease: 'Linear',        // 线性缓动
    yoyo: true,            // 来回播放（透明->不透明->透明）
    repeat: -1             // 无限循环
  });
}

new Phaser.Game(config);