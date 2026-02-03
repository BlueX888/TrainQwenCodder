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
  // 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(100, 75, 200, 150); // 中心点(100, 75)，宽200，高150
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', 200, 150);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵，放置在屏幕中央
  const ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 创建缩放 Tween 动画
  this.tweens.add({
    targets: ellipse,
    scaleX: 0.48,  // 缩放到 48%
    scaleY: 0.48,
    duration: 2000,  // 2秒
    yoyo: true,      // 启用往返效果（缩小后恢复）
    loop: -1,        // 无限循环（-1 表示永久循环）
    ease: 'Linear'   // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, '椭圆缩放动画 (48% ↔ 100%)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);