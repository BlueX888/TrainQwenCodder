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
let wrapCount = 0; // 状态信号：记录穿越边界次数
let wrapText;

function preload() {
  // 使用 Graphics 生成橙色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillCircle(16, 16, 16); // 绘制圆形
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建橙色玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 允许移出边界
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });
  
  wrapText = this.add.text(10, 35, 'Wrap Count: 0', {
    fontSize: '16px',
    fill: '#ffaa00'
  });
  
  // 添加边界指示线
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00, 0.5);
  graphics.strokeRect(0, 0, 800, 600);
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 键盘控制移动
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
  let wrapped = false;
  
  // 水平边界检测
  if (player.x > config.width + player.width / 2) {
    player.x = -player.width / 2;
    wrapped = true;
  } else if (player.x < -player.width / 2) {
    player.x = config.width + player.width / 2;
    wrapped = true;
  }
  
  // 垂直边界检测
  if (player.y > config.height + player.height / 2) {
    player.y = -player.height / 2;
    wrapped = true;
  } else if (player.y < -player.height / 2) {
    player.y = config.height + player.height / 2;
    wrapped = true;
  }
  
  // 更新穿越计数
  if (wrapped) {
    wrapCount++;
    wrapText.setText('Wrap Count: ' + wrapCount);
  }
}

new Phaser.Game(config);