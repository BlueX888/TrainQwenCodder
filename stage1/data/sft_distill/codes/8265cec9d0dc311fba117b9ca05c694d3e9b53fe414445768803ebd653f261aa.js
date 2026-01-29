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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制六边形
  const hexagonSize = 80; // 六边形外接圆半径
  const centerX = 400;
  const centerY = 300;
  
  // 计算六边形的6个顶点
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = centerX + hexagonSize * Math.cos(angle);
    const y = centerY + hexagonSize * Math.sin(angle);
    points.push(x, y);
  }
  
  // 绘制填充的六边形
  graphics.fillPoints(points, true);
  
  // 创建缩放动画
  // 使用 yoyo 实现从 1 -> 0.32 -> 1 的效果
  // duration 3000 表示单程3秒，yoyo 会使往返总共6秒
  this.tweens.add({
    targets: graphics,
    scaleX: 0.32,
    scaleY: 0.32,
    duration: 3000,      // 缩小过程3秒
    yoyo: true,          // 自动反向播放（恢复）
    loop: -1,            // 无限循环
    ease: 'Linear'       // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Hexagon Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scaling from 100% to 32% and back (Loop)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);