// 完整的 Phaser3 代码 - 角色受伤效果系统
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
let enemy;
let cursors;
let isHurt = false; // 受伤状态标记
let health = 100; // 可验证的状态信号
let healthText;
let statusText;

function preload() {
  // 创建橙色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xff6600, 1); // 橙色
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建红色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1); // 红色
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家角色（橙色）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(40, 40);

  // 创建敌人角色（红色）
  enemy = this.physics.add.sprite(600, 300, 'enemy');
  enemy.setCollideWorldBounds(true);
  enemy.body.setSize(40, 40);
  
  // 让敌人左右移动
  enemy.setVelocityX(-100);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 显示生命值
  healthText = this.add.text(16, 16, `Health: ${health}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 状态提示文本
  statusText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    fill: '#00ff00',
    fontFamily: 'Arial'
  });

  // 添加说明文本
  this.add.text(400, 550, 'Collide with red enemy to trigger hurt effect', {
    fontSize: '16px',
    fill: '#ffff00',
    fontFamily: 'Arial',
    align: 'center'
  }).setOrigin(0.5);
}

function update() {
  // 玩家移动控制（仅在非受伤状态下可控制）
  if (!isHurt) {
    player.setVelocity(0);

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
  }

  // 敌人简单AI - 左右移动
  if (enemy.x <= 500) {
    enemy.setVelocityX(100);
  } else if (enemy.x >= 700) {
    enemy.setVelocityX(-100);
  }

  // 更新生命值显示
  healthText.setText(`Health: ${health}`);
}

function handleCollision(player, enemy) {
  // 如果已经在受伤状态，不重复触发
  if (isHurt) {
    return;
  }

  // 标记为受伤状态
  isHurt = true;
  health -= 10; // 减少生命值

  // 更新状态文本
  statusText.setText('HURT! Knockback & Flashing...');
  statusText.setColor('#ff0000');

  // 计算击退方向（从敌人指向玩家）
  const angle = Phaser.Math.Angle.Between(
    enemy.x, 
    enemy.y, 
    player.x, 
    player.y
  );

  // 击退速度 160，计算击退距离
  const knockbackSpeed = 160;
  const knockbackDuration = 300; // 击退持续时间 300ms
  const knockbackDistance = (knockbackSpeed * knockbackDuration) / 1000;

  // 计算击退目标位置
  const knockbackX = Math.cos(angle) * knockbackDistance;
  const knockbackY = Math.sin(angle) * knockbackDistance;

  // 应用击退速度
  player.setVelocity(
    Math.cos(angle) * knockbackSpeed,
    Math.sin(angle) * knockbackSpeed
  );

  // 击退缓动效果 - 逐渐减速
  this.tweens.add({
    targets: player.body.velocity,
    x: 0,
    y: 0,
    duration: knockbackDuration,
    ease: 'Power2'
  });

  // 闪烁效果 - 1.5秒内快速切换透明度
  const blinkTween = this.tweens.add({
    targets: player,
    alpha: 0.3,
    duration: 100, // 每次闪烁 100ms
    yoyo: true,
    repeat: 14, // 重复14次，总共约1.5秒 (100ms * 2 * 15 = 3000ms，但实际约1.5秒)
    onComplete: () => {
      // 闪烁结束，恢复正常状态
      player.alpha = 1;
      isHurt = false;
      statusText.setText('Use Arrow Keys to Move');
      statusText.setColor('#00ff00');
    }
  });

  // 添加受伤特效 - 红色闪光
  const hurtFlash = this.add.graphics();
  hurtFlash.fillStyle(0xff0000, 0.5);
  hurtFlash.fillCircle(player.x, player.y, 50);
  
  this.tweens.add({
    targets: hurtFlash,
    alpha: 0,
    scale: 2,
    duration: 500,
    onComplete: () => {
      hurtFlash.destroy();
    }
  });

  // 如果生命值耗尽
  if (health <= 0) {
    statusText.setText('GAME OVER!');
    statusText.setColor('#ff0000');
    this.physics.pause();
    player.setTint(0x808080);
  }
}

// 启动游戏
const game = new Phaser.Game(config);