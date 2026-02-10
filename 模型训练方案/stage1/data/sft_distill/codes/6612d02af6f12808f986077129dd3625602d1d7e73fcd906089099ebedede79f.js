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
  // 创建紫色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（使用四个点连接）
  graphics.fillStyle(0x9932cc, 1); // 紫色
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
  // 创建菱形精灵并放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建闪烁动画
  // 使用 Tween 控制 alpha 值实现闪烁效果
  this.tweens.add({
    targets: diamond,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 750,      // 单程持续 750ms
    yoyo: true,         // 往返动画（0->1->0）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加文字说明
  this.add.text(400, 500, '紫色菱形闪烁动画 (1.5秒/次)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);