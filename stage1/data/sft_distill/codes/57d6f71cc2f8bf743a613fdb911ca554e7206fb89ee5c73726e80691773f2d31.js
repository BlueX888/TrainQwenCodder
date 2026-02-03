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
  // 创建 Graphics 对象绘制紫色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  
  // 绘制三角形（以中心点为基准，向上的等边三角形）
  graphics.fillTriangle(
    0, -30,    // 顶点
    -30, 30,   // 左下角
    30, 30     // 右下角
  );
  
  // 设置初始位置（左侧）
  graphics.x = 100;
  graphics.y = 300;
  
  // 创建补间动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 2000,              // 持续时间 2 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 往返效果（到达终点后反向播放）
    repeat: -1                   // 无限循环（-1 表示永远重复）
  });
}

// 启动游戏
new Phaser.Game(config);