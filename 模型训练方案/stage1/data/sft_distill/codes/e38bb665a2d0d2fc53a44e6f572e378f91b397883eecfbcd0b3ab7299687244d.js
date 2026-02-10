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
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，半径约 40
  graphics.beginPath();
  graphics.moveTo(50, 10);  // 顶点
  graphics.lineTo(15, 75);  // 左下角
  graphics.lineTo(85, 75);  // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建三角形 Sprite，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 设置三角形的原点为中心
  triangle.setOrigin(0.5, 0.5);
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.48,  // 缩放到 48%
    scaleY: 0.48,  // 缩放到 48%
    duration: 3000,  // 3 秒完成缩放
    yoyo: true,  // 自动返回原始大小
    loop: -1,  // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  const text = this.add.text(400, 50, '三角形缩放动画\n3秒缩放到48%后恢复', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);