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
const MOVE_SPEED = 100; // 每秒向下移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createGrid.call(this);
  
  // 使用 Graphics 创建菱形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff6b6b, 1);
  
  // 绘制菱形（中心点在 32, 32）
  graphics.beginPath();
  graphics.moveTo(32, 0);      // 上顶点
  graphics.lineTo(64, 32);     // 右顶点
  graphics.lineTo(32, 64);     // 下顶点
  graphics.lineTo(0, 32);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建菱形精灵对象，初始位置在场景上方中央
  diamond = this.add.sprite(400, 100, 'diamond');
  
  // 设置相机跟随菱形对象
  // 第二个参数 true 表示圆形插值（更平滑）
  // lerp 参数控制跟随的平滑度（0.1 表示每帧移动距离的 10%）
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 可选：设置相机边界，让相机不会移出场景范围
  // 这里设置一个更大的世界边界
  this.cameras.main.setBounds(0, 0, 800, 3000);
  
  // 添加提示文本（固定在相机视图中）
  const text = this.add.text(10, 10, '相机跟随菱形对象\n菱形自动向下移动', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图中，不随相机移动
}

function update(time, delta) {
  // 让菱形持续向下移动
  // delta 是以毫秒为单位的时间间隔
  diamond.y += (MOVE_SPEED * delta) / 1000;
  
  // 可选：当菱形移动到一定距离后重置位置（循环效果）
  if (diamond.y > 2500) {
    diamond.y = 100;
  }
}

// 辅助函数：创建网格背景
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制更大范围的网格
  const gridSize = 50;
  const worldHeight = 3000;
  const worldWidth = 800;
  
  // 垂直线
  for (let x = 0; x <= worldWidth; x += gridSize) {
    graphics.lineBetween(x, 0, x, worldHeight);
  }
  
  // 水平线
  for (let y = 0; y <= worldHeight; y += gridSize) {
    graphics.lineBetween(0, y, worldWidth, y);
  }
  
  // 添加坐标标记
  const style = { fontSize: '12px', fill: '#00ff00' };
  for (let y = 0; y <= worldHeight; y += 200) {
    const label = this.add.text(10, y, `Y: ${y}`, style);
    label.setDepth(1);
  }
}

// 创建游戏实例
new Phaser.Game(config);