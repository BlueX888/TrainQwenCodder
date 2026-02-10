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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径为 25 的圆
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();

  // 创建一个更大的世界边界
  this.physics.world.setBounds(0, 0, 3200, 600);

  // 创建玩家精灵，放在场景右侧
  player = this.physics.add.sprite(2400, 300, 'playerCircle');
  
  // 设置玩家向左移动
  player.setVelocityX(-200);

  // 设置相机跟随玩家
  this.cameras.main.startFollow(player, true, 0.1, 0.1);
  
  // 设置相机边界，使其不超出世界边界
  this.cameras.main.setBounds(0, 0, 3200, 600);

  // 添加一些参考点（网格线）来更好地展示相机跟随效果
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(1, 0x555555, 0.5);
  
  // 绘制垂直网格线
  for (let x = 0; x <= 3200; x += 100) {
    gridGraphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平网格线
  for (let y = 0; y <= 600; y += 100) {
    gridGraphics.lineBetween(0, y, 3200, y);
  }

  // 添加文字提示
  const text = this.add.text(16, 16, '圆形自动向左移动\n相机跟随保持居中', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
  
  // 让文字固定在相机上，不随相机移动而移动
  text.setScrollFactor(0);

  // 添加键盘控制（可选，用于手动控制）
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 可选：添加键盘控制来改变移动方向
  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  } else {
    player.setVelocityY(0);
  }

  if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else {
    // 如果没有按键，保持向左移动
    if (player.body.velocity.x === 0) {
      player.setVelocityX(-200);
    }
  }

  // 当玩家到达世界左边界时，重置到右侧
  if (player.x < 0) {
    player.x = 3200;
  }
  
  // 当玩家到达世界右边界时，重置到左侧
  if (player.x > 3200) {
    player.x = 0;
  }
}

new Phaser.Game(config);