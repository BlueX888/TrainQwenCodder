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
  // 使用 Graphics 绘制黄色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillEllipse(40, 40, 80, 60); // 在中心点 (40, 40) 绘制椭圆
  
  // 生成纹理
  graphics.generateTexture('yellowEllipse', 80, 80);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建使用椭圆纹理的 Sprite
  const ellipse = this.add.sprite(100, 300, 'yellowEllipse');
  
  // 创建补间动画
  this.tweens.add({
    targets: ellipse,        // 动画目标对象
    x: 700,                  // 目标 x 坐标（从左到右）
    duration: 1000,          // 持续时间 1 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 启用往返效果（到达终点后反向播放）
    loop: -1                 // 无限循环（-1 表示永久循环）
  });
}

new Phaser.Game(config);