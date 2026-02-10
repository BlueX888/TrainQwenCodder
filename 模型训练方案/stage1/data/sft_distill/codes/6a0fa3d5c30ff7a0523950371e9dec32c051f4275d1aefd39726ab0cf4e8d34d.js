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
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 50); // 半径为 50 的圆形
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy();

  // 创建圆形精灵并放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circleTexture');

  // 创建缩放动画
  // 从原始大小 (scale: 1) 缩放到 16% (scale: 0.16)
  // duration: 1500ms (1.5秒)
  // yoyo: true 表示动画完成后反向播放（恢复到原始大小）
  // loop: -1 表示无限循环
  // ease: 'Sine.easeInOut' 使动画更流畅
  this.tweens.add({
    targets: circle,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 1500,
    yoyo: true,
    loop: -1,
    ease: 'Sine.easeInOut'
  });

  // 添加文本说明
  this.add.text(400, 50, 'Circle Scale Animation\n(1.0 → 0.16 → 1.0)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);