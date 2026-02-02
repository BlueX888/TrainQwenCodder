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
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建三角形精灵，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    scaleX: 0.24,               // X 轴缩放到 24%
    scaleY: 0.24,               // Y 轴缩放到 24%
    duration: 3000,             // 持续 3 秒
    yoyo: true,                 // 往返效果（缩小后恢复）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'      // 缓动效果，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 500, '三角形循环缩放动画\n3秒缩小到24%，再恢复', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);