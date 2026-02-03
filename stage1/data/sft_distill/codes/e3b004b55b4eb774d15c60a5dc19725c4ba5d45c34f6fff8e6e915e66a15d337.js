const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let hexagon;
const MOVE_SPEED = 100; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制六边形纹理
  const graphics = this.add.graphics();
  
  // 绘制六边形
  const hexRadius = 30;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = hexRadius * Math.cos(angle);
    const y = hexRadius * Math.sin(angle);
    hexPoints.push(new Phaser.Math.Vector2(x, y));
  }
  
  // 填充六边形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 绘制边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2 + 10, hexRadius * 2 + 10);
  graphics.destroy();
  
  // 创建六边形精灵，初始位置在场景中心偏右上方
  hexagon = this.add.sprite(600, 200, 'hexagon');
  
  // 设置相机跟随六边形
  this.cameras.main.startFollow(hexagon, true, 0.1, 0.1);
  
  // 设置世界边界，让六边形有足够的移动空间
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '六边形向左下移动\n相机跟随中...', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
  
  // 添加背景网格以便观察移动
  createGrid(this);
}

function update(time, delta) {
  // 让六边形向左下移动
  // 左下方向：x减小，y增加
  const deltaSeconds = delta / 1000;
  
  hexagon.x -= MOVE_SPEED * deltaSeconds * 0.707; // 向左（cos(45°) ≈ 0.707）
  hexagon.y += MOVE_SPEED * deltaSeconds * 0.707; // 向下（sin(45°) ≈ 0.707）
  
  // 让六边形旋转，增加视觉效果
  hexagon.rotation += 0.02;
}

// 创建背景网格辅助观察
function createGrid(scene) {
  const gridGraphics = scene.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  const gridSize = 100;
  const gridRange = 2000;
  
  // 绘制垂直线
  for (let x = -gridRange; x <= gridRange; x += gridSize) {
    gridGraphics.moveTo(x, -gridRange);
    gridGraphics.lineTo(x, gridRange);
  }
  
  // 绘制水平线
  for (let y = -gridRange; y <= gridRange; y += gridSize) {
    gridGraphics.moveTo(-gridRange, y);
    gridGraphics.lineTo(gridRange, y);
  }
  
  gridGraphics.strokePath();
  
  // 标记原点
  const originGraphics = scene.add.graphics();
  originGraphics.fillStyle(0xff0000, 1);
  originGraphics.fillCircle(0, 0, 10);
  
  const originText = scene.add.text(15, 15, 'Origin (0,0)', {
    fontSize: '14px',
    color: '#ff0000',
    backgroundColor: '#000000'
  });
}

new Phaser.Game(config);