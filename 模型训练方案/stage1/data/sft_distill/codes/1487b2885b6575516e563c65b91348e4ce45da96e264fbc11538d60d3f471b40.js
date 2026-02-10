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
  
  // 绘制菱形路径（中心点在 50, 50，大小为 80x80）
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
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入淡出效果，repeat -1 实现无限循环
  this.tweens.add({
    targets: diamond,
    alpha: 0,                    // 目标透明度为 0（完全透明）
    duration: 750,               // 单程时间 0.75 秒
    yoyo: true,                  // 启用 yoyo 效果（淡出后自动淡入）
    repeat: -1,                  // 无限循环
    ease: 'Sine.easeInOut'       // 使用正弦缓动函数使动画更平滑
  });
}

new Phaser.Game(config);