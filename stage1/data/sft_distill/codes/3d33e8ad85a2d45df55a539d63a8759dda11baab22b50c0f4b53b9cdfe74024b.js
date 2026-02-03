// 完整的 Phaser3 相机跟随示例
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

// 全局变量存储移动对象
let player;
let moveSpeed = 2;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格（范围更大以便观察移动）
  for (let x = -2000; x <= 2000; x += 100) {
    graphics.lineBetween(x, -2000, x, 2000);
  }
  for (let y = -2000; y <= 2000; y += 100) {
    graphics.lineBetween(-2000, y, 2000, y);
  }
  
  // 添加参考点标记
  graphics.fillStyle(0xffff00, 1);
  graphics.fillCircle(0, 0, 10); // 原点
  graphics.fillCircle(400, 300, 10); // 初始相机中心
  
  // 创建玩家矩形（使用 Graphics 绘制）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xff0000, 1);
  playerGraphics.fillRect(-25, -25, 50, 50); // 中心点在 (0,0)
  
  // 添加一个白色边框便于识别
  playerGraphics.lineStyle(3, 0xffffff, 1);
  playerGraphics.strokeRect(-25, -25, 50, 50);
  
  // 设置初始位置
  playerGraphics.x = 400;
  playerGraphics.y = 300;
  
  // 保存到全局变量
  player = playerGraphics;
  
  // 设置相机边界（可选，让相机可以自由移动）
  this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
  
  // 设置相机跟随玩家对象
  this.cameras.main.startFollow(player);
  
  // 设置跟随偏移，使对象保持在画面中央
  // 偏移量为 (0, 0) 表示对象在相机中心
  this.cameras.main.setFollowOffset(0, 0);
  
  // 可选：设置相机跟随的平滑度（lerp值，0-1之间，值越小越平滑）
  this.cameras.main.setLerp(0.1, 0.1);
  
  // 添加提示文本（固定在相机上）
  const text = this.add.text(10, 10, 'Red square moving left\nCamera follows automatically', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  text.setScrollFactor(0); // 固定在相机上，不随场景滚动
  
  // 添加坐标显示
  this.coordText = this.add.text(10, 70, '', {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.coordText.setScrollFactor(0);
}

function update(time, delta) {
  // 让玩家矩形持续向左移动
  player.x -= moveSpeed;
  
  // 更新坐标显示
  this.coordText.setText(
    `Player X: ${Math.round(player.x)}\n` +
    `Player Y: ${Math.round(player.y)}\n` +
    `Camera X: ${Math.round(this.cameras.main.scrollX)}\n` +
    `Camera Y: ${Math.round(this.cameras.main.scrollY)}`
  );
  
  // 可选：当玩家移动到很远时重置位置（演示循环）
  if (player.x < -1500) {
    player.x = 1500;
  }
}

// 启动游戏
new Phaser.Game(config);