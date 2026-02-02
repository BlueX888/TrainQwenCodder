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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 200, 150);
  graphics.generateTexture('rectangleTexture', 200, 150);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建使用该纹理的图像对象，放置在屏幕中央
  const rectangle = this.add.image(400, 300, 'rectangleTexture');
  
  // 设置初始透明度为 0（完全透明）
  rectangle.setAlpha(0);

  // 创建补间动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: rectangle,           // 动画目标对象
    alpha: 1,                     // 目标透明度值（完全不透明）
    duration: 1000,               // 动画持续时间 1 秒
    ease: 'Linear',               // 线性缓动
    yoyo: false,                  // 不反向播放
    repeat: -1,                   // 无限循环（-1 表示永久重复）
    repeatDelay: 0                // 重复之间无延迟
  });

  // 添加提示文本
  this.add.text(400, 500, 'Rectangle fading in (looping)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);