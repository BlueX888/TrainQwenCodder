const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let player;
let moveSpeed = 2;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createBackgroundGrid.call(this);
  
  // 使用 Graphics 生成圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 中心点 (25, 25)，半径 25
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();
  
  // 创建玩家对象（圆形）
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 设置相机跟随玩家
  this.cameras.main.startFollow(player);
  
  // 可选：设置相机跟随的平滑度（lerp 值，0-1 之间）
  // 值越小越平滑，值为 1 则立即跟随
  this.cameras.main.setLerp(0.1, 0.1);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, 'Circle moves right, camera follows', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机视图上，不随相机移动
}

function update(time, delta) {
  // 让圆形自动向右移动
  player.x += moveSpeed;
  
  // 可选：当圆形移动到一定距离后重置位置（演示循环效果）
  if (player.x > 3000) {
    player.x = 0;
  }
}

// 辅助函数：创建背景网格
function createBackgroundGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制网格线（扩大范围以便观察相机移动）
  const gridSize = 50;
  const gridWidth = 4000;
  const gridHeight = 1000;
  
  // 垂直线
  for (let x = 0; x <= gridWidth; x += gridSize) {
    graphics.lineBetween(x, 0, x, gridHeight);
  }
  
  // 水平线
  for (let y = 0; y <= gridHeight; y += gridSize) {
    graphics.lineBetween(0, y, gridWidth, y);
  }
  
  // 添加坐标标记
  const textStyle = {
    fontSize: '12px',
    color: '#888888'
  };
  
  for (let x = 0; x <= gridWidth; x += 200) {
    this.add.text(x + 5, 5, `x:${x}`, textStyle);
  }
}

new Phaser.Game(config);