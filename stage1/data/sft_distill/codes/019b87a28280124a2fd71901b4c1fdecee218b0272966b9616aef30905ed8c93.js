const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形的中心点和半径
  const centerX = 400;
  const centerY = 300;
  const radius = 100;
  
  // 计算六边形的六个顶点坐标
  const hexagon = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    hexagon.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillPolygon(hexagon);
  
  // 设置六边形的原点为中心点，方便缩放
  graphics.x = 0;
  graphics.y = 0;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.32,        // 缩放到 32%
    scaleY: 0.32,        // 缩放到 32%
    duration: 3000,      // 3秒完成缩放
    yoyo: true,          // 自动反向播放（恢复原始大小）
    repeat: -1,          // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  const text = this.add.text(400, 550, '六边形缩放动画（3秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);