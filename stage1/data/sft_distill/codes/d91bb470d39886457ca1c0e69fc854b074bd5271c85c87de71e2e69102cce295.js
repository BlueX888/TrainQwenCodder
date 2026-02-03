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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算六边形的顶点坐标
  const hexRadius = 80; // 六边形的半径
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔 60 度
    const x = Math.cos(angle) * hexRadius;
    const y = Math.sin(angle) * hexRadius;
    hexPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillPolygon(hexPoints);
  
  // 将六边形定位到屏幕中心
  graphics.setPosition(400, 300);
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.64,
    scaleY: 0.64,
    duration: 1500, // 1.5 秒
    yoyo: true, // 动画结束后反向播放（恢复原始大小）
    loop: -1, // 无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文字
  this.add.text(400, 50, '六边形缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '缩放范围: 100% ↔ 64%', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);