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
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制六边形
  const hexagonSize = 40;
  const hexagonPoints = [];
  
  // 计算六边形的六个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
    const x = hexagonSize + hexagonSize * Math.cos(angle);
    const y = hexagonSize + hexagonSize * Math.sin(angle);
    hexagonPoints.push(x, y);
  }
  
  // 绘制多边形
  graphics.fillPoints(hexagonPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexagonSize * 2, hexagonSize * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用六边形纹理的精灵
  const hexagonSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右移动，4秒完成，往返循环
  this.tweens.add({
    targets: hexagonSprite,
    x: 700, // 移动到右侧（考虑精灵宽度，留出边距）
    duration: 4000, // 4秒
    ease: 'Linear', // 线性移动
    yoyo: true, // 启用往返（到达终点后反向播放）
    loop: -1 // 无限循环
  });
  
  // 添加文字说明
  this.add.text(10, 10, '粉色六边形左右往返循环动画\n单程时间: 4秒', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

new Phaser.Game(config);