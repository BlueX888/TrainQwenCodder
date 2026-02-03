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
  // 使用 Graphics 创建红色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('redRect', 100, 100);
  graphics.destroy();
  
  // 在屏幕中央创建红色矩形图像
  const rect = this.add.image(400, 300, 'redRect');
  
  // 创建缩放动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    scale: 1.5,              // 缩放到 1.5 倍
    duration: 1000,          // 单程持续 1 秒
    yoyo: true,              // 启用往返效果（放大后缩小）
    repeat: -1,              // 无限循环 (-1 表示永久重复)
    ease: 'Sine.easeInOut'   // 使用正弦缓动函数使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 500, '红色矩形缩放动画 (2秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);