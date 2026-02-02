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

  // 创建矩形精灵，放置在屏幕中央
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 添加文字说明
  this.add.text(400, 500, '矩形缩放动画 (2.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建缩放动画
  // yoyo: true 表示动画会反向播放（从 0.8 缩放回 1）
  // duration: 1250 表示单程耗时 1.25 秒，往返共 2.5 秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: rect,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1250,  // 单程时间 1.25 秒
    yoyo: true,      // 启用往返效果
    loop: -1,        // 无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
}

new Phaser.Game(config);