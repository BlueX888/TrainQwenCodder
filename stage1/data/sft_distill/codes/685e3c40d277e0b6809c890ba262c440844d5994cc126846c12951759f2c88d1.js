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
let velocityX = 100; // 向右移动速度
let velocityY = -80; // 向上移动速度

function preload() {
  // 使用 Graphics 创建方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建一个大的背景网格以便观察相机移动
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x555555, 0.5);
  
  // 绘制网格（扩大范围以便方块移动）
  for (let x = 0; x <= 3000; x += 50) {
    gridGraphics.lineBetween(x, 0, x, 2000);
  }
  for (let y = 0; y <= 2000; y += 50) {
    gridGraphics.lineBetween(0, y, 3000, y);
  }
  
  // 添加坐标标记
  const style = { fontSize: '14px', color: '#ffffff' };
  this.add.text(50, 50, 'Start (0,0)', style);
  this.add.text(1500, 50, '(1500,0)', style);
  this.add.text(50, 1000, '(0,1000)', style);
  
  // 创建玩家方块
  player = this.add.sprite(100, 500, 'player');
  player.setOrigin(0.5, 0.5);
  
  // 设置相机边界（扩大场景范围）
  this.cameras.main.setBounds(0, 0, 3000, 2000);
  
  // 相机跟随玩家，保持居中
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 添加提示文本（固定在相机上）
  const infoText = this.add.text(10, 10, 'Camera following green square', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机上，不随场景滚动
}

function update(time, delta) {
  // 让方块持续向右上移动
  player.x += velocityX * (delta / 1000);
  player.y += velocityY * (delta / 1000);
  
  // 可选：当方块移出场景边界时重置位置
  if (player.x > 2900 || player.y < 100) {
    player.x = 100;
    player.y = 500;
  }
}

new Phaser.Game(config);