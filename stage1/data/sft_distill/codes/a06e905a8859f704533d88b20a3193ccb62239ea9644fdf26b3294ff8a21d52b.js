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
  // 使用 Graphics 绘制紫色菱形
  const graphics = this.add.graphics();
  
  // 设置紫色填充
  graphics.fillStyle(0x9932cc, 1);
  
  // 绘制菱形（中心点为 50, 50，大小为 100x100）
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
  
  // 创建菱形精灵并放置在屏幕中央
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建闪烁动画 Tween
  // 从完全不透明(alpha=1)到完全透明(alpha=0)再回到不透明
  this.tweens.add({
    targets: diamond,
    alpha: 0,              // 目标透明度为 0（完全透明）
    duration: 750,         // 单程持续 750ms
    yoyo: true,            // 往返效果（0->1->0）
    repeat: -1,            // 无限循环
    ease: 'Sine.easeInOut' // 平滑缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 500, '紫色菱形闪烁动画（1.5秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);