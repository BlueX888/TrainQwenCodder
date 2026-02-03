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
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制椭圆（中心点在 0,0，宽度100，高度60）
  graphics.fillEllipse(0, 0, 100, 60);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('ellipseTexture', 100, 60);
  
  // 销毁 Graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用该纹理的精灵，放置在屏幕中心
  const ellipse = this.add.sprite(400, 300, 'ellipseTexture');
  
  // 创建缩放动画
  this.tweens.add({
    targets: ellipse,           // 动画目标对象
    scaleX: 1.5,                // X轴缩放到1.5倍
    scaleY: 1.5,                // Y轴缩放到1.5倍
    duration: 2000,             // 持续时间2秒
    ease: 'Sine.easeInOut',     // 缓动函数，使动画更平滑
    yoyo: true,                 // 悠悠球效果（放大后缩小）
    repeat: -1                  // 无限循环（-1表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Cyan Ellipse Scaling Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 1.0 → 1.5 → 1.0 (2 seconds loop)', {
    fontSize: '16px',
    color: '#00ffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);