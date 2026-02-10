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
  // 使用 Graphics 绘制青色三角形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制三角形（以中心为原点）
  graphics.beginPath();
  graphics.moveTo(0, -40);      // 顶点
  graphics.lineTo(-35, 30);     // 左下角
  graphics.lineTo(35, 30);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 70, 70);
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建旋转动画
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    rotation: Math.PI * 2,       // 旋转到 360 度（2π 弧度）
    duration: 1000,              // 持续时间 1 秒
    ease: 'Linear',              // 线性缓动，保持匀速旋转
    loop: -1,                    // 无限循环（-1 表示永久循环）
    repeat: 0                    // 不需要额外重复
  });
  
  // 添加提示文本
  this.add.text(400, 500, '青色三角形旋转动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);