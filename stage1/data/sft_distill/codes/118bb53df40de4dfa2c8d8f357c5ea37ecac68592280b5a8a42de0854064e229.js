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

let player;
let speed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createGrid.call(this);
  
  // 使用 Graphics 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 圆心在 (25, 25)，半径 25
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();
  
  // 创建玩家精灵
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 设置相机跟随玩家
  this.cameras.main.startFollow(player);
  
  // 可选：设置相机跟随的平滑度（0-1，值越小越平滑）
  // this.cameras.main.setLerp(0.1, 0.1);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, '相机跟随圆形移动', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让玩家自动向右移动
  player.x += speed;
  
  // 可选：添加边界限制或循环
  // 这里让它无限向右移动以展示相机跟随效果
}

// 辅助函数：创建网格背景
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x555555, 0.5);
  
  // 创建一个大的网格区域（5000x3000）
  const gridWidth = 5000;
  const gridHeight = 3000;
  const cellSize = 100;
  
  // 绘制垂直线
  for (let x = 0; x <= gridWidth; x += cellSize) {
    graphics.lineBetween(x, 0, x, gridHeight);
  }
  
  // 绘制水平线
  for (let y = 0; y <= gridHeight; y += cellSize) {
    graphics.lineBetween(0, y, gridWidth, y);
  }
  
  // 添加坐标标记
  const style = {
    fontSize: '14px',
    color: '#888888'
  };
  
  for (let x = 0; x <= gridWidth; x += 500) {
    this.add.text(x + 5, 5, `x:${x}`, style);
  }
  
  for (let y = 0; y <= gridHeight; y += 500) {
    if (y > 0) {
      this.add.text(5, y + 5, `y:${y}`, style);
    }
  }
}

new Phaser.Game(config);