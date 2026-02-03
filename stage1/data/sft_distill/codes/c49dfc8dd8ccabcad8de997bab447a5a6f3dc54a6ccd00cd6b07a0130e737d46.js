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
  // 创建 Graphics 对象绘制菱形
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 绘制菱形（使用路径）
  const diamondSize = 50;
  graphics.beginPath();
  graphics.moveTo(0, -diamondSize); // 上顶点
  graphics.lineTo(diamondSize, 0);  // 右顶点
  graphics.lineTo(0, diamondSize);  // 下顶点
  graphics.lineTo(-diamondSize, 0); // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 设置初始位置（左侧）
  const startX = 100;
  const endX = 700;
  const centerY = 300;
  
  graphics.setPosition(startX, centerY);
  
  // 创建补间动画
  this.tweens.add({
    targets: graphics,
    x: endX,              // 目标 x 坐标（右侧）
    duration: 1500,       // 持续时间 1.5 秒
    ease: 'Linear',       // 线性缓动
    yoyo: true,           // 启用往返效果（到达终点后反向播放）
    repeat: -1            // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);