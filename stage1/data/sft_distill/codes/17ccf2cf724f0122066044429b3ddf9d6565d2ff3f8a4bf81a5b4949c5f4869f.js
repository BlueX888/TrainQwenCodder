// Phaser3 配置
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

// 全局变量
let player;
let cursors;
let crossCount = 0; // 穿越边界次数（状态验证信号）
let crossText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();

  // 创建玩家精灵（物理对象）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示穿越次数文本
  crossText = this.add.text(16, 16, 'Border Crosses: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  // 显示控制提示
  this.add.text(16, 50, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
  
  // 显示速度信息
  this.add.text(16, 75, 'Speed: 200', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 处理键盘输入
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  }
  
  // 处理对角线移动时的速度归一化
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.setVelocity(
      player.body.velocity.x * 0.7071,
      player.body.velocity.y * 0.7071
    );
  }
  
  // 循环地图效果 - 检测边界并从对侧出现
  const playerWidth = player.width;
  const playerHeight = player.height;
  
  // 左边界 -> 右边界
  if (player.x < -playerWidth / 2) {
    player.x = config.width + playerWidth / 2;
    crossCount++;
    updateCrossText();
  }
  
  // 右边界 -> 左边界
  if (player.x > config.width + playerWidth / 2) {
    player.x = -playerWidth / 2;
    crossCount++;
    updateCrossText();
  }
  
  // 上边界 -> 下边界
  if (player.y < -playerHeight / 2) {
    player.y = config.height + playerHeight / 2;
    crossCount++;
    updateCrossText();
  }
  
  // 下边界 -> 上边界
  if (player.y > config.height + playerHeight / 2) {
    player.y = -playerHeight / 2;
    crossCount++;
    updateCrossText();
  }
}

// 更新穿越次数显示
function updateCrossText() {
  crossText.setText('Border Crosses: ' + crossCount);
}

// 启动游戏
new Phaser.Game(config);