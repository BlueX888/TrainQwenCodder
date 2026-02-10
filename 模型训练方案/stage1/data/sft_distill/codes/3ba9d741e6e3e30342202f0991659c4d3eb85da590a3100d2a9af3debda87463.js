const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 80; // 六边形外接圆半径
  const centerX = 128; // 纹理中心 X
  const centerY = 128; // 纹理中心 Y
  
  // 绘制六边形（6个顶点，从顶部开始顺时针）
  graphics.fillStyle(0x00aaff, 1);
  graphics.beginPath();
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 256, 256);
  graphics.destroy(); // 销毁 graphics 对象，不再需要
  
  // 创建六边形精灵并放置在屏幕中心
  const hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始透明度为 0（完全透明）
  hexagon.setAlpha(0);
  
  // 创建 Tween 动画：从透明到不透明，循环播放
  this.tweens.add({
    targets: hexagon,
    alpha: 1, // 目标透明度：完全不透明
    duration: 2000, // 持续时间：2 秒
    ease: 'Linear', // 线性缓动
    yoyo: false, // 不反向播放
    repeat: -1 // 无限循环
  });
  
  // 添加提示文本
  this.add.text(400, 500, '六边形淡入动画（循环播放）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);