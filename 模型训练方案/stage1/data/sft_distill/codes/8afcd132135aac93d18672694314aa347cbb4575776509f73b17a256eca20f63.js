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
  // 使用 Graphics 绘制青色椭圆
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制椭圆（中心点在 80, 60，宽度 160，高度 120）
  graphics.fillEllipse(80, 60, 160, 120);
  
  // 生成纹理
  graphics.generateTexture('ellipseTexture', 160, 120);
  
  // 清除 graphics 对象（已经生成纹理，不再需要）
  graphics.destroy();
  
  // 创建使用椭圆纹理的精灵，放置在屏幕中央
  const ellipseSprite = this.add.sprite(400, 300, 'ellipseTexture');
  
  // 创建闪烁动画（通过改变 alpha 透明度）
  this.tweens.add({
    targets: ellipseSprite,
    alpha: {
      from: 1,    // 从完全不透明
      to: 0       // 到完全透明
    },
    duration: 1000,  // 1秒变透明
    yoyo: true,      // 反向播放（透明后再变回不透明）
    repeat: -1,      // 无限循环
    ease: 'Sine.easeInOut'  // 使用正弦缓动，让闪烁更平滑
  });
  
  // 添加提示文字
  this.add.text(400, 500, '青色椭圆闪烁动画 (2秒一个循环)', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);