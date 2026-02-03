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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 Graphics 对象

  // 创建使用该纹理的 Sprite，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'rectTexture');

  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    scaleX: 0.8,            // X 轴缩放到 80%
    scaleY: 0.8,            // Y 轴缩放到 80%
    duration: 500,          // 持续时间 0.5 秒（500 毫秒）
    yoyo: true,             // 动画结束后反向播放（恢复到原始大小）
    repeat: -1,             // 无限循环（-1 表示永久重复）
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });

  // 添加提示文本
  this.add.text(400, 50, '矩形循环缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);