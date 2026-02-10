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
  // 创建 Graphics 对象绘制粉色三角形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制三角形（使用三个顶点）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-25, 30);     // 左下角
  graphics.lineTo(25, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 设置初始位置（左侧，垂直居中）
  graphics.x = 100;
  graphics.y = 300;
  
  // 创建补间动画：从左到右移动，4秒完成，往返循环
  this.tweens.add({
    targets: graphics,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 4000,            // 持续时间 4 秒
    yoyo: true,                // 启用往返效果（到达终点后反向返回）
    repeat: -1,                // 无限循环（-1 表示永久重复）
    ease: 'Linear'             // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);