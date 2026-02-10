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
  
  // 设置菱形填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（中心点在 50, 50）
  const size = 50;
  graphics.beginPath();
  graphics.moveTo(50, 0);           // 上顶点
  graphics.lineTo(100, 50);         // 右顶点
  graphics.lineTo(50, 100);         // 下顶点
  graphics.lineTo(0, 50);           // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy();
  
  // 创建菱形精灵并放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放动画
  this.tweens.add({
    targets: diamond,
    scaleX: 0.24,        // 缩放到 24%
    scaleY: 0.24,        // 缩放到 24%
    duration: 1500,      // 1.5 秒
    yoyo: true,          // 动画结束后反向播放（恢复）
    loop: -1,            // 无限循环
    ease: 'Linear'       // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Diamond scaling to 24% and back (Loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);