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
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（等边三角形）
  const triangleSize = 100;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize / 2); // 顶点
  graphics.lineTo(-triangleSize / 2, triangleSize / 2); // 左下角
  graphics.lineTo(triangleSize / 2, triangleSize / 2); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', triangleSize, triangleSize);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.24, // 缩放到 24%
    scaleY: 0.24,
    duration: 2000, // 2 秒
    yoyo: true, // 动画结束后反向播放（恢复原始大小）
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 550, '三角形缩放动画：2秒缩放到24%，然后恢复，循环播放', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);