const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  // 不需要预加载外部资源
}

function create() {
  // 设置世界边界为 1600x1200
  this.physics.world.setBounds(0, 0, 1600, 1200);
  
  // 创建场景背景 - 使用网格图案标识场景范围
  const graphics = this.add.graphics();
  
  // 绘制背景色
  graphics.fillStyle(0x2d2d2d, 1);
  graphics.fillRect(0, 0, 1600, 1200);
  
  // 绘制网格线，每200像素一条
  graphics.lineStyle(2, 0x444444, 1);
  for (let x = 0; x <= 1600; x += 200) {
    graphics.beginPath();
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 1200);
    graphics.strokePath();
  }
  for (let y = 0; y <= 1200; y += 200) {
    graphics.beginPath();
    graphics.moveTo(0, y);
    graphics.lineTo(1600, y);
    graphics.strokePath();
  }
  
  // 绘制场景边界（红色边框）
  graphics.lineStyle(4, 0xff0000, 1);
  graphics.strokeRect(2, 2, 1596, 1196);
  
  // 添加坐标标记
  const textStyle = { 
    fontSize: '16px', 
    fill: '#ffffff',
    backgroundColor: '#000000'
  };
  this.add.text(10, 10, '(0, 0)', textStyle).setScrollFactor(0);
  this.add.text(1500, 10, '(1600, 0)', textStyle);
  this.add.text(10, 1170, '(0, 1200)', textStyle);
  this.add.text(1450, 1170, '(1600, 1200)', textStyle);
  
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();
  
  // 创建玩家精灵，放置在场景中心
  player = this.physics.add.sprite(800, 600, 'player');
  player.setCollideWorldBounds(true);
  
  // 添加玩家标签
  const playerLabel = this.add.text(0, -30, 'Player', {
    fontSize: '14px',
    fill: '#ffff00',
    backgroundColor: '#000000'
  });
  playerLabel.setOrigin(0.5, 0.5);
  
  // 让标签跟随玩家
  this.events.on('update', () => {
    playerLabel.setPosition(player.x, player.y - 30);
  });
  
  // 设置相机边界为场景大小 (1600x1200)
  this.cameras.main.setBounds(0, 0, 1600, 1200);
  
  // 相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示信息（固定在屏幕上）
  const instructions = this.add.text(10, 10, 
    'Use Arrow Keys to move\nCamera is bounded to 1600x1200\nRed border shows scene bounds', 
    {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    }
  );
  instructions.setScrollFactor(0); // 固定在相机视图上
  instructions.setDepth(1000);
  
  // 添加当前位置显示
  this.positionText = this.add.text(10, 100, '', {
    fontSize: '14px',
    fill: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  this.positionText.setScrollFactor(0);
  this.positionText.setDepth(1000);
}

function update() {
  // 玩家移动控制
  const speed = 300;
  
  player.setVelocity(0);
  
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  }
  
  // 更新位置信息显示
  this.positionText.setText(
    `Player: (${Math.round(player.x)}, ${Math.round(player.y)})\n` +
    `Camera: (${Math.round(this.cameras.main.scrollX)}, ${Math.round(this.cameras.main.scrollY)})`
  );
}

new Phaser.Game(config);