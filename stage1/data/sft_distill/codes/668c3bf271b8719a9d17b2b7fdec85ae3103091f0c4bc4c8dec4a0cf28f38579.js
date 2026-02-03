const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
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
let ground;
let cursors;
let spaceKey;
let jumpCount = 0; // 当前已跳跃次数
let maxJumps = 2; // 最大跳跃次数
let statusText;
let jumpCountText;
let totalJumps = 0; // 总跳跃次数（可验证状态）

function preload() {
  // 创建角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 48);
  graphics.generateTexture('player', 32, 48);
  graphics.destroy();

  // 创建地面纹理
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x8B4513, 1);
  groundGraphics.fillRect(0, 0, 800, 50);
  groundGraphics.generateTexture('ground', 800, 50);
  groundGraphics.destroy();
}

function create() {
  // 创建地面
  ground = this.physics.add.staticSprite(400, 575, 'ground');
  ground.setDisplayOrigin(0.5, 0.5);
  ground.refreshBody();

  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setBounce(0);

  // 添加碰撞检测
  this.physics.add.collider(player, ground, onLanding, null, this);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 监听空格键按下事件
  spaceKey.on('down', () => {
    handleJump();
  });

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '20px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  jumpCountText = this.add.text(16, 50, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 90, '按空格键跳跃（可双跳）', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update() {
  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
  } else {
    player.setVelocityX(0);
  }

  updateStatusText();
}

function handleJump() {
  // 检查是否还能跳跃
  if (jumpCount < maxJumps) {
    player.setVelocityY(-320); // 跳跃力度120对应速度约-320
    jumpCount++;
    totalJumps++;
    
    console.log(`跳跃 ${jumpCount}/${maxJumps}, 总跳跃次数: ${totalJumps}`);
  }
}

function onLanding(player, ground) {
  // 角色着地时重置跳跃次数
  if (player.body.touching.down && ground.body.touching.up) {
    if (jumpCount > 0) {
      jumpCount = 0;
      console.log('着地，跳跃次数已重置');
    }
  }
}

function updateStatusText() {
  const isOnGround = player.body.touching.down;
  const remainingJumps = maxJumps - jumpCount;
  
  statusText.setText(`状态: ${isOnGround ? '着地' : '空中'} | 剩余跳跃: ${remainingJumps}/${maxJumps}`);
  jumpCountText.setText(`总跳跃次数: ${totalJumps} | 当前已跳: ${jumpCount}`);
}

new Phaser.Game(config);