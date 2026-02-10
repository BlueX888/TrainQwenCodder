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

// 状态变量
let player;
let enemy;
let hitCount = 0; // 受伤次数
let isHurt = false; // 是否正在受伤状态
let hurtEndTime = 0; // 受伤结束时间
let statusText;
let blinkTween;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（绿色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ff00, 1);
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建敌人（移动的敌人）
  enemy = this.physics.add.sprite(200, 300, 'enemy');
  enemy.setVelocity(150, 100);
  enemy.setBounce(1, 1);
  enemy.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 添加键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();

  // 状态文本
  statusText = this.add.text(10, 10, 'Hit Count: 0\nStatus: Normal', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 10 }
  });
}

function update(time, delta) {
  // 玩家移动控制
  if (!isHurt) {
    player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      player.setVelocityX(200);
    }

    if (this.cursors.up.isDown) {
      player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      player.setVelocityY(200);
    }
  }

  // 检查受伤状态是否结束
  if (isHurt && time >= hurtEndTime) {
    endHurtEffect.call(this);
  }

  // 更新状态文本
  const remainingTime = isHurt ? Math.max(0, (hurtEndTime - time) / 1000).toFixed(1) : 0;
  statusText.setText(
    `Hit Count: ${hitCount}\n` +
    `Status: ${isHurt ? `Hurt (${remainingTime}s)` : 'Normal'}\n` +
    `Player Pos: (${Math.floor(player.x)}, ${Math.floor(player.y)})`
  );
}

function handleCollision(player, enemy) {
  // 如果已经在受伤状态，不再触发新的受伤效果
  if (isHurt) {
    return;
  }

  // 增加受伤次数
  hitCount++;
  isHurt = true;

  // 计算击退方向
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  const knockbackSpeed = 120;
  const knockbackDistance = 150; // 击退距离

  // 计算击退目标位置
  const targetX = player.x + Math.cos(angle) * knockbackDistance;
  const targetY = player.y + Math.sin(angle) * knockbackDistance;

  // 限制在世界边界内
  const clampedX = Phaser.Math.Clamp(targetX, 20, 780);
  const clampedY = Phaser.Math.Clamp(targetY, 20, 580);

  // 停止玩家当前速度
  player.setVelocity(0, 0);

  // 创建击退动画
  this.tweens.add({
    targets: player,
    x: clampedX,
    y: clampedY,
    duration: 300,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      player.setVelocity(0, 0);
    }
  });

  // 创建红色闪烁效果
  startBlinkEffect.call(this, player);

  // 设置受伤结束时间（3秒后）
  hurtEndTime = this.time.now + 3000;
}

function startBlinkEffect(target) {
  // 保存原始颜色
  const originalTint = target.tint;

  // 创建闪烁动画
  blinkTween = this.tweens.add({
    targets: target,
    alpha: 0.3,
    duration: 150,
    yoyo: true,
    repeat: -1, // 无限重复
    onUpdate: () => {
      // 在闪烁时设置红色
      target.setTint(0xff0000);
    }
  });
}

function endHurtEffect() {
  isHurt = false;

  // 停止闪烁动画
  if (blinkTween) {
    blinkTween.stop();
    blinkTween = null;
  }

  // 恢复正常状态
  player.setAlpha(1);
  player.clearTint();
  player.setVelocity(0, 0);
}

// 启动游戏
const game = new Phaser.Game(config);