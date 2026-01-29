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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形路径（中心点为原点）
  const size = 40;
  const diamond = new Phaser.Geom.Polygon([
    0, -size,      // 上顶点
    size, 0,       // 右顶点
    0, size,       // 下顶点
    -size, 0       // 左顶点
  ]);
  
  graphics.fillPoints(diamond.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamondSprite = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: diamondSprite,
    x: 700,                // 目标 x 坐标（从 100 到 700）
    duration: 1000,        // 持续时间 1 秒
    yoyo: true,            // 启用往返效果（到达终点后反向播放）
    repeat: -1,            // 无限循环（-1 表示永久重复）
    ease: 'Linear'         // 线性缓动函数，保持匀速运动
  });
}

new Phaser.Game(config);