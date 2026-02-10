const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let hexagon;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制六边形
  const hexRadius = 60; // 六边形半径
  const centerX = 64; // 纹理中心X
  const centerY = 64; // 纹理中心Y
  
  // 开始路径
  graphics.beginPath();
  
  // 绘制六边形的6个顶点
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 每60度一个顶点，从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使六边形更明显
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 128, 128);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建六边形精灵并放置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置初始旋转角度为0
  hexagon.rotation = 0;
}

function update(time, delta) {
  // 每秒旋转200度
  // delta 是毫秒，需要转换为秒
  // 200度 = 200 * (Math.PI / 180) 弧度
  const rotationSpeed = 200 * (Math.PI / 180); // 弧度/秒
  const deltaSeconds = delta / 1000; // 转换为秒
  
  // 累加旋转角度
  hexagon.rotation += rotationSpeed * deltaSeconds;
}

// 创建游戏实例
new Phaser.Game(config);