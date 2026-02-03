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
  // 使用 Graphics 绘制矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy();
  
  // 创建精灵对象，放置在屏幕中心
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 创建缩放动画
  this.tweens.add({
    targets: rect,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1500,  // 1.5秒
    yoyo: true,      // 动画结束后反向播放回到原始状态
    loop: -1,        // -1 表示无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
}

new Phaser.Game(config);