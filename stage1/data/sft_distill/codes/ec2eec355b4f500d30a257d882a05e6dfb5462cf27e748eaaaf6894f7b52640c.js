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
  // 使用 Graphics 绘制灰色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(0, -30);      // 顶点
  graphics.lineTo(-30, 30);     // 左下角
  graphics.lineTo(30, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左移动到右，2秒完成，往返循环
  this.tweens.add({
    targets: triangle,
    x: 700,                    // 目标 x 坐标（右侧）
    duration: 2000,            // 持续时间 2 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返（到达终点后反向播放）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);