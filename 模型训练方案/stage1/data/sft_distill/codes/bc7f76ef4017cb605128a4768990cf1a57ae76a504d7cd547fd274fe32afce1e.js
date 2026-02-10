const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建使用该纹理的精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circleTexture');

  // 创建缩放动画
  this.tweens.add({
    targets: circle,
    scaleX: 0.64, // 缩放到 64%
    scaleY: 0.64,
    duration: 1500, // 1.5 秒
    yoyo: true, // 往返效果（缩小后再放大）
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });

  // 添加提示文本
  this.add.text(400, 550, 'Circle scaling to 64% and back (looping)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);