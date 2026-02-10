const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态信号变量
let platformBounces = 0; // 平台反弹次数
let playerOnPlatform = false; // 玩家是否在平台上
let playerPositionX = 0; // 玩家X位置

let player;
let platform;
let cursors;
let ground;

function preload() {
  // 创建平台纹理（绿色）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00ff00, 1);
  platformGraphics.fillRect(0, 0, 150, 20);
  platformGraphics.generateTexture('platform', 150, 20);
  platformGraphics.destroy();

  // 创建玩家纹理（蓝色）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建地面纹理（灰色）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x808080, 1);
  groundGraphics.fillRect(0, 0, 800, 40);
  groundGraphics.generateTexture('ground', 800, 40);
  groundGraphics.destroy();
}

function create() {
  // 添加文本显示状态
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建地面
  ground = this.physics.add.sprite(400, 580, 'ground');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建移动平台
  platform = this.physics.add.sprite(200, 350, 'platform');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.body.setVelocityX(200); // 初始速度向右200
  
  // 设置平台的移动范围
  platform.minX = 100;
  platform.maxX = 700;

  // 创建玩家
  player = this.physics.add.sprite(400, 200, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, ground);
  
  // 平台与玩家的碰撞，确保玩家能站在平台上
  this.physics.add.collider(player, platform, function() {
    playerOnPlatform = true;
  });

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文字
  this.add.text(400, 50, '使用方向键移动和跳跃\n站在绿色平台上体验移动', {
    fontSize: '18px',
    fill: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

function update() {
  // 重置平台状态标记
  playerOnPlatform = false;

  // 平台移动逻辑 - 检查边界并反转速度
  if (platform.x <= platform.minX) {
    platform.x = platform.minX;
    platform.body.setVelocityX(200); // 向右移动
    platformBounces++;
  } else if (platform.x >= platform.maxX) {
    platform.x = platform.maxX;
    platform.body.setVelocityX(-200); // 向左移动
    platformBounces++;
  }

  // 玩家控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃（只能在地面或平台上跳跃）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-350);
  }

  // 检测玩家是否站在平台上
  if (player.body.touching.down && platform.body.touching.up) {
    const overlapX = Math.abs(player.x - platform.x);
    const overlapThreshold = (player.width + platform.width) / 2;
    
    if (overlapX < overlapThreshold) {
      playerOnPlatform = true;
      
      // 如果玩家没有主动移动，让玩家跟随平台移动
      if (!cursors.left.isDown && !cursors.right.isDown) {
        player.x += platform.body.velocity.x * (1/60); // 假设60fps
      }
    }
  }

  // 更新玩家位置状态
  playerPositionX = Math.round(player.x);

  // 更新状态显示
  this.statusText.setText([
    `平台反弹次数: ${platformBounces}`,
    `玩家X坐标: ${playerPositionX}`,
    `玩家在平台上: ${playerOnPlatform ? '是' : '否'}`,
    `平台速度: ${platform.body.velocity.x > 0 ? '向右' : '向左'} ${Math.abs(platform.body.velocity.x)}`
  ]);
}

const game = new Phaser.Game(config);