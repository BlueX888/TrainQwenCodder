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
  // 使用 Graphics 绘制方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('square', 100, 100);
  graphics.destroy();
  
  // 创建方块精灵并设置在屏幕中心
  const square = this.add.sprite(400, 300, 'square');
  
  // 创建缩放动画
  this.tweens.add({
    targets: square,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 1500, // 1.5秒
    yoyo: true, // 动画结束后反向播放回到原始状态
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 500, '方块缩放动画 (1.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);