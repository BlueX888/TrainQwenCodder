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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制菱形（使用路径）
  // 菱形中心点在 (0, 0)，边长约 50 像素
  const diamond = new Phaser.Geom.Polygon([
    0, -30,    // 上顶点
    30, 0,     // 右顶点
    0, 30,     // 下顶点
    -30, 0     // 左顶点
  ]);
  
  graphics.fillPoints(diamond.points, true);
  
  // 将菱形初始位置设置在左侧
  graphics.x = 100;
  graphics.y = 300;
  
  // 创建补间动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 1500,              // 持续时间 1.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 启用往返效果（到达终点后反向回到起点）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);