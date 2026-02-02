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
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制菱形（中心点在 (50, 50)，边长约70像素）
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 上顶点
  graphics.lineTo(100, 50);    // 右顶点
  graphics.lineTo(50, 100);    // 下顶点
  graphics.lineTo(0, 50);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建使用菱形纹理的 Sprite，放置在屏幕中心
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: diamond,
    scaleX: 0.16,  // 缩放到 16%
    scaleY: 0.16,  // 缩放到 16%
    duration: 1250, // 单程 1.25 秒
    yoyo: true,     // 自动返回原始值
    repeat: -1,     // 无限循环
    ease: 'Linear'  // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Diamond scaling to 16% and back', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Loop Duration: 2.5 seconds (1.25s each way)', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);