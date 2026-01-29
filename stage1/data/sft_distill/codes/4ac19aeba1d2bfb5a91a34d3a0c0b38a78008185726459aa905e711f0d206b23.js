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
  // 使用 Graphics 绘制一个圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  
  // 生成纹理
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用该纹理的精灵对象，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);
  
  // 创建 Tween 动画：从透明（alpha: 0）渐变到不透明（alpha: 1）
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 1,                  // 目标透明度值
    duration: 4000,            // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',            // 线性缓动
    loop: -1,                  // 无限循环（-1 表示永久循环）
    yoyo: false                // 不使用往返效果，只从 0 到 1 循环
  });
  
  // 添加文本提示
  this.add.text(400, 500, '圆形从透明到不透明循环播放（4秒/次）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);