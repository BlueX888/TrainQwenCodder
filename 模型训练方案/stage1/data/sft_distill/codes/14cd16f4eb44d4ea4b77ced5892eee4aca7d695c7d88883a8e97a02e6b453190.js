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
  // 使用 Graphics 创建红色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('redRect', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象，放置在屏幕中央
  const rect = this.add.sprite(400, 300, 'redRect');
  
  // 创建缩放动画
  // 从原始大小缩放到 1.5 倍，然后返回，持续 2 秒，无限循环
  this.tweens.add({
    targets: rect,
    scaleX: 1.5,
    scaleY: 1.5,
    duration: 1000, // 1秒放大
    yoyo: true,     // 动画结束后反向播放（缩回原大小）
    repeat: -1,     // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
}

new Phaser.Game(config);