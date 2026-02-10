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
  // 方法1: 使用 Graphics 绘制椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色椭圆
  graphics.fillEllipse(0, 0, 150, 100); // 以中心点绘制椭圆
  
  // 生成纹理并创建精灵
  graphics.generateTexture('ellipseTex', 150, 100);
  graphics.destroy(); // 销毁 graphics 对象
  
  const ellipse = this.add.sprite(400, 300, 'ellipseTex');
  ellipse.alpha = 0; // 初始完全透明
  
  // 创建渐变动画：从透明(0)到不透明(1)
  this.tweens.add({
    targets: ellipse,
    alpha: 1, // 目标透明度
    duration: 1500, // 1.5秒
    ease: 'Linear', // 线性渐变
    repeat: -1, // 无限循环
    yoyo: true // 来回循环（透明->不透明->透明）
  });
  
  // 方法2: 直接使用 Ellipse GameObject（更简洁）
  // 注释掉上面的代码，取消下面注释即可使用
  /*
  const ellipse2 = this.add.ellipse(400, 300, 150, 100, 0x00ff00);
  ellipse2.alpha = 0;
  
  this.tweens.add({
    targets: ellipse2,
    alpha: 1,
    duration: 1500,
    ease: 'Linear',
    repeat: -1,
    yoyo: true
  });
  */
}

new Phaser.Game(config);