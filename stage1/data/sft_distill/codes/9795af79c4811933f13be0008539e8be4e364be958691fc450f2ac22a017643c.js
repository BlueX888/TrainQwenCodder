// 完整的 Phaser3 角色受伤效果示例
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

// 全局信号对象用于验证
window.__signals__ = {
  hitCount: 0,
  playerHealth: 100,
  lastHitTime: 0,
  knockbackDistance: 0,
  isInvulnerable: false,
  events: []
};

let player;
let enemy;
let cursors;
let isHurt = false;
let flashTimer = null;
let invulnerableTimer = null;

function preload() {
  // 使用 Graphics 创建玩家纹理（白色方块）
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();

  // 创建敌人纹理（红色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.originalTint = 0xffffff;

  // 创建敌人（可移动）
  enemy = this.physics.add.sprite(200, 300, 'enemy');
  enemy.setVelocity(100, 50);
  enemy.setBounce(1, 1);
  enemy.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文本
  this.add.text(10, 10, 'Use Arrow Keys to Move\nCollide with Red Enemy to Test Hurt Effect', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加状态显示
  this.statusText = this.add.text(10, 550, '', {
    fontSize: '14px',
    fill: '#00ff00'
  });
}

function update() {
  // 更新状态文本
  this.statusText.setText(
    `Health: ${window.__signals__.playerHealth} | ` +
    `Hits: ${window.__signals__.hitCount} | ` +
    `Invulnerable: ${window.__signals__.isInvulnerable}`
  );

  // 玩家移动（受伤时不能移动）
  if (!isHurt) {
    player.setVelocity(0);

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
  }
}

function handleCollision(player, enemy) {
  // 如果正在受伤状态（无敌时间），不触发新的受伤
  if (isHurt) {
    return;
  }

  // 标记受伤状态
  isHurt = true;
  window.__signals__.isInvulnerable = true;
  window.__signals__.hitCount++;
  window.__signals__.playerHealth -= 10;
  window.__signals__.lastHitTime = Date.now();

  // 计算击退方向（从敌人指向玩家）
  const angle = Phaser.Math.Angle.Between(
    enemy.x, enemy.y,
    player.x, player.y
  );

  // 击退距离：基于速度80计算（速度80 -> 击退距离约120像素）
  const knockbackDistance = 120;
  const knockbackX = Math.cos(angle) * knockbackDistance;
  const knockbackY = Math.sin(angle) * knockbackDistance;

  window.__signals__.knockbackDistance = knockbackDistance;

  // 记录事件
  window.__signals__.events.push({
    type: 'hit',
    time: Date.now(),
    position: { x: player.x, y: player.y },
    knockback: { x: knockbackX, y: knockbackY }
  });

  // 停止玩家当前速度
  player.setVelocity(0);

  // 击退动画（使用 Tween，持续约0.3秒）
  this.tweens.add({
    targets: player,
    x: player.x + knockbackX,
    y: player.y + knockbackY,
    duration: 300,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      player.setVelocity(0);
    }
  });

  // 白色闪烁效果（1秒内闪烁5次）
  let flashCount = 0;
  const maxFlashes = 10; // 5次闪烁 = 10次颜色切换
  const flashInterval = 100; // 每100ms切换一次

  flashTimer = this.time.addEvent({
    delay: flashInterval,
    callback: () => {
      flashCount++;
      
      // 交替白色和原色
      if (flashCount % 2 === 0) {
        player.setTint(0xffffff); // 白色
      } else {
        player.clearTint(); // 原色
      }

      // 闪烁结束
      if (flashCount >= maxFlashes) {
        player.clearTint();
        flashTimer.destroy();
        flashTimer = null;
      }
    },
    loop: true
  });

  // 1秒无敌时间
  invulnerableTimer = this.time.delayedCall(1000, () => {
    isHurt = false;
    window.__signals__.isInvulnerable = false;
    player.clearTint();
    
    // 清理闪烁计时器（如果还在运行）
    if (flashTimer) {
      flashTimer.destroy();
      flashTimer = null;
    }

    window.__signals__.events.push({
      type: 'recover',
      time: Date.now()
    });
  });

  console.log('Player Hit!', {
    hitCount: window.__signals__.hitCount,
    health: window.__signals__.playerHealth,
    knockback: { x: knockbackX, y: knockbackY }
  });
}

// 启动游戏
new Phaser.Game(config);