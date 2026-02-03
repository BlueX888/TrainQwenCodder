const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制三角形（等腰三角形）
  // 参数：x1, y1, x2, y2, x3, y3
  graphics.fillTriangle(
    0, -30,    // 顶点（上）
    -25, 30,   // 左下角
    25, 30     // 右下角
  );
  
  // 设置初始位置在左侧
  graphics.setPosition(100, 300);
  
  // 创建补间动画
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 1500,              // 动画时长 1.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 启用往返效果（到达终点后反向播放）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);