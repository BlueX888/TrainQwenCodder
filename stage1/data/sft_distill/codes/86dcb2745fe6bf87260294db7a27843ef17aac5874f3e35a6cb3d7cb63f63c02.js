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
let speed = 200; // 移动速度（像素/秒）

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createGrid.call(this);
  
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色方块
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();
  
  // 创建玩家方块，初始位置在画布中心
  player = this.add.sprite(400, 300, 'playerBlock');
  player.setOrigin(0.5, 0.5);
  
  // 设置相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 可选：设置相机边界，让相机可以无限跟随
  // 如果不设置，相机会受到世界边界限制
  this.cameras.main.setBounds(-10000, -10000, 20000, 20000);
  
  // 扩展世界边界以匹配相机
  this.physics.world.setBounds(-10000, -10000, 20000, 20000);
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '方块自动向左移动\n相机跟随方块', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让方块持续向左移动
  // delta 是毫秒，需要转换为秒
  const moveDistance = (speed * delta) / 1000;
  player.x -= moveDistance;
  
  // 可选：添加边界检测，防止方块移动太远
  // 这里我们允许无限移动以展示相机跟随效果
}

// 辅助函数：创建网格背景
function createGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  const gridSize = 100;
  const gridWidth = 20000;
  const gridHeight = 20000;
  const offsetX = -10000;
  const offsetY = -10000;
  
  // 绘制垂直线
  for (let x = 0; x <= gridWidth; x += gridSize) {
    graphics.moveTo(offsetX + x, offsetY);
    graphics.lineTo(offsetX + x, offsetY + gridHeight);
  }
  
  // 绘制水平线
  for (let y = 0; y <= gridHeight; y += gridSize) {
    graphics.moveTo(offsetX, offsetY + y);
    graphics.lineTo(offsetX + gridWidth, offsetY + y);
  }
  
  graphics.strokePath();
  
  // 添加坐标标记
  const textStyle = {
    fontSize: '14px',
    fill: '#888888'
  };
  
  // 在关键位置添加坐标文字
  for (let x = -2000; x <= 2000; x += 500) {
    for (let y = -1000; y <= 1000; y += 500) {
      if (x === 0 && y === 0) {
        this.add.text(x, y, `(${x}, ${y})`, textStyle).setOrigin(0.5);
      } else if (x % 1000 === 0 && y % 1000 === 0) {
        this.add.text(x, y, `(${x}, ${y})`, textStyle).setOrigin(0.5);
      }
    }
  }
}

// 启动游戏
new Phaser.Game(config);