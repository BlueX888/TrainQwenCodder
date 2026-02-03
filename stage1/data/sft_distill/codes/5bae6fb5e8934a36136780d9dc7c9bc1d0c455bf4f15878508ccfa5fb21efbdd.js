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
const moveSpeed = 100; // 每秒移动的像素数

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.lineStyle(2, 0xffffff, 1);
  
  // 绘制六边形（中心点在 32, 32）
  const hexRadius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    hexPoints.push({
      x: 32 + hexRadius * Math.cos(angle),
      y: 32 + hexRadius * Math.sin(angle)
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在场景中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 设置世界边界，让六边形有足够的移动空间
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 添加一些参考网格以便观察相机跟随效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 3000; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    gridGraphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加文字提示
  const text = this.add.text(10, 10, 'Camera follows the hexagon', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 让文字固定在屏幕上，不随相机移动
}

function update(time, delta) {
  // 让六边形向右移动
  hexagon.x += moveSpeed * (delta / 1000);
  
  // 当六边形移出世界边界时，重置位置
  if (hexagon.x > 3000) {
    hexagon.x = 0;
  }
}

const game = new Phaser.Game(config);