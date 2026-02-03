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
const MOVE_SPEED = 100; // 每秒向上移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createBackgroundGrid.call(this);
  
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);    // 上顶点
  graphics.lineTo(64, 32);   // 右顶点
  graphics.lineTo(32, 64);   // 下顶点
  graphics.lineTo(0, 32);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵对象，初始位置在场景中心下方
  diamond = this.add.sprite(400, 1000, 'diamond');
  
  // 设置相机跟随菱形对象
  // 第二个参数为 roundPixels，设置为 true 可以避免抖动
  // 第三个参数为 lerpX，第四个参数为 lerpY，控制跟随的平滑度（0-1之间，1为立即跟随）
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 设置相机边界（可选，让相机在更大的世界中移动）
  this.cameras.main.setBounds(0, 0, 800, 3000);
  
  // 添加提示文本（固定在相机上）
  const instructionText = this.add.text(10, 10, 'Camera follows the diamond\nDiamond moves upward automatically', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 让菱形向上移动（y 坐标减小）
  diamond.y -= MOVE_SPEED * (delta / 1000);
  
  // 可选：当菱形移动到顶部时重置位置
  if (diamond.y < -100) {
    diamond.y = 3000;
  }
}

// 辅助函数：创建背景网格
function createBackgroundGrid() {
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 800; x += 100) {
    gridGraphics.lineTo(x, 0);
    gridGraphics.lineTo(x, 3000);
    gridGraphics.moveTo(x + 100, 0);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 3000; y += 100) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(800, y);
  }
  
  gridGraphics.strokePath();
  
  // 添加坐标标记
  for (let y = 0; y <= 3000; y += 200) {
    const label = this.add.text(10, y, `Y: ${y}`, {
      fontSize: '14px',
      fill: '#888888'
    });
  }
}

// 启动游戏
new Phaser.Game(config);