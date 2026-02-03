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

let diamond;
const moveSpeed = 2; // 移动速度（像素/帧）

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createGrid.call(this);
  
  // 使用 Graphics 绘制菱形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（四个点连接成菱形）
  graphics.fillStyle(0xff6b6b, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);      // 上顶点
  graphics.lineTo(64, 32);     // 右顶点
  graphics.lineTo(32, 64);     // 下顶点
  graphics.lineTo(0, 32);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 添加描边使菱形更明显
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('diamondTexture', 64, 64);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建菱形精灵，初始位置在场景中心
  diamond = this.add.sprite(400, 300, 'diamondTexture');
  
  // 设置相机跟随菱形
  // 第二个参数为 true 表示圆形插值跟随（平滑跟随）
  // 第三和第四个参数控制跟随的平滑度（0-1之间，值越小越平滑）
  this.cameras.main.startFollow(diamond, true, 0.1, 0.1);
  
  // 设置相机边界，让相机可以在更大的世界中移动
  this.cameras.main.setBounds(0, 0, 2000, 2000);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随菱形移动\n菱形向右上方移动', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让菱形向右上方移动（45度角）
  diamond.x += moveSpeed;
  diamond.y -= moveSpeed;
  
  // 让菱形旋转，增加视觉效果
  diamond.rotation += 0.02;
  
  // 可选：当菱形移动到边界外时重置位置（演示用）
  if (diamond.x > 1900 || diamond.y < 100) {
    diamond.x = 400;
    diamond.y = 300;
  }
}

// 辅助函数：创建背景网格
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制更大的网格区域
  const gridSize = 100;
  const worldWidth = 2000;
  const worldHeight = 2000;
  
  // 绘制垂直线
  for (let x = 0; x <= worldWidth; x += gridSize) {
    graphics.lineBetween(x, 0, x, worldHeight);
  }
  
  // 绘制水平线
  for (let y = 0; y <= worldHeight; y += gridSize) {
    graphics.lineBetween(0, y, worldWidth, y);
  }
  
  // 添加坐标标记
  const style = { fontSize: '14px', fill: '#666666' };
  for (let x = 0; x <= worldWidth; x += 200) {
    for (let y = 0; y <= worldHeight; y += 200) {
      this.add.text(x + 5, y + 5, `${x},${y}`, style);
    }
  }
}

// 创建游戏实例
new Phaser.Game(config);