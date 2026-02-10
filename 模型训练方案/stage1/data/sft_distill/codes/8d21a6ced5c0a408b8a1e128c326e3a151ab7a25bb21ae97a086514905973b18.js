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
  // 使用 Graphics 绘制白色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-26, 15);     // 左下角
  graphics.lineTo(26, 15);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('triangle', 52, 45);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: triangle,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 3000,            // 持续时间 3 秒
    yoyo: true,                // 启用往返效果（到达终点后返回起点）
    repeat: -1,                // 无限循环（-1 表示永远重复）
    ease: 'Linear'             // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);