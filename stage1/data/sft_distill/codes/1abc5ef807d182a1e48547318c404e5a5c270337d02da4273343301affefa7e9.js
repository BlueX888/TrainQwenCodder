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
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 绘制六边形（中心点在 50, 50，半径 40）
  const hexRadius = 40;
  const hexCenterX = 50;
  const hexCenterY = 50;
  
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个角60度
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
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建使用六边形纹理的精灵
  const hexSprite = this.add.sprite(100, 300, 'hexagon');
  
  // 创建补间动画：从左到右移动
  this.tweens.add({
    targets: hexSprite,
    x: 700, // 目标 x 坐标（右侧）
    duration: 2500, // 2.5 秒
    yoyo: true, // 往返效果
    loop: -1, // 无限循环 (-1 表示永久循环)
    ease: 'Linear' // 线性缓动
  });
}

// 创建游戏实例
new Phaser.Game(config);