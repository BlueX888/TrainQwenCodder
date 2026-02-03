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
  // 使用 Graphics 绘制蓝色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  
  // 绘制菱形（四个顶点坐标）
  const size = 40;
  graphics.beginPath();
  graphics.moveTo(size, 0);        // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象，初始位置在左侧
  const diamond = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画：4秒内从左移动到右，然后往返循环
  this.tweens.add({
    targets: diamond,
    x: 700,              // 目标 x 坐标（右侧）
    duration: 4000,      // 持续时间 4 秒
    ease: 'Linear',      // 线性缓动
    yoyo: true,          // 启用往返（到达终点后反向播放）
    repeat: -1           // 无限循环（-1 表示永久重复）
  });
}

new Phaser.Game(config);