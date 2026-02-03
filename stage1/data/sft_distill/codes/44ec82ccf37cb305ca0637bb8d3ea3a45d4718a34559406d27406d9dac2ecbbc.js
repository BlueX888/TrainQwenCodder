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
  // 使用 Graphics 绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  
  // 绘制一个指向右的三角形
  // 中心点在 (25, 25)，三角形大小为 50x50
  graphics.fillTriangle(
    10, 40,  // 左下角
    10, 10,  // 左上角
    40, 25   // 右顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画：从左移动到右，往返循环
  this.tweens.add({
    targets: triangle,
    x: 700,              // 目标 x 坐标（右侧）
    duration: 1000,      // 持续时间 1 秒
    ease: 'Linear',      // 线性缓动
    yoyo: true,          // 启用往返效果（到达终点后反向播放）
    repeat: -1           // 无限循环（-1 表示永远重复）
  });
  
  // 添加提示文本
  this.add.text(400, 50, '蓝色三角形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);