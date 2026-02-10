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
  // 创建菱形 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置菱形的位置（屏幕中心）
  const centerX = 400;
  const centerY = 300;
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（使用四个点构成的多边形）
  const size = 100; // 菱形的半径
  graphics.beginPath();
  graphics.moveTo(centerX, centerY - size);      // 顶点
  graphics.lineTo(centerX + size, centerY);      // 右点
  graphics.lineTo(centerX, centerY + size);      // 底点
  graphics.lineTo(centerX - size, centerY);      // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 创建缩放动画
  // 从原始大小（1）缩放到 16%（0.16），然后返回
  this.tweens.add({
    targets: graphics,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 2500,      // 2.5秒完成一次缩放
    yoyo: true,          // 启用往返效果（缩小后再放大）
    loop: -1,            // 无限循环
    ease: 'Linear'       // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Diamond scaling to 16% and back (2.5s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);