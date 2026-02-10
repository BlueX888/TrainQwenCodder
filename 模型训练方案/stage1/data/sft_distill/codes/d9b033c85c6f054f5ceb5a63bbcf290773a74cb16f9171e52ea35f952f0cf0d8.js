const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建三角形纹理
  const graphics = this.add.graphics();
  
  // 绘制三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 顶点
  graphics.lineTo(100, 100);   // 右下
  graphics.lineTo(0, 100);     // 左下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.24,        // 缩放到 24%
    scaleY: 0.24,        // 缩放到 24%
    duration: 2000,      // 2 秒
    yoyo: true,          // 自动恢复到原始值
    loop: -1,            // 无限循环
    ease: 'Sine.easeInOut'  // 平滑的缓动效果
  });
  
  // 添加文本说明
  this.add.text(400, 50, 'Triangle scaling to 24% and back (2s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);