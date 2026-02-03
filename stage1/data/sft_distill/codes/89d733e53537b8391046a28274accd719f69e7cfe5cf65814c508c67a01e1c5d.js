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
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制菱形（中心点在 64, 64，边长约 64）
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
  
  // 创建菱形精灵，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamond,
    scaleX: 0.32,  // 缩放到 32%
    scaleY: 0.32,
    duration: 500, // 0.5 秒
    yoyo: true,    // 来回播放（缩小后恢复）
    repeat: -1,    // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Diamond scaling animation (32% - 100%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);