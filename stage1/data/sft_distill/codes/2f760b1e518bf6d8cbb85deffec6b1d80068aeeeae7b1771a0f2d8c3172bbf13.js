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
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（等边三角形）
  const triangleSize = 100;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize); // 顶点
  graphics.lineTo(-triangleSize, triangleSize); // 左下角
  graphics.lineTo(triangleSize, triangleSize); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize * 2, triangleSize * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建三角形精灵并居中显示
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放补间动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.24, // 缩放到 24%
    scaleY: 0.24,
    duration: 3000, // 3秒
    yoyo: true, // 自动恢复到原始大小
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文本说明
  this.add.text(400, 550, '三角形循环缩放动画 (100% ↔ 24%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);