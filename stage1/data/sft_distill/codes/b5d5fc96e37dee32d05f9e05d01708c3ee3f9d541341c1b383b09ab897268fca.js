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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillCircle(50, 50, 50); // 半径50的圆形
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 创建缩放动画
  this.tweens.add({
    targets: circle,
    scaleX: 0.64,  // 缩放到 64%
    scaleY: 0.64,  // 缩放到 64%
    duration: 1500, // 1.5 秒
    yoyo: true,     // 动画结束后反向播放（恢复原始大小）
    loop: -1,       // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
}

new Phaser.Game(config);