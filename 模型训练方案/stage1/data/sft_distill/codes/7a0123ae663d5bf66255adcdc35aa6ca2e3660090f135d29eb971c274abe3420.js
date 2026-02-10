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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillEllipse(60, 40, 120, 80); // 在中心绘制椭圆
  
  // 生成纹理
  graphics.generateTexture('ellipse', 120, 80);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵并居中显示
  const ellipse = this.add.sprite(400, 300, 'ellipse');
  
  // 创建抖动动画效果
  // 抖动效果：快速左右移动产生震动感
  this.tweens.add({
    targets: ellipse,
    x: '+=10', // 向右移动10像素
    duration: 50, // 每次移动50毫秒
    yoyo: true, // 来回移动
    repeat: 19, // 重复19次（加上初始1次 = 20次往返 = 2000ms）
    ease: 'Linear',
    loop: -1 // 无限循环
  });
  
  // 可选：添加文字说明
  this.add.text(400, 500, '橙色椭圆抖动动画（2秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);