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
  // 使用 Graphics 绘制粉色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillEllipse(80, 60, 160, 120); // 椭圆中心(80,60)，宽160，高120
  
  // 生成纹理
  graphics.generateTexture('pinkEllipse', 160, 120);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建精灵对象放置在屏幕中央
  const ellipseSprite = this.add.sprite(400, 300, 'pinkEllipse');
  
  // 创建闪烁动画
  // 从完全可见(alpha=1) -> 完全透明(alpha=0) -> 完全可见(alpha=1)
  this.tweens.add({
    targets: ellipseSprite,
    alpha: { from: 1, to: 0 }, // 淡出
    duration: 1250, // 2.5秒的一半
    yoyo: true, // 自动反向播放（淡入）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加文字说明
  this.add.text(400, 500, '粉色椭圆闪烁动画 (2.5秒/周期)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);