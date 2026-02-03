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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circle', 100, 100); // 生成 100x100 的纹理
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建使用该纹理的 Sprite，放置在屏幕中央
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);

  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 1500,            // 动画持续时间 1.5 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 反向播放（不透明回到透明）
    repeat: -1                 // 无限循环播放
  });

  // 添加文字说明
  this.add.text(400, 500, '圆形透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);