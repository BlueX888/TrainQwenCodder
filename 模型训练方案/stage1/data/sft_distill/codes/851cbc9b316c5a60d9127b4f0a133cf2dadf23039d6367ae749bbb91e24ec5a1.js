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
  // 使用 Graphics 绘制橙色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6600, 1); // 橙色
  graphics.fillRect(0, 0, 200, 150);
  graphics.generateTexture('orangeRect', 200, 150);
  graphics.destroy();

  // 创建使用该纹理的 Sprite，放置在屏幕中央
  const rect = this.add.sprite(400, 300, 'orangeRect');
  
  // 设置初始 alpha 为 0（完全透明）
  rect.setAlpha(0);

  // 创建淡入淡出动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    alpha: 1,                // 目标 alpha 值（完全不透明）
    duration: 500,           // 持续时间 500ms（0.5 秒）
    yoyo: true,              // 启用 yoyo 模式，动画会反向播放（1 -> 0）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 线性缓动函数，匀速变化
  });

  // 添加提示文本
  this.add.text(400, 500, 'Orange rectangle fading in/out every 0.5s', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);