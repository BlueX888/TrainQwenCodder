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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff88, 1);
  
  // 绘制菱形（中心点在 64, 64，边长约 100）
  const centerX = 64;
  const centerY = 64;
  const size = 50;
  
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);        // 上顶点
  graphics.lineTo(centerX + size, centerY);        // 右顶点
  graphics.lineTo(centerX, centerY + size);        // 下顶点
  graphics.lineTo(centerX - size, centerY);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  graphics.destroy();
  
  // 创建菱形精灵并放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  // 4秒完成一个完整循环：2秒缩小到24%，2秒恢复到100%
  this.tweens.add({
    targets: diamond,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 2000,        // 2秒缩小
    ease: 'Linear',
    yoyo: true,            // 自动反向播放（恢复原始大小）
    repeat: -1             // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, '菱形缩放动画：1.0 -> 0.24 -> 1.0 (循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);