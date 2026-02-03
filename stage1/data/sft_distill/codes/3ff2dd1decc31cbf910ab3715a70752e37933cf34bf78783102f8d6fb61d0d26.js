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
let moveSpeed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  
  // 设置六边形的参数
  const hexRadius = 30;
  const sides = 6;
  const angle = (Math.PI * 2) / sides;
  
  // 绘制六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(3, 0xffffff, 1);
  
  graphics.beginPath();
  for (let i = 0; i < sides; i++) {
    const x = hexRadius * Math.cos(angle * i - Math.PI / 2);
    const y = hexRadius * Math.sin(angle * i - Math.PI / 2);
    if (i === 0) {
      graphics.moveTo(x + hexRadius, y + hexRadius);
    } else {
      graphics.lineTo(x + hexRadius, y + hexRadius);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在场景上方
  hexagon = this.add.sprite(400, 100, 'hexagon');
  
  // 设置相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 设置相机边界，让场景可以无限延伸
  this.cameras.main.setBounds(0, 0, 800, Number.MAX_SAFE_INTEGER);
  
  // 添加参考网格以便观察移动效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制横线
  for (let y = 0; y < 5000; y += 100) {
    gridGraphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制竖线
  for (let x = 0; x < 800; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 5000);
  }
  
  // 添加文本提示
  const text = this.add.text(10, 10, '六边形自动向下移动\n相机跟随中', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 让文本固定在相机上，不随场景移动
  text.setScrollFactor(0);
}

function update(time, delta) {
  // 让六边形持续向下移动
  hexagon.y += moveSpeed;
  
  // 可选：添加轻微的左右摆动效果
  hexagon.x = 400 + Math.sin(time / 500) * 50;
  
  // 可选：添加旋转效果
  hexagon.rotation += 0.01;
}

// 创建游戏实例
new Phaser.Game(config);