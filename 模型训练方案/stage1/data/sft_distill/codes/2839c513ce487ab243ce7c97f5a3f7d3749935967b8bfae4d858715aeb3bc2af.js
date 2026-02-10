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
let crossCount = 0; // 可验证的状态信号：记录穿越边界次数
let crossText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建灰色方块纹理作为玩家
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('playerTexture', 32, 32);
  graphics.destroy();

  // 创建玩家物理精灵
  player = this.physics.add.sprite(400, 300, 'playerTexture');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出边界
  
  // 设置移动速度
  player.body.setMaxVelocity(160, 160);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 显示穿越边界次数
  crossText = this.add.text(16, 16, 'Crosses: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // 添加说明文字
  this.add.text(16, 50, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    fill: '#cccccc'
  });

  // 添加边界提示线
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(2, 0xffffff, 0.3);
  borderGraphics.strokeRect(0, 0, 800, 600);
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);

  // 键盘控制
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-160);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
  }

  // 循环地图效果：检测边界并从对侧出现
  const playerWidth = player.width;
  const playerHeight = player.height;

  // 左右边界循环
  if (player.x > config.width + playerWidth / 2) {
    player.x = -playerWidth / 2;
    crossCount++;
    updateCrossText();
  } else if (player.x < -playerWidth / 2) {
    player.x = config.width + playerWidth / 2;
    crossCount++;
    updateCrossText();
  }

  // 上下边界循环
  if (player.y > config.height + playerHeight / 2) {
    player.y = -playerHeight / 2;
    crossCount++;
    updateCrossText();
  } else if (player.y < -playerHeight / 2) {
    player.y = config.height + playerHeight / 2;
    crossCount++;
    updateCrossText();
  }
}

function updateCrossText() {
  crossText.setText('Crosses: ' + crossCount);
}

new Phaser.Game(config);