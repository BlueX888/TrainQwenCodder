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
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（等边三角形）
  const triangleSize = 100;
  const height = triangleSize * Math.sqrt(3) / 2;
  
  graphics.beginPath();
  graphics.moveTo(0, -height / 2);  // 顶点
  graphics.lineTo(-triangleSize / 2, height / 2);  // 左下角
  graphics.lineTo(triangleSize / 2, height / 2);  // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize, triangleSize);
  graphics.destroy();
  
  // 创建三角形精灵并居中
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  // 4秒完成一个完整循环（缩小到48%再恢复）
  // 使用 yoyo 实现往返效果，每个方向2秒
  this.tweens.add({
    targets: triangle,
    scaleX: 0.48,
    scaleY: 0.48,
    duration: 2000,  // 2秒缩小到48%
    yoyo: true,      // 2秒恢复到100%，总共4秒
    loop: -1,        // 无限循环
    ease: 'Sine.easeInOut'  // 平滑的缓动效果
  });
  
  // 添加文字说明
  this.add.text(400, 50, '三角形缩放动画（4秒循环）', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scale: 100% → 48% → 100%', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);