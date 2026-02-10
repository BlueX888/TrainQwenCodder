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
  // 使用 Graphics 绘制白色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制星形 (x, y, points, innerRadius, outerRadius)
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'starTexture');
  
  // 创建补间动画：从左到右，2秒，往返循环
  this.tweens.add({
    targets: star,
    x: 700,              // 目标 x 坐标（右侧）
    duration: 2000,      // 持续时间 2 秒
    yoyo: true,          // 启用往返效果
    repeat: -1,          // 无限循环 (-1 表示永远重复)
    ease: 'Linear'       // 线性缓动，匀速移动
  });
}

new Phaser.Game(config);