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
  // 使用 Graphics 绘制白色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形（四个顶点）
  graphics.beginPath();
  graphics.moveTo(0, -30);  // 上顶点
  graphics.lineTo(30, 0);   // 右顶点
  graphics.lineTo(0, 30);   // 下顶点
  graphics.lineTo(-30, 0);  // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 60, 60);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在左侧
  const diamond = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画：从左到右移动，1秒完成，往返循环
  this.tweens.add({
    targets: diamond,
    x: 700,              // 目标 x 坐标（右侧）
    duration: 1000,      // 持续时间 1 秒
    yoyo: true,          // 往返效果
    loop: -1,            // 无限循环
    ease: 'Linear'       // 线性缓动
  });
}

new Phaser.Game(config);