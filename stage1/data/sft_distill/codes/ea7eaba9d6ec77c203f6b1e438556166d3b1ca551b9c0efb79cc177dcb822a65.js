const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let cursors;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 设置世界边界为更大的区域
  this.physics.world.setBounds(0, 0, 2400, 1800);
  
  // 创建背景网格以便观察相机移动
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x00ff00, 0.3);
  
  // 绘制网格
  for (let x = 0; x <= 2400; x += 100) {
    graphics.lineBetween(x, 0, x, 1800);
  }
  for (let y = 0; y <= 1800; y += 100) {
    graphics.lineBetween(0, y, 2400, y);
  }
  
  // 添加坐标标记
  const textStyle = { fontSize: '14px', fill: '#00ff00' };
  for (let x = 0; x <= 2400; x += 200) {
    for (let y = 0; y <= 1800; y += 200) {
      this.add.text(x + 5, y + 5, `${x},${y}`, textStyle);
    }
  }
  
  // 使用 Graphics 创建矩形纹理
  const rectGraphics = this.add.graphics();
  rectGraphics.fillStyle(0xff0000, 1);
  rectGraphics.fillRect(0, 0, 40, 40);
  rectGraphics.generateTexture('playerRect', 40, 40);
  rectGraphics.destroy();
  
  // 创建物理精灵（玩家对象）
  player = this.physics.add.sprite(400, 300, 'playerRect');
  player.setCollideWorldBounds(true);
  
  // 设置向右上方移动的速度
  // 向右：正 x 速度，向上：负 y 速度
  player.setVelocity(150, -100);
  
  // 设置相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置相机边界与世界边界一致
  this.cameras.main.setBounds(0, 0, 2400, 1800);
  
  // 添加提示文本（固定在相机上）
  const infoText = this.add.text(10, 10, 'Camera follows the red rectangle\nMoving right-up automatically', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0); // 固定在相机上，不随世界移动
  
  // 添加位置显示（固定在相机上）
  this.positionText = this.add.text(10, 70, '', {
    fontSize: '14px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
}

function update(time, delta) {
  // 更新位置显示
  this.positionText.setText(
    `Player Position: (${Math.round(player.x)}, ${Math.round(player.y)})\n` +
    `Camera Position: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
  
  // 当玩家碰到世界边界时，反弹方向
  if (player.body.blocked.right || player.body.blocked.left) {
    player.setVelocityX(-player.body.velocity.x);
  }
  if (player.body.blocked.up || player.body.blocked.down) {
    player.setVelocityY(-player.body.velocity.y);
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);