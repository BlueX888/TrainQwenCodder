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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1); // 红色矩形
  graphics.fillRect(0, 0, 200, 150);
  graphics.generateTexture('rectTexture', 200, 150);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建矩形精灵，居中显示
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 设置初始透明度为 0（完全透明）
  rect.setAlpha(0);

  // 创建 Tween 动画：从透明到不透明循环播放
  this.tweens.add({
    targets: rect,           // 动画目标对象
    alpha: 1,                // 目标透明度：完全不透明
    duration: 1000,          // 持续时间：1秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 反向播放（不透明回到透明）
    repeat: -1               // 无限循环
  });

  // 添加提示文本
  this.add.text(400, 500, 'Rectangle fading in/out continuously', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);