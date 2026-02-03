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
let wrapCount = 0; // 状态信号：记录穿越边界的次数
let wrapText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建白色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵（带物理属性）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  wrapText = this.add.text(16, 16, 'Wrap Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  // 显示提示信息
  this.add.text(400, 550, 'Use Arrow Keys to Move (Speed: 80)', {
    fontSize: '16px',
    fill: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);
}

function update() {
  // 重置速度
  player.setVelocity(0);

  // 键盘控制移动，速度为 80
  if (cursors.left.isDown) {
    player.setVelocityX(-80);
  } else if (cursors.right.isDown) {
    player.setVelocityX(80);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-80);
  } else if (cursors.down.isDown) {
    player.setVelocityY(80);
  }

  // 循环地图效果：检测边界并从对侧出现
  let wrapped = false;

  // 左右边界循环
  if (player.x < -player.width / 2) {
    player.x = config.width + player.width / 2;
    wrapped = true;
  } else if (player.x > config.width + player.width / 2) {
    player.x = -player.width / 2;
    wrapped = true;
  }

  // 上下边界循环
  if (player.y < -player.height / 2) {
    player.y = config.height + player.height / 2;
    wrapped = true;
  } else if (player.y > config.height + player.height / 2) {
    player.y = -player.height / 2;
    wrapped = true;
  }

  // 更新穿越计数
  if (wrapped) {
    wrapCount++;
    wrapText.setText('Wrap Count: ' + wrapCount);
  }
}

new Phaser.Game(config);