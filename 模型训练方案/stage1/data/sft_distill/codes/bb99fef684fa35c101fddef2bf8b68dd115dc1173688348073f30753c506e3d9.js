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
  // 使用 Graphics 绘制红色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制一个等边三角形（中心在原点）
  const triangleSize = 60;
  const height = triangleSize * Math.sqrt(3) / 2;
  
  graphics.beginPath();
  graphics.moveTo(0, -height * 2/3); // 顶点
  graphics.lineTo(-triangleSize / 2, height * 1/3); // 左下
  graphics.lineTo(triangleSize / 2, height * 1/3); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  const textureSize = 100;
  graphics.generateTexture('triangle', textureSize, textureSize);
  graphics.destroy();
  
  // 创建 Sprite 并放置在屏幕中央
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建旋转动画
  this.tweens.add({
    targets: triangle,
    rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
    duration: 4000, // 4 秒
    ease: 'Linear', // 线性缓动，保持匀速旋转
    repeat: -1 // 无限循环
  });
}

new Phaser.Game(config);