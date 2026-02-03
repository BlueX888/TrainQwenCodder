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
let hitCount = 0; // 可验证状态：受伤次数
let isInvincible = false; // 无敌状态
let statusText;

function preload() {
  // 创建蓝色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0066ff, 1);
  playerGraphics.fillCircle(20, 20, 20);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建红色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家（蓝色圆形）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.health = 100;

  // 创建敌人（红色方块）
  enemy = this.physics.add.sprite(200, 200, 'enemy');
  enemy.setVelocity(150, 100);
  enemy.setBounce(1);
  enemy.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleHit, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  updateStatusText();
}

function update() {
  // 玩家移动控制
  if (!isInvincible || player.body) {
    const speed = 200;
    player.setVelocity(0);

    if (cursors.left.isDown) {
      player.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      player.setVelocityX(speed);
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      player.setVelocityY(speed);
    }
  }

  updateStatusText();
}

function handleHit(player, enemy) {
  // 如果已经处于无敌状态，不触发受伤
  if (isInvincible) {
    return;
  }

  // 增加受伤计数
  hitCount++;
  player.health -= 10;

  // 设置无敌状态
  isInvincible = true;

  // 计算击退方向（从敌人指向玩家）
  const angle = Phaser.Math.Angle.Between(
    enemy.x,
    enemy.y,
    player.x,
    player.y
  );

  // 击退距离基于速度360计算（这里使用速度的60%作为击退距离）
  const knockbackSpeed = 360;
  const knockbackDistance = knockbackSpeed * 0.6; // 约216像素
  const knockbackDuration = 300; // 击退持续时间（毫秒）

  // 计算击退目标位置
  const targetX = player.x + Math.cos(angle) * knockbackDistance;
  const targetY = player.y + Math.sin(angle) * knockbackDistance;

  // 停止玩家当前速度
  player.setVelocity(0);

  // 击退动画
  player.scene.tweens.add({
    targets: player,
    x: targetX,
    y: targetY,
    duration: knockbackDuration,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      player.setVelocity(0);
    }
  });

  // 闪烁效果（1秒内闪烁5次）
  const blinkCount = 5;
  const blinkDuration = 1000;
  const blinkInterval = blinkDuration / (blinkCount * 2);

  let blinkTween = player.scene.tweens.add({
    targets: player,
    alpha: 0.3,
    duration: blinkInterval,
    yoyo: true,
    repeat: blinkCount * 2 - 1,
    onComplete: () => {
      player.alpha = 1;
      isInvincible = false;
    }
  });

  // 更新状态显示
  updateStatusText();
}

function updateStatusText() {
  statusText.setText([
    `Hit Count: ${hitCount}`,
    `Health: ${player.health}`,
    `Invincible: ${isInvincible ? 'YES' : 'NO'}`,
    `Position: (${Math.round(player.x)}, ${Math.round(player.y)})`,
    '',
    'Use Arrow Keys to Move',
    'Avoid the Red Enemy!'
  ]);
}

new Phaser.Game(config);