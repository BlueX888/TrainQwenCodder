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
  // 使用 Graphics 绘制灰色菱形
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制菱形（四个顶点）
  const size = 40;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在左侧
  const diamond = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: diamond,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 1500,            // 持续时间 1.5 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 往返效果（到达终点后返回起点）
    loop: -1                   // 无限循环（-1 表示永久循环）
  });
}

new Phaser.Game(config);