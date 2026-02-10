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
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建使用该纹理的精灵对象，放置在屏幕中心
  const rectangle = this.add.sprite(400, 300, 'rectTexture');

  // 添加缩放补间动画
  this.tweens.add({
    targets: rectangle,
    scaleX: 0.32, // 缩放到 32%
    scaleY: 0.32,
    duration: 3000, // 3秒
    yoyo: true, // 动画结束后反向播放（恢复原始大小）
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });

  // 添加提示文本
  this.add.text(400, 50, '矩形缩放动画 (循环播放)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, '缩放范围: 100% ↔ 32%', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);