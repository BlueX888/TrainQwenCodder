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
  // 使用 Graphics 绘制蓝色菱形
  const graphics = this.add.graphics();
  
  // 设置蓝色填充
  graphics.fillStyle(0x0088ff, 1);
  
  // 绘制菱形（四个顶点）
  // 中心点在 (30, 30)，菱形大小为 60x60
  graphics.beginPath();
  graphics.moveTo(30, 0);      // 上顶点
  graphics.lineTo(60, 30);     // 右顶点
  graphics.lineTo(30, 60);     // 下顶点
  graphics.lineTo(0, 30);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 60, 60);
  graphics.destroy();
  
  // 创建精灵对象，初始位置在左侧
  const diamond = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画
  this.tweens.add({
    targets: diamond,           // 动画目标对象
    x: 700,                     // 目标 x 坐标（右侧）
    duration: 2500,             // 持续时间 2.5 秒
    yoyo: true,                 // 往返效果（到达终点后反向回到起点）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Linear'              // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);