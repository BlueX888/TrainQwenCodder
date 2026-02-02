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

let player;
let moveSpeed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格以便观察相机移动
  createBackgroundGrid.call(this);
  
  // 使用 Graphics 创建圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 圆心在 (25, 25)，半径 25
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokeCircle(25, 25, 25);
  
  // 生成纹理
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建玩家精灵
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 设置相机跟随玩家
  this.cameras.main.startFollow(player);
  
  // 可选：设置相机跟随的平滑度（lerp值，0-1之间，值越小越平滑）
  this.cameras.main.setLerp(0.1, 0.1);
  
  // 设置相机边界（可选，让相机知道世界的大小）
  this.cameras.main.setBounds(0, 0, 3000, 600);
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 3000, 600);
  
  // 添加说明文字（固定在相机上）
  const text = this.add.text(10, 10, '圆形自动向右移动\n相机跟随并保持居中', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随世界移动
}

function update(time, delta) {
  // 让玩家自动向右移动
  player.x += moveSpeed;
  
  // 可选：到达边界后停止或循环
  if (player.x > 2900) {
    moveSpeed = 0; // 停止移动
  }
}

// 创建背景网格的辅助函数
function createBackgroundGrid() {
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 3000; x += 100) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 600);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 600; y += 100) {
    graphics.moveTo(0, y);
    graphics.lineTo(3000, y);
  }
  
  graphics.strokePath();
  
  // 添加坐标标记
  for (let x = 0; x <= 3000; x += 200) {
    const label = this.add.text(x + 5, 5, `${x}`, {
      fontSize: '12px',
      fill: '#888888'
    });
  }
}

// 创建游戏实例
new Phaser.Game(config);