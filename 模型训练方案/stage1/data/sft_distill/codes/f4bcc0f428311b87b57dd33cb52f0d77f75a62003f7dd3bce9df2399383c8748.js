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

let diamond;
const moveSpeed = 100; // 每秒移动的像素数

function preload() {
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（四个三角形组成）
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 设置世界边界，使其足够大以便菱形移动
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 创建菱形精灵，初始位置在屏幕中心
  diamond = this.add.sprite(0, 0, 'diamond');
  
  // 设置相机跟随菱形
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 添加提示文本（固定在相机上）
  const infoText = this.add.text(10, 10, 
    '菱形自动向左上移动\n相机跟随并保持居中', 
    {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }
  );
  infoText.setScrollFactor(0); // 固定在相机上，不随世界移动
  
  // 添加坐标显示文本
  this.coordText = this.add.text(10, 80, '', {
    fontSize: '16px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordText.setScrollFactor(0);
  
  // 添加一些参考网格点，帮助观察移动
  createReferenceGrid.call(this);
}

function update(time, delta) {
  // 计算本帧移动的距离
  const distance = (moveSpeed * delta) / 1000;
  
  // 向左上方移动（x减小，y减小）
  // 使用 Math.cos(45°) 和 Math.sin(45°) 确保斜向移动
  const angle = Math.PI * 0.75; // 135度，即左上方向
  diamond.x += Math.cos(angle) * distance;
  diamond.y += Math.sin(angle) * distance;
  
  // 更新坐标显示
  this.coordText.setText(
    `菱形位置:\nX: ${Math.round(diamond.x)}\nY: ${Math.round(diamond.y)}`
  );
}

// 创建参考网格，帮助观察相机跟随效果
function createReferenceGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格线
  const gridSize = 200;
  const gridRange = 2000;
  
  for (let x = -gridRange; x <= gridRange; x += gridSize) {
    graphics.moveTo(x, -gridRange);
    graphics.lineTo(x, gridRange);
  }
  
  for (let y = -gridRange; y <= gridRange; y += gridSize) {
    graphics.moveTo(-gridRange, y);
    graphics.lineTo(gridRange, y);
  }
  
  graphics.strokePath();
  
  // 在原点绘制标记
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(0, 0, 10);
  
  // 添加原点标签
  const originText = this.add.text(10, 10, 'Origin (0,0)', {
    fontSize: '14px',
    fill: '#ffff00',
    backgroundColor: '#000000'
  });
}

new Phaser.Game(config);