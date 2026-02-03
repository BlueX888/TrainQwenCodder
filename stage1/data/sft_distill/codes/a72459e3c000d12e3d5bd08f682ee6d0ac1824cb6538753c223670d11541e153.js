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
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成

  // 创建使用该纹理的 Sprite，放置在屏幕中央
  const rect = this.add.sprite(400, 300, 'rectTexture');
  rect.setOrigin(0.5, 0.5); // 设置中心点为矩形中心

  // 创建缩放动画
  this.tweens.add({
    targets: rect,
    scaleX: 0.48, // 缩放到 48%
    scaleY: 0.48,
    duration: 2000, // 2秒完成缩放
    yoyo: true, // 启用往返效果（缩放后恢复）
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut' // 使用平滑的缓动效果
  });

  // 添加文字说明
  this.add.text(400, 50, '矩形缩放动画（2秒缩放到48%，循环播放）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);