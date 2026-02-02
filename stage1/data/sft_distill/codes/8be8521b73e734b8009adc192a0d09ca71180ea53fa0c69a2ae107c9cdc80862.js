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
  
  // 设置填充颜色为青色
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制六边形（使用 beginPath 和 lineTo）
  const hexagonRadius = 40;
  const centerX = 0;
  const centerY = 0;
  
  graphics.beginPath();
  
  // 绘制六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角度60度
    const x = centerX + hexagonRadius * Math.cos(angle);
    const y = centerY + hexagonRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 将 graphics 转换为纹理以便于补间动画
  graphics.generateTexture('hexagon', hexagonRadius * 2, hexagonRadius * 2);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建六边形精灵
  const hexagon = this.add.image(100, 300, 'hexagon');
  
  // 创建补间动画
  this.tweens.add({
    targets: hexagon,
    x: 700, // 从左(100)移动到右(700)
    duration: 4000, // 4秒
    ease: 'Linear', // 线性运动
    yoyo: true, // 往返效果
    repeat: -1 // 无限循环
  });
}

// 启动游戏
new Phaser.Game(config);