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
  
  // 绘制菱形（中心点在 64, 64，边长约 100）
  graphics.beginPath();
  graphics.moveTo(64, 14);      // 上顶点
  graphics.lineTo(114, 64);     // 右顶点
  graphics.lineTo(64, 114);     // 下顶点
  graphics.lineTo(14, 64);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: diamond,
    scaleX: 0.24,           // 缩放到 24%
    scaleY: 0.24,           // 缩放到 24%
    duration: 2000,         // 单程 2 秒
    yoyo: true,             // 启用 yoyo 模式，自动恢复到原始大小
    loop: -1,               // 无限循环
    ease: 'Linear'          // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 550, '菱形缩放动画：4秒循环（2秒缩小 + 2秒恢复）', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);