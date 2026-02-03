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
  // 中心点在 (0, 0)，方便缩放
  const triangleSize = 100;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize * 0.577); // 顶点
  graphics.lineTo(-triangleSize / 2, triangleSize * 0.289); // 左下
  graphics.lineTo(triangleSize / 2, triangleSize * 0.289); // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize, triangleSize);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用三角形纹理的精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.16, // 缩放到 16%
    scaleY: 0.16,
    duration: 2500, // 2.5 秒
    yoyo: true, // 自动恢复到原始大小
    loop: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Triangle scaling animation (16% - 100% loop)', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);