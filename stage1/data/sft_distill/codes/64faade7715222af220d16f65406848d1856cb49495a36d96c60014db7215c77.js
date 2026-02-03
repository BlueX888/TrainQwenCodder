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
let crossBorderCount = 0; // 状态信号：穿越边界次数
let statusText;

function preload() {
  // 使用 Graphics 创建绿色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(16, 16, 16);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  statusText = this.add.text(10, 10, 'Border Crosses: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  // 添加提示文本
  this.add.text(400, 30, 'Use Arrow Keys to Move (Speed: 240)', {
    fontSize: '16px',
    fill: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);
  
  // 绘制边界参考线
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(2, 0xffffff, 0.3);
  borderGraphics.strokeRect(0, 0, 800, 600);
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 处理键盘输入
  if (cursors.left.isDown) {
    player.setVelocityX(-240);
  } else if (cursors.right.isDown) {
    player.setVelocityX(240);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-240);
  } else if (cursors.down.isDown) {
    player.setVelocityY(240);
  }
  
  // 对角线移动时标准化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(240);
  }
  
  // 循环地图效果：检测边界并从对侧出现
  const margin = 16; // 玩家半径
  let wrapped = false;
  
  // 左右边界
  if (player.x < -margin) {
    player.x = config.width + margin;
    wrapped = true;
  } else if (player.x > config.width + margin) {
    player.x = -margin;
    wrapped = true;
  }
  
  // 上下边界
  if (player.y < -margin) {
    player.y = config.height + margin;
    wrapped = true;
  } else if (player.y > config.height + margin) {
    player.y = -margin;
    wrapped = true;
  }
  
  // 更新穿越计数
  if (wrapped) {
    crossBorderCount++;
    statusText.setText('Border Crosses: ' + crossBorderCount);
  }
}

const game = new Phaser.Game(config);