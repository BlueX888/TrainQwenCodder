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
  // 使用 Graphics 绘制橙色菱形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xFF8C00, 1);
  
  // 绘制菱形（中心点在 50, 50，边长约70像素）
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 上顶点
  graphics.lineTo(100, 50);    // 右顶点
  graphics.lineTo(50, 100);    // 下顶点
  graphics.lineTo(0, 50);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并居中显示
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建闪烁动画
  // 使用 Tween 控制 alpha 值：从1到0再到1，持续3秒，无限循环
  this.tweens.add({
    targets: diamond,
    alpha: {
      from: 1,
      to: 0
    },
    duration: 1500,  // 1.5秒变暗
    yoyo: true,      // 自动反向回到1（再1.5秒变亮）
    repeat: -1,      // 无限循环
    ease: 'Sine.easeInOut'  // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 500, '橙色菱形闪烁动画（3秒一次循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);