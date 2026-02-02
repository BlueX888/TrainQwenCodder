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
  // 使用 Graphics 绘制白色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形（四个三角形组成）
  graphics.beginPath();
  graphics.moveTo(32, 0);      // 上顶点
  graphics.lineTo(64, 32);     // 右顶点
  graphics.lineTo(32, 64);     // 下顶点
  graphics.lineTo(0, 32);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在左侧
  const diamond = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画：从左到右，1秒完成，yoyo 往返，无限循环
  this.tweens.add({
    targets: diamond,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 1000,            // 持续时间 1 秒
    yoyo: true,                // 启用往返效果
    repeat: -1,                // 无限循环（-1 表示永远重复）
    ease: 'Linear'             // 线性缓动
  });
}

new Phaser.Game(config);