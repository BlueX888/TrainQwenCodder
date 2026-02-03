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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);

  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 1500,            // 持续时间 1.5 秒（1500 毫秒）
    yoyo: true,                // 启用 yoyo 效果（到达终点后反向播放）
    repeat: -1,                // 无限循环（-1 表示永久重复）
    ease: 'Linear'             // 线性缓动函数，匀速变化
  });
}

new Phaser.Game(config);