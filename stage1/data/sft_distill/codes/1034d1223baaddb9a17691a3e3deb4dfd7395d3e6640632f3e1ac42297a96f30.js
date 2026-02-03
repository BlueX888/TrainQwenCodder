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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制一个等边三角形（中心点为原点）
  const triangleSize = 100;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize);  // 顶点
  graphics.lineTo(-triangleSize * Math.sin(Math.PI / 3), triangleSize / 2);  // 左下角
  graphics.lineTo(triangleSize * Math.sin(Math.PI / 3), triangleSize / 2);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize * 2, triangleSize * 2);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成了纹理
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    scaleX: 0.24,               // X轴缩放到24%
    scaleY: 0.24,               // Y轴缩放到24%
    duration: 3000,             // 持续3秒（3000毫秒）
    yoyo: true,                 // 往返效果：缩小后再恢复
    loop: -1,                   // 无限循环（-1表示永久循环）
    ease: 'Linear'              // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Triangle scaling from 100% to 24% in 3 seconds (looping)', {
    fontSize: '16px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);