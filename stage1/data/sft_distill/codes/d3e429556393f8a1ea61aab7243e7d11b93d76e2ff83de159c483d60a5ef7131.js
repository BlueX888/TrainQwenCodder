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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制等边三角形（中心点在 50, 50）
  const triangleSize = 80;
  const height = (Math.sqrt(3) / 2) * triangleSize;
  
  graphics.beginPath();
  graphics.moveTo(50, 50 - height / 1.5); // 顶点
  graphics.lineTo(50 - triangleSize / 2, 50 + height / 3); // 左下
  graphics.lineTo(50 + triangleSize / 2, 50 + height / 3); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
  
  // 创建三角形 Sprite 并居中显示
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  // 使用 yoyo 模式实现来回缩放效果
  this.tweens.add({
    targets: triangle,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 3000, // 3秒缩小到48%
    ease: 'Sine.easeInOut',
    yoyo: true, // 自动返回原始值
    repeat: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Triangle scaling to 48% and back in 3 seconds', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Loop: Infinite', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);