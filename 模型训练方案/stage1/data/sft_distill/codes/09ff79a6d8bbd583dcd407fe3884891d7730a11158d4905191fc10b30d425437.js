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
  // 使用 Graphics 绘制青色六边形
  const graphics = this.add.graphics();
  
  // 六边形参数
  const hexRadius = 60;
  const hexCenterX = 80;
  const hexCenterY = 80;
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.beginPath();
  
  // 计算六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = hexCenterX + hexRadius * Math.cos(angle);
    const y = hexCenterY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 160, 160);
  graphics.destroy(); // 销毁 graphics 对象，节省资源
  
  // 创建精灵对象并居中显示
  const hexSprite = this.add.sprite(400, 300, 'hexagon');
  
  // 创建闪烁动画
  // 使用 Tween 控制 alpha 透明度：从1到0再到1，实现闪烁效果
  this.tweens.add({
    targets: hexSprite,
    alpha: {
      from: 1,
      to: 0
    },
    duration: 500, // 淡出用时 0.5 秒
    yoyo: true, // 反向播放（0 回到 1）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 500, '青色六边形闪烁动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);