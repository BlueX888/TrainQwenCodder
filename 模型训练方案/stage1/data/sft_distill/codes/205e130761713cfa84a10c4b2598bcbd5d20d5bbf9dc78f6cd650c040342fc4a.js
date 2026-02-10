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
  // 使用 Graphics 绘制白色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形（四个顶点坐标）
  const size = 60;
  graphics.beginPath();
  graphics.moveTo(size, 0);      // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形图像对象，放置在屏幕中心
  const diamond = this.add.image(400, 300, 'diamond');
  
  // 创建淡入淡出 Tween 动画
  this.tweens.add({
    targets: diamond,
    alpha: 0,              // 目标透明度为 0（完全透明）
    duration: 750,         // 单程时长 0.75 秒
    yoyo: true,            // 启用往返效果（淡出后淡入）
    repeat: -1,            // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动函数使动画更平滑
  });
}

new Phaser.Game(config);