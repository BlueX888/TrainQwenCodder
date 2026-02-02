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
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制三角形（等边三角形）
  // 中心点在 (50, 50)，边长约 80
  graphics.beginPath();
  graphics.moveTo(50, 10);      // 顶点
  graphics.lineTo(10, 90);      // 左下角
  graphics.lineTo(90, 90);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.16,  // 缩放到 16%
    scaleY: 0.16,  // 缩放到 16%
    duration: 2500, // 2.5 秒
    yoyo: true,     // 动画结束后反向播放（恢复原始大小）
    loop: -1,       // 无限循环 (-1 表示永久循环)
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 550, '三角形缩放动画：2.5秒缩放到16%，然后恢复，循环播放', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);