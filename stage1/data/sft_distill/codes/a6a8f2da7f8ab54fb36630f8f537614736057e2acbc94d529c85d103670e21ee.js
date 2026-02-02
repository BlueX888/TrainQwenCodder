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
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectTexture', 150, 100);
  graphics.destroy();

  // 创建矩形精灵，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'rectTexture');
  rect.setOrigin(0.5, 0.5);

  // 创建缩放动画
  // 从原始大小(1)缩放到80%(0.8)，然后返回原始大小
  // duration: 2500ms（2.5秒）完成一次完整的缩放循环（缩小+恢复）
  // yoyo: true 表示动画会自动反向播放（从0.8回到1）
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: rect,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1250, // 单程1.25秒，往返共2.5秒
    yoyo: true,     // 自动返回原始值
    loop: -1,       // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动使动画更平滑
  });

  // 添加文字说明
  this.add.text(400, 50, 'Rectangle Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  this.add.text(400, 550, 'Scaling to 80% and back in 2.5s, looping forever', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);