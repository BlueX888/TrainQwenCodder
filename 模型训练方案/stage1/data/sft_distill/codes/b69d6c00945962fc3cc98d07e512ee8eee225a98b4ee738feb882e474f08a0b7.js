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
  // 创建 Graphics 对象用于绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充颜色（蓝色）
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心点在画布中央，宽度 200，高度 120）
  const centerX = 400;
  const centerY = 300;
  const radiusX = 100;
  const radiusY = 60;
  
  graphics.fillEllipse(centerX, centerY, radiusX, radiusY);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: graphics,
    alpha: 1,              // 目标透明度为 1（完全不透明）
    duration: 4000,        // 持续时间 4 秒
    ease: 'Linear',        // 线性渐变
    yoyo: true,            // 往返播放（不透明后再变回透明）
    repeat: -1             // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 50, '椭圆透明度循环动画', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '4秒渐变：透明 → 不透明 → 透明（循环）', {
    fontSize: '16px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

new Phaser.Game(config);