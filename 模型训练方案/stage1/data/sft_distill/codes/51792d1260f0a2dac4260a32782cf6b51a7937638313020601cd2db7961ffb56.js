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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，边长约 80
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 90);      // 左下角
  graphics.lineTo(90, 90);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中央
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  // 从原始大小(1) -> 缩放到16%(0.16) -> 恢复到原始大小(1)
  this.tweens.add({
    targets: triangle,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 1250,  // 2.5秒的一半，缩小阶段
    yoyo: true,      // 自动反向播放（恢复阶段）
    repeat: -1,      // 无限循环
    ease: 'Sine.easeInOut'  // 平滑的缓动效果
  });
  
  // 添加说明文字
  this.add.text(400, 50, '三角形缩放动画 (2.5秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% ↔ 16%', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);