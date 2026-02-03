// 平台跳跃游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 游戏状态变量
let player;
let platforms;
let cursors;
let spaceKey;
let gameState = {
  jumpCount: 0,        // 跳跃次数
  isOnGround: false,   // 是否在地面
  score: 0,            // 分数（可扩展）
  moveDistance: 0      // 移动距离
};

function preload() {
  // 使用 Graphics 创建角色纹理
  const graphics = this.add.graphics();
  
  // 创建玩家纹理（蓝色方块）
  graphics.fillStyle(0x0066ff, 1);
  graphics.fillRect(0, 0, 32, 48);
  graphics.generateTexture('player', 32, 48);
  graphics.clear();
  
  // 创建平台纹理（绿色）
  graphics.fillStyle(0x00aa00, 1);
  graphics.fillRect(0, 0, 400, 32);
  graphics.generateTexture('ground', 400, 32);
  graphics.clear();
  
  // 创建小平台纹理（棕色）
  graphics.fillStyle(0x8B4513, 1);
  graphics.fillRect(0, 0, 200, 24);
  graphics.generateTexture('platform', 200, 24);
  
  graphics.destroy();
}

function create() {
  // 创建静态平台组
  platforms = this.physics.add.staticGroup();
  
  // 添加地面
  platforms.create(400, 584, 'ground').setScale(2).refreshBody();
  
  // 添加几个悬浮平台
  platforms.create(600, 450, 'platform');
  platforms.create(50, 350, 'platform');
  platforms.create(750, 300, 'platform');
  platforms.create(400, 200, 'platform');
  
  // 创建玩家
  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);
  
  // 设置玩家与平台的碰撞
  this.physics.add.collider(player, platforms, () => {
    // 碰撞回调：检测是否在地面
    if (player.body.touching.down) {
      gameState.isOnGround = true;
    }
  });
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 添加状态显示文本
  this.statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });
  
  // 添加控制说明
  this.add.text(16, 560, '← → 移动 | 空格/↑ 跳跃', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 8, y: 4 }
  });
  
  console.log('游戏初始化完成 - 重力: 600, 移动速度: 200');
}

function update() {
  // 重置地面状态
  if (!player.body.touching.down) {
    gameState.isOnGround = false;
  }
  
  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
    gameState.moveDistance += 2;
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
    gameState.moveDistance += 2;
  } else {
    player.setVelocityX(0);
  }
  
  // 跳跃逻辑（空格键或上方向键）
  if ((Phaser.Input.Keyboard.JustDown(spaceKey) || 
       Phaser.Input.Keyboard.JustDown(cursors.up)) && 
      gameState.isOnGround) {
    player.setVelocityY(-400);
    gameState.jumpCount++;
    gameState.isOnGround = false;
    console.log(`跳跃！总跳跃次数: ${gameState.jumpCount}`);
  }
  
  // 更新状态显示
  this.statusText.setText([
    `跳跃次数: ${gameState.jumpCount}`,
    `在地面: ${gameState.isOnGround ? '是' : '否'}`,
    `移动距离: ${Math.floor(gameState.moveDistance)}`,
    `位置: (${Math.floor(player.x)}, ${Math.floor(player.y)})`,
    `速度: (${Math.floor(player.body.velocity.x)}, ${Math.floor(player.body.velocity.y)})`
  ]);
  
  // 验证物理参数
  if (Math.abs(player.body.velocity.x) > 0 && Math.abs(player.body.velocity.x) !== 200) {
    console.warn('移动速度异常:', player.body.velocity.x);
  }
}

// 启动游戏
const game = new Phaser.Game(config);