const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 绘制菱形（四个顶点）
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置初始透明度为0（完全透明）
  diamond.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: diamond,
    alpha: 1,              // 目标透明度：完全不透明
    duration: 2000,        // 持续时间：2秒
    ease: 'Linear',        // 线性缓动
    yoyo: false,           // 不反向播放
    repeat: -1,            // 无限循环
    repeatDelay: 0         // 重复间隔为0
  });
}

new Phaser.Game(config);