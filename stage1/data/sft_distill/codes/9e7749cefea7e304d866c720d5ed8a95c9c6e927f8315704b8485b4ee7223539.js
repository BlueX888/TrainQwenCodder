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
  // 使用 Graphics 绘制红色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制一个等边三角形（中心在原点）
  const size = 60;
  const height = size * Math.sqrt(3) / 2;
  
  graphics.beginPath();
  graphics.moveTo(0, -height * 2/3);           // 顶点
  graphics.lineTo(-size / 2, height * 1/3);    // 左下角
  graphics.lineTo(size / 2, height * 1/3);     // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', size * 2, size * 2);
  graphics.destroy();
  
  // 创建三角形精灵并放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建旋转动画
  this.tweens.add({
    targets: triangle,
    rotation: Math.PI * 2,  // 旋转 360 度（2π 弧度）
    duration: 4000,         // 4 秒完成一次旋转
    repeat: -1,             // 无限循环
    ease: 'Linear'          // 线性缓动，保持匀速旋转
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Rotating Triangle', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);