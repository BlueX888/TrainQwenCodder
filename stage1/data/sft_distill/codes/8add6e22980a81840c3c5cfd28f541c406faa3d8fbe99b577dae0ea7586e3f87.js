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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，大小为 80x80
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 90);       // 左下角
  graphics.lineTo(90, 90);       // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置原点为中心，便于缩放
  triangle.setOrigin(0.5, 0.5);
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.32,           // 缩放到 32%
    scaleY: 0.32,           // 缩放到 32%
    duration: 2000,         // 单程 2 秒
    yoyo: true,             // 往返效果（缩小后再放大）
    loop: -1,               // 无限循环
    ease: 'Sine.easeInOut'  // 平滑的缓动效果
  });
  
  // 添加文字说明
  this.add.text(400, 500, '三角形 4 秒循环缩放动画\n(缩小到 32% 后恢复)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);