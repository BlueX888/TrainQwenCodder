const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制绿色六边形
  const hexagonRadius = 40;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.beginPath();
  
  // 计算六边形的各个顶点
  for (let i = 0; i < sides; i++) {
    const x = hexagonRadius + hexagonRadius * Math.cos(angle * i - Math.PI / 2);
    const y = hexagonRadius + hexagonRadius * Math.sin(angle * i - Math.PI / 2);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexagonRadius * 2, hexagonRadius * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建六边形精灵
  const hexagon = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右移动，往返循环
  this.tweens.add({
    targets: hexagon,
    x: 700, // 目标 x 坐标（右侧）
    duration: 2500, // 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 往返效果
    loop: -1 // 无限循环（-1 表示永久循环）
  });
}

new Phaser.Game(config);