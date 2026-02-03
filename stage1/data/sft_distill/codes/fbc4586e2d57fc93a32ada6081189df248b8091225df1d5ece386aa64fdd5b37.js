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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点在 64, 64）
  const size = 64;
  graphics.beginPath();
  graphics.moveTo(size, 0);           // 上顶点
  graphics.lineTo(size * 2, size);    // 右顶点
  graphics.lineTo(size, size * 2);    // 下顶点
  graphics.lineTo(0, size);           // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamond,
    scaleX: 0.16,        // 缩放到 16%
    scaleY: 0.16,        // 缩放到 16%
    duration: 1500,      // 1.5 秒
    yoyo: true,          // 自动反向播放（恢复到原始大小）
    repeat: -1,          // 无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Diamond Scaling Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% → 16% → 100% (Loop)', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);