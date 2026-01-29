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
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  
  // 绘制五角星
  const starPoints = [];
  const outerRadius = 40;
  const innerRadius = 16;
  const centerX = 50;
  const centerY = 50;
  
  // 生成五角星的10个点（5个外顶点 + 5个内顶点）
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / 5 - Math.PI / 2; // 从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    starPoints.push(x, y);
  }
  
  // 绘制星形
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建星形精灵
  const star = this.add.image(100, 300, 'star');
  
  // 创建补间动画：从左到右移动，2.5秒，往返循环
  this.tweens.add({
    targets: star,
    x: 700, // 移动到右侧（距离右边界100像素）
    duration: 2500, // 2.5秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环（-1 表示永久循环）
    ease: 'Linear' // 线性缓动，匀速移动
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Red Star Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The star moves left to right and loops forever', {
    fontSize: '16px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);