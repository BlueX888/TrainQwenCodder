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
const MOVE_SPEED = 2; // 移动速度

function preload() {
  // 使用 Graphics 创建圆形纹理，无需外部资源
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillCircle(25, 25, 25); // 圆心在 (25, 25)，半径 25
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建一个大的背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格线
  for (let x = 0; x <= 3000; x += 100) {
    graphics.lineBetween(x, 0, x, 3000);
  }
  for (let y = 0; y <= 3000; y += 100) {
    graphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加坐标标记
  const style = { fontSize: '16px', color: '#00ff00' };
  for (let x = 0; x <= 3000; x += 500) {
    for (let y = 0; y <= 3000; y += 500) {
      this.add.text(x + 10, y + 10, `(${x},${y})`, style);
    }
  }
  
  // 创建玩家对象，初始位置在 (400, 300)
  player = this.add.sprite(400, 300, 'playerCircle');
  
  // 设置世界边界，让场景足够大
  this.cameras.main.setBounds(0, 0, 3000, 3000);
  
  // 相机跟随玩家对象，保持居中
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 添加提示文字（固定在相机视图中）
  const hint = this.add.text(10, 10, '圆形自动向右下移动\n相机跟随并保持居中', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  hint.setScrollFactor(0); // 固定在相机视图中，不随场景滚动
}

function update(time, delta) {
  // 让玩家对象持续向右下移动
  player.x += MOVE_SPEED;
  player.y += MOVE_SPEED;
  
  // 限制在世界边界内
  if (player.x > 3000) {
    player.x = 3000;
  }
  if (player.y > 3000) {
    player.y = 3000;
  }
}

// 创建游戏实例
new Phaser.Game(config);