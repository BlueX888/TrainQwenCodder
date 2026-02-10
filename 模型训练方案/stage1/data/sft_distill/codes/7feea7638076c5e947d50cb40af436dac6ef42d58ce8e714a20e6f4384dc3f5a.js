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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();

  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建缩放动画
  // 单程 2 秒，yoyo 往返共 4 秒
  // 从原始大小（scale: 1）缩放到 24%（scale: 0.24）
  this.tweens.add({
    targets: circle,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 2000,      // 单程 2 秒
    yoyo: true,          // 启用往返效果
    loop: -1,            // 无限循环
    ease: 'Linear'       // 线性缓动
  });

  // 添加文本说明
  this.add.text(10, 10, 'Circle scaling to 24% in 4 seconds (loop)', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);